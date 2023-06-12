import { EnumColumn } from "src/decorators";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordPermissionFlag, DiscordOverwriteType } from "src/enums";
import { Flags } from "src/transformers";
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("PermissionOverwrite", { schema: "discord" })
@Index(["roleId", "userId", "guildId", "channelId"], { unique: true })
export class DiscordPermissionOverwrite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { nullable: true })
  roleId?: string;

  @Column("varchar", { nullable: true })
  userId?: string;

  @Column("varchar")
  guildId: string;

  @Column("varchar")
  channelId: string;

  @EnumColumn({ DiscordOverwriteType })
  type: DiscordOverwriteType;

  @Column("varchar", { transformer: Flags.transformer(true) })
  allow: Flags<DiscordPermissionFlag>;

  @Column("varchar", { transformer: Flags.transformer(true) })
  deny: Flags<DiscordPermissionFlag>;

  @ManyToOne(() => DiscordGuild, guild => guild.permissionOverwrites)
  @JoinColumn({ name: "guildId", referencedColumnName: "id" })
  guild: DiscordGuild;

  @ManyToOne(() => DiscordChannel, channel => channel.permissionOverwrites)
  @JoinColumn([
    { name: "guildId", referencedColumnName: "guildId" },
    { name: "channelId", referencedColumnName: "id" },
  ])
  channel: DiscordChannel;

  @ManyToOne(() => DiscordRole, role => role.permissionOverwrites, {
    nullable: true,
  })
  @JoinColumn({ name: "roleId", referencedColumnName: "id" })
  role?: DiscordRole;

  @ManyToOne(() => DiscordGuildMember, member => member.permissionOverwrites, {
    nullable: true,
  })
  @JoinColumn([
    { name: "guildId", referencedColumnName: "guildId" },
    { name: "userId", referencedColumnName: "userId" },
  ])
  member?: DiscordGuildMember;
}
