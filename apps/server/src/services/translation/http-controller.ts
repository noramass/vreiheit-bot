import {
  Body,
  Delete,
  Get,
  intParser,
  Param,
  Parser,
  Post,
  Put,
  Query,
} from "@propero/easy-api";
import { Server, Translation } from "@vreiheit/database";
import { UserGuilds, UserPermissions } from "src/decorators/user-guilds";
import { HttpController, Init, Inject } from "src/mount";
import { In, Repository } from "typeorm";

@HttpController("/translations")
export class TranslationHttpController {
  @Inject("translation-repo")
  repo: Repository<Translation>;

  @Get("/")
  async onList(
    @UserGuilds guilds: Server[],
    @Query("take", intParser()) take: number = 50,
    @Query("skip", intParser()) skip: number = 0,
    @Query("tags", splitParser()) tags: string[],
    @Query("guild") guild?: string,
  ) {
    if (guild && !guilds.find(it => it.discordId === guild))
      return { status: 401, data: "Unauthorized" };
    const ids = guilds.map(({ uuid }) => uuid);
    const [items, total] = await this.repo.findAndCount({
      where: { guild: { uuid: In(ids), discordId: guild }, tags: In(tags) },
      take,
      skip,
      select: {
        key: true,
        translations: true as any,
        tags: true,
        guild: { discordId: true },
      },
    });
    return {
      status: 200,
      data: { items, total, take, skip, tags, guild },
    };
  }

  @Put("/:guild/:key")
  async onUpdate(
    @UserPermissions("ManageMessages") permissions: Record<string, boolean>,
    @Param("guild") guild: string,
    @Param("key") key: string,
    @Body() translations: Record<string, string>,
  ) {
    if (!permissions[guild]) return { status: 401, data: "Unauthorized" };
    await this.repo.update(
      { guild: { discordId: guild }, key },
      { translations },
    );
    return { status: 200, data: { success: true } };
  }

  @Post("/:guild/:key")
  async onCreate(
    @UserPermissions("ManageMessages") permissions: Record<string, boolean>,
    @Param("guild") guild: string,
    @Param("key") key: string,
    @Query("tags", splitParser()) tags: string[],
    @Body() translations: Record<string, string>,
  ) {
    if (!permissions[guild]) return { status: 401, data: "Unauthorized" };
    const data = this.repo.create({
      guild: { discordId: guild },
      tags,
      key,
      translations,
    });
    await this.repo.save(data);
    return { status: 200, data };
  }

  @Delete("/:guild/:key")
  async onDelete(
    @UserPermissions("ManageMessages") permissions: Record<string, boolean>,
    @Param("guild") guild: string,
    @Param("key") key: string,
  ) {
    if (!permissions[guild]) return { status: 401, data: "Unauthorized" };
    await this.repo.delete({
      guild: { discordId: guild },
      key,
    });
    return { status: 200, data: { success: true } };
  }
}

function splitParser(delim = ";"): Parser<string[], string | undefined> {
  return value => (value ? value.split(delim).filter(it => it) : []);
}
