import { EnumColumn } from "src/decorators";
import { DiscordAuditLogEntry } from "src/entities/discord/discord-audit-log-entry";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordMessage } from "src/entities/discord/discord-message";
import { DiscordEmoji } from "src/entities/discord/discord-emoji";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordSticker } from "src/entities/discord/discord-sticker";
import { DiscordUser } from "src/entities/discord/discord-user";
import {
  DiscordDefaultMessageNotificationLevel,
  DiscordExplicitContentFilterLevel,
  DiscordGuildFeature,
  DiscordLocale,
  DiscordMfaLevel,
  DiscordPermissionFlag,
  DiscordGuildPremiumTier,
  DiscordSystemChannelFlag,
  DiscordVerificationLevel,
} from "src/enums";
import { Flags } from "src/transformers";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

@Entity("Guild", { schema: "discord" })
export class DiscordGuild extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  name: string;

  @Column("varchar")
  ownerId: string;

  @Column("varchar", { nullable: true })
  icon?: string;

  @Column("varchar", { nullable: true })
  description?: string;

  @Column("varchar", { nullable: true })
  splash?: string;

  @Column("varchar", { nullable: true })
  discoverySplash?: string;

  @Column("varchar", { nullable: true })
  banner?: string;

  @Column("int")
  approximateMembers: number;

  @Column("int")
  approximateOnline: number;

  @Column("varchar", { nullable: true })
  region?: string;

  @EnumColumn({ DiscordLocale }, { nullable: true })
  preferredLocale?: DiscordLocale;

  @EnumColumn({ DiscordVerificationLevel })
  verificationLevel: DiscordVerificationLevel;

  @EnumColumn({ DiscordGuildFeature }, { array: true })
  features: DiscordGuildFeature[];

  @EnumColumn({ DiscordDefaultMessageNotificationLevel })
  defaultMessageNotificationLevel: DiscordDefaultMessageNotificationLevel;

  @EnumColumn({ DiscordMfaLevel })
  mfaLevel: DiscordMfaLevel;

  @EnumColumn({ DiscordExplicitContentFilterLevel })
  explicitContentFilterLevel: DiscordExplicitContentFilterLevel;

  @EnumColumn({ DiscordPremiumTier: DiscordGuildPremiumTier })
  premiumTier: DiscordGuildPremiumTier;

  @Column("int", { transformer: Flags.transformer() })
  systemChannelFlags: Flags<DiscordSystemChannelFlag>;

  @Column("varchar", { transformer: Flags.transformer(true) })
  botPermissions: Flags<DiscordPermissionFlag>;

  @OneToMany(() => DiscordEmoji, emoji => emoji.guild)
  emojis: DiscordEmoji[];

  @OneToMany(() => DiscordRole, role => role.guild)
  roles: DiscordRole[];

  @ManyToOne(() => DiscordUser, user => user.ownedGuilds)
  @JoinColumn({ name: "ownerId", referencedColumnName: "id" })
  owner: DiscordUser;

  @OneToMany(() => DiscordGuildMember, member => member.guild)
  members: DiscordGuildMember[];

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.guild)
  permissionOverwrites: DiscordPermissionOverwrite[];

  @OneToMany(() => DiscordSticker, sticker => sticker.guild)
  stickers: DiscordSticker[];

  @OneToMany(() => DiscordMessage, message => message.guild)
  messages: DiscordMessage[];

  @OneToMany(() => DiscordChannel, channel => channel.guild)
  channels: DiscordChannel[];

  @OneToMany(() => DiscordAuditLogEntry, entry => entry.guild)
  auditLogEntries: DiscordAuditLogEntry[];
}
