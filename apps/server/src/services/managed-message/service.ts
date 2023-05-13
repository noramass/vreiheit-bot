import { Param } from "@propero/easy-api";
import { dataSource, ManagedMessage } from "@vreiheit/database";
import { Injectable } from "src/mount";
import { Repository } from "typeorm";

@Injectable()
export class ManagedMessageService {
  get repo(): Repository<ManagedMessage> {
    return dataSource.getRepository(ManagedMessage);
  }

  findAndCountByGuildId(
    @Param("guildId") guildId?: string,
  ): Promise<[ManagedMessage[], number]> {
    return this.repo.findAndCount({
      where: {
        guild: guildId && { discordId: guildId },
      },
    });
  }

  async createMessage(
    guildId: string,
    tag: string,
    content?: string,
    type?: "embed" | "plain",
  ) {
    // TODO: NYI
    console.log("create message", guildId, tag, content, type);
  }

  async updateMessage(
    guildId: string,
    tag: string,
    content?: string,
    type?: "embed" | "plain",
  ) {
    // TODO: NYI
    console.log("create message", guildId, tag, content, type);
  }

  async deleteMessage(guildId: string, tag: string) {
    await this.repo.delete({ tag, guild: { discordId: guildId } });
  }
}
