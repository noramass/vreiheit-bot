import { EnumColumn } from "src/decorators/enum";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import {
  DiscordChannelFlag,
  DiscordChannelType,
  DiscordForumLayoutType,
  DiscordPermissionFlag,
  DiscordSortOrderType,
  DiscordVideoQualityMode,
} from "src/enums";
import { Flags } from "src/transformers/flag";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

@Entity("Channel", { schema: "discord" })
export class DiscordChannel extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar", { nullable: true })
  name?: string;

  @Column("varchar", { nullable: true })
  topic?: string;

  @Column("bool", { nullable: true })
  nsfw?: boolean;

  @Column("int", { nullable: true })
  bitrate?: number;

  @Column("int", { nullable: true })
  userLimit?: number;

  @Column("int", { nullable: true })
  rateLimitPerUser?: number;

  @Column("int", { nullable: true })
  position?: number;

  @Column("int", { nullable: true })
  messageCount?: number;

  @Column("int", { nullable: true })
  memberCount?: number;

  @Column("int", { nullable: true })
  totalMessagesSent?: number;

  @Column("jsonb", { nullable: true })
  threadMetadata?: DiscordThreadMetadata;

  @Column("int", { nullable: true })
  defaultAutoArchiveDuration?: number;

  @Column("int", { nullable: true })
  defaultThreadRateLimitPerUser?: number;

  @Column("jsonb", { nullable: true })
  availableTags?: DiscordForumTagObject[];

  @Column("jsonb", { nullable: true })
  appliedTags?: DiscordForumTagObject[];

  @Column("jsonb", { nullable: true })
  defaultReactionEmoji: DiscordDefaultReaction;

  @Column("varchar", { transformer: Flags.transformer(true), nullable: true })
  permissions?: Flags<DiscordPermissionFlag>;

  @Column("int", { transformer: Flags.transformer(), nullable: true })
  flags?: Flags<DiscordChannelFlag>;

  @EnumColumn({ DiscordChannelType })
  channelType: DiscordChannelType;

  @EnumColumn(
    { DiscordVideoQualityMode },
    {
      default: DiscordVideoQualityMode.Auto,
    },
  )
  videoQualityMode: DiscordVideoQualityMode;

  @EnumColumn({ DiscordSortOrderType }, { nullable: true })
  defaultSortOrder?: DiscordSortOrderType;

  @EnumColumn({ DiscordForumLayoutType }, { nullable: true })
  defaultForumLayout?: DiscordForumLayoutType;

  @OneToMany(() => DiscordPermissionOverwrite, overwrite => overwrite.channel)
  permissionOverwrites: DiscordPermissionOverwrite[];

  @ManyToOne(() => DiscordGuildMember, member => member.ownedChannels, {
    nullable: true,
  })
  owner: DiscordGuildMember;

  @ManyToOne(() => DiscordChannel, channel => channel.children, {
    nullable: true,
  })
  parent?: DiscordChannel;

  @OneToMany(() => DiscordChannel, channel => channel.parent)
  children: DiscordChannel[];
}

interface DiscordForumTagObject {
  id: string;
  name: string;
  moderated: boolean;
  emoji_id?: string;
  emoji_name?: string;
}

interface DiscordDefaultReaction {
  emoji_id?: string;
  emoji_name?: string;
}

interface DiscordThreadMetadata {
  archived: boolean;
  auto_archive_duration: boolean;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string;
}
