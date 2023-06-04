import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import { DiscordRole } from "src/entities/discord/discord-role";
import { DiscordUser } from "src/entities/discord/discord-user";
import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export class DiscordGuildMember extends BaseEntity {
  @PrimaryColumn("varchar")
  guildId: string;

  @PrimaryColumn("varchar")
  userId: string;

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
  @JoinColumn({ name: "userId" })
  user: DiscordUser;

  @ManyToMany(() => DiscordRole, role => role.members, {
    cascade: ["remove"],
  })
  roles: DiscordRole[];

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.role)
  permissionOverwrites: DiscordPermissionOverwrite[];

  @OneToMany(() => DiscordChannel, channel => channel.owner)
  ownedChannels: DiscordChannel[];
}
