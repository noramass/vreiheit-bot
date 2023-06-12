import { DiscordMessage } from "src/entities/discord/discord-message";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordSticker } from "src/entities/discord/discord-sticker";
import { DiscordUser } from "src/entities/discord/discord-user";
import { DiscordGuildMemberFlag } from "src/enums";
import { Flags } from "src/transformers";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("GuildMember", { schema: "discord" })
export class DiscordGuildMember extends BaseEntity {
  @PrimaryColumn("varchar")
  guildId: string;

  @PrimaryColumn("varchar")
  userId: string;

  @Column("varchar", { nullable: true })
  nick?: string;

  @Column("varchar", { nullable: true })
  avatar?: string;

  @Column("timestamp")
  joinedAt: Date;

  @Column("timestamp", { nullable: true })
  premiumSince?: Date;

  @Column("bool", { default: false })
  deaf: boolean;

  @Column("bool", { default: false })
  mute: boolean;

  @Column("int", { transformer: Flags.transformer() })
  flags: Flags<DiscordGuildMemberFlag>;

  @Column("bool", { default: false })
  pending: boolean;

  @Column("timestamp", { nullable: true })
  communicationDisabledUntil?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => DiscordGuild, guild => guild.members, {
    cascade: ["remove", "soft-remove"],
  })
  @JoinColumn({ name: "guildId" })
  guild: DiscordGuild;

  @ManyToOne(() => DiscordUser, user => user.members, {
    cascade: ["remove", "soft-remove"],
  })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  user: DiscordUser;

  @ManyToMany(() => DiscordRole, role => role.members, {
    cascade: ["remove"],
  })
  @JoinTable({
    schema: "discord",
    name: "RolesOnGuildMembers",
    joinColumns: [
      { name: "userId", referencedColumnName: "userId" },
      { name: "guildId", referencedColumnName: "guildId" },
    ],
    inverseJoinColumns: [{ name: "roleId", referencedColumnName: "id" }],
  })
  roles: DiscordRole[];

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.role)
  permissionOverwrites: DiscordPermissionOverwrite[];

  @OneToMany(() => DiscordChannel, channel => channel.owner)
  ownedChannels: DiscordChannel[];

  @OneToMany(() => DiscordSticker, sticker => sticker.uploadedBy)
  uploadedStickers: DiscordSticker[];

  @OneToMany(() => DiscordMessage, messages => messages.author)
  messages: DiscordMessage[];
}
