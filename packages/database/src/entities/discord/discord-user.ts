import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { BaseEntity, OneToMany, PrimaryColumn } from "typeorm";

export class DiscordUser extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @OneToMany(() => DiscordGuild, guild => guild.owner)
  ownedGuilds: DiscordGuild[];

  @OneToMany(() => DiscordGuildMember, member => member.user)
  members: DiscordGuildMember[];
}
