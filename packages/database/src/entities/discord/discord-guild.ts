import { EnumColumn } from "src/decorators/enum";
import { DiscordEmoji } from "src/entities/discord/discord-emoji";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordUser } from "src/entities/discord/discord-user";
import { DefaultMessageNotificationLevel } from "src/enums/default-message-notification-level";
import { ExplicitContentFilterLevel } from "src/enums/explicit-content-filter-level";
import { GuildFeature } from "src/enums/guild-feature";
import { Locale } from "src/enums/locale";
import { MFALevel } from "src/enums/mfa-level";
import { PermissionFlag } from "src/enums/permission-flag";
import { PremiumTier } from "src/enums/premium-tier";
import { SystemChannelFlag } from "src/enums/system-channel-flag";
import { VerificationLevel } from "src/enums/verification-level";
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

  @EnumColumn(Locale, { nullable: true })
  preferredLocale?: Locale;

  @EnumColumn(VerificationLevel)
  verificationLevel: VerificationLevel;

  @EnumColumn(GuildFeature, { array: true })
  features: GuildFeature[];

  @EnumColumn(DefaultMessageNotificationLevel)
  defaultMessageNotificationLevel: DefaultMessageNotificationLevel;

  @EnumColumn(MFALevel)
  mfaLevel: MFALevel;

  @EnumColumn(ExplicitContentFilterLevel)
  explicitContentFilterLevel: ExplicitContentFilterLevel;

  @EnumColumn(PremiumTier)
  premiumTier: PremiumTier;

  @Column("int", { transformer: Flags.transformer() })
  systemChannelFlags: Flags<SystemChannelFlag>;

  @Column("varchar", { transformer: Flags.transformer(true) })
  botPermissions: Flags<PermissionFlag>;

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
