import { EnumColumn } from "src/decorators/enum";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordRole } from "src/entities/discord/discord-role";
import { PermissionFlag } from "src/enums";
import { OverwriteType } from "src/enums/overwrite-type";
import { Flags } from "src/transformers/flag";
import {
  BaseEntity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

export class DiscordPermissionOverwrite extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @PrimaryColumn("varchar")
  guildId: string;

  @PrimaryColumn("varchar")
  channelId: string;

  @EnumColumn(OverwriteType)
  type: OverwriteType;

  @Column("varchar", { transformer: Flags.transformer(true) })
  allow: Flags<PermissionFlag>;

  @Column("varchar", { transformer: Flags.transformer(true) })
  deny: Flags<PermissionFlag>;

  @ManyToOne(() => DiscordGuild, guild => guild.permissionOverwrites)
  @JoinColumn({ name: "guildId" })
  guild: DiscordGuild;

  @ManyToOne(() => DiscordChannel, channel => channel.permissionOverwrites)
  @JoinColumn({ name: "channelId" })
  channel: DiscordChannel;

  @ManyToOne(() => DiscordRole, role => role.permissionOverwrites, {
    nullable: true,
  })
  @JoinColumn({ name: "id" })
  role?: DiscordRole;

  @ManyToOne(() => DiscordGuildMember, member => member.permissionOverwrites, {
    nullable: true,
  })
  @JoinColumn({ name: "id" })
  member?: DiscordGuildMember;
}
