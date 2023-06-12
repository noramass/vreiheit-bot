import { Color } from "@vreiheit/util";
import { EnumColumn } from "src/decorators";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import {
  DiscordLocale,
  DiscordUserFlag,
  DiscordUserPremiumType,
} from "src/enums";
import { color, Flags } from "src/transformers";
import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity("User", { schema: "discord" })
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
  publicFlags: Flags<DiscordUserFlag>;

  @OneToMany(() => DiscordGuild, guild => guild.owner)
  ownedGuilds: DiscordGuild[];

  @OneToMany(() => DiscordGuildMember, member => member.user)
  members: DiscordGuildMember[];
}
