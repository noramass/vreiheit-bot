import { Get, Param, Service } from "@propero/easy-api";
import { dataSource, ManagedMessage, Server } from "@vreiheit/database";
import {
  OnInit,
  OnButton,
  DiscordService,
  ensureCommand,
} from "@vreiheit/discord";
import {
  ButtonInteraction,
  Client,
  PermissionsBitField,
  OAuth2Scopes,
} from "discord.js";
import { managedMessageCommand } from "./command";
import { UserGuilds } from "src/decorators/user-guilds";
import { Repository } from "typeorm";

@DiscordService("managed-message")
@Service("/managed-message")
export class ManagedMessageService {
  get repo(): Repository<ManagedMessage> {
    return dataSource.getRepository(ManagedMessage);
  }
  @OnInit
  async onInit(client: Client<true>) {
    console.log(
      client.generateInvite({
        permissions: [PermissionsBitField.All],
        scopes: [OAuth2Scopes.Bot],
      }),
    );

    await ensureCommand(client, managedMessageCommand());
  }

  @OnButton("my-button")
  async onButtonPress(button: ButtonInteraction, id: string, another: number) {}

  @Get("/:guildId?")
  async list(
    @UserGuilds userGuilds: Server[],
    @Param("guildId") guildId?: string,
  ) {
    console.log(userGuilds);
    const [items, count] = await this.repo.findAndCount({
      where: {
        guild: guildId && { discordId: guildId },
      },
    });
    return {
      data: {
        items,
        count,
      },
    };
  }
}
