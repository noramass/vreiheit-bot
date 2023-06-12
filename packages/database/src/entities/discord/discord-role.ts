import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordPermissionFlag } from "src/enums";
import { color, Flags } from "src/transformers";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Color } from "@vreiheit/util";

export interface DiscordRoleTags {
  bot_id?: string;
  integration_id?: string;
  subscription_listing_id?: string;
  premium_subscriber?: null;
  available_for_purchase?: null;
  guild_connections?: null;
}

@Entity("Role", { schema: "discord" })
export class DiscordRole extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  name: string;

  @Column("varchar")
  guildId: string;

  @Column("int", { transformer: color("int") })
  color: Color.RgbColorArray;

  @Column("bool")
  hoist: boolean;

  @Column("varchar", { nullable: true })
  icon?: string;

  @Column("varchar", { nullable: true })
  unicodeEmoji?: string;

  @Column("int")
  position: number;

  @Column("varchar", { transformer: Flags.transformer(true) })
  permissions: Flags<DiscordPermissionFlag>;

  @Column("bool")
  managed: boolean;

  @Column("jsonb", { default: {} })
  tags: DiscordRoleTags;

  @Column("bool")
  mentionable: boolean;

  @ManyToOne(() => DiscordGuild, guild => guild.roles)
  @JoinColumn({ name: "guildId", referencedColumnName: "id" })
  guild: DiscordGuild;

  @ManyToMany(() => DiscordGuildMember, member => member.roles)
  members: DiscordGuildMember[];

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.role)
  permissionOverwrites: DiscordPermissionOverwrite[];
}
