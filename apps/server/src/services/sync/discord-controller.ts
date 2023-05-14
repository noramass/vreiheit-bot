import { dataSource, Server } from "@vreiheit/database";
import {
  DiscordController,
  OnGuildCreate,
  OnGuildDelete,
  OnGuildUpdate,
  OnInit,
} from "@vreiheit/discord";
import { Client, Guild } from "discord.js";
import { Repository } from "typeorm";

@DiscordController()
export class SyncDiscordController {
  get repo(): Repository<Server> {
    return dataSource.getRepository(Server);
  }

  @OnInit
  async onInit(client: Client<true>) {
    const guilds = await client.guilds.fetch();
    for (const oAuthGuild of guilds.values()) {
      const guild = await oAuthGuild.fetch();
      await this.upsertGuild(guild);

      // TODO: sync roles
      // TODO: sync channels
      // TODO: sync members
      // TODO: sync audit events
    }
  }

  @OnGuildCreate
  onGuildCreate(guild: Guild) {
    return this.upsertGuild(guild);
  }

  @OnGuildUpdate
  onGuildUpdate(oldGuild: Guild, newGuild: Guild) {
    return this.upsertGuild(newGuild);
  }

  @OnGuildDelete
  onGuildDelete(guild: Guild) {
    return this.repo.upsert(
      {
        discordId: guild.id,
        leftAt: new Date(),
      },
      ["discordId"],
    );
  }

  async upsertGuild(guild: Guild) {
    const preview = await guild.fetchPreview();
    await this.repo.upsert(
      {
        discordId: guild.id,
        name: guild.name,
        icon: preview.iconURL(),
        splash: preview.splashURL(),
        description: preview.description,
      },
      ["discordId"],
    );
  }
}
