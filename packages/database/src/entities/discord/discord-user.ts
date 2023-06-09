import { Color } from "@vreiheit/util";
import { EnumColumn } from "src/decorators/enum";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordLocale } from "src/enums";
import { DiscordUserFlag } from "src/enums/discord-user-flag";
import { DiscordUserPremiumType } from "src/enums/discord-user-premium-type";
import { color } from "src/transformers/color";
import { Flags } from "src/transformers/flag";
import { BaseEntity, Column, OneToMany, PrimaryColumn } from "typeorm";

export class DiscordUser extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  username: string;

  @Column("varchar", { nullable: true })
  discriminator?: string;

  @Column("varchar", { nullable: true })
  globalName?: string;

  @Column("varchar", { nullable: true })
  avatar?: string;

  @Column("bool", { default: false })
  bot: boolean;

  @Column("bool", { default: false })
  system: boolean;

  @Column("bool", { default: false })
  mfaEnabled: boolean;

  @Column("varchar", { nullable: true })
  banner?: string;

  @Column("int", { transformer: color("int") })
  accentColor?: Color.RgbColorArray;

  @EnumColumn({ DiscordLocale }, { nullable: true })
  locale?: DiscordLocale;

  @Column("bool", { default: false })
  verified?: boolean;

  @Column("varchar", { nullable: true })
  email?: string;

  @Column("int", { transformer: Flags.transformer() })
  flags: Flags<DiscordUserFlag>;

  @EnumColumn(
    { DiscordUserPremiumType },
    { default: DiscordUserPremiumType.None },
  )
  premiumType: DiscordUserPremiumType;

  @Column("int", { transformer: Flags.transformer() })
  publicFlats: Flags<DiscordUserFlag>;

  @OneToMany(() => DiscordGuild, guild => guild.owner)
  ownedGuilds: DiscordGuild[];

  @OneToMany(() => DiscordGuildMember, member => member.user)
  members: DiscordGuildMember[];
}
