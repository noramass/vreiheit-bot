import { EnumColumn } from "src/decorators/enum";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordPermissionFlag } from "src/enums";
import { DiscordOverwriteType } from "src/enums/discord-overwrite-type";
import { Flags } from "src/transformers/flag";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("PermissionOverwrite", { schema: "discord" })
export class DiscordPermissionOverwrite extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @PrimaryColumn("varchar")
  guildId: string;

  @PrimaryColumn("varchar")
  channelId: string;

  @EnumColumn({ DiscordOverwriteType })
  type: DiscordOverwriteType;

  @Column("varchar", { transformer: Flags.transformer(true) })
  allow: Flags<DiscordPermissionFlag>;

  @Column("varchar", { transformer: Flags.transformer(true) })
  deny: Flags<DiscordPermissionFlag>;

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
