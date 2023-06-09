import { EnumColumn } from "src/decorators/enum";
import { DiscordEmoji } from "src/entities/discord/discord-emoji";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordUser } from "src/entities/discord/discord-user";
import { DiscordDefaultMessageNotificationLevel } from "src/enums/discord-default-message-notification-level";
import { DiscordExplicitContentFilterLevel } from "src/enums/discord-explicit-content-filter-level";
import { DiscordGuildFeature } from "src/enums/discord-guild-feature";
import { DiscordLocale } from "src/enums/discord-locale";
import { DiscordMfaLevel } from "src/enums/discord-mfa-level";
import { DiscordPermissionFlag } from "src/enums/discord-permission-flag";
import { DiscordGuildPremiumTier } from "src/enums/discord-guild-premium-tier";
import { DiscordSystemChannelFlag } from "src/enums/discord-system-channel-flag";
import { DiscordVerificationLevel } from "src/enums/discord-verification-level";
import { Flags } from "src/transformers/flag";
import {
  BaseEntity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

export class DiscordGuild extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  name: string;

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
  owner: DiscordUser;

  @OneToMany(() => DiscordGuildMember, member => member.guild)
  members: DiscordGuildMember[];

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.guild)
  permissionOverwrites: DiscordPermissionOverwrite[];
}
