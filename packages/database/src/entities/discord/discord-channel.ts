import { EnumColumn } from "src/decorators/enum";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import { DiscordPermissionOverwrite } from "src/entities/discord/discord-permission-overwrite";
import {
  ChannelFlag,
  ChannelType,
  ForumLayoutType,
  PermissionFlag,
  SortOrderType,
  VideoQualityMode,
} from "src/enums";
import { Flags } from "src/transformers/flag";
import {
  BaseEntity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

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
  threadMetadata?: ThreadMetadata;

  @Column("int", { nullable: true })
  defaultAutoArchiveDuration?: number;

  @Column("int", { nullable: true })
  defaultThreadRateLimitPerUser?: number;

  @Column("jsonb", { nullable: true })
  availableTags?: ForumTagObject[];

  @Column("jsonb", { nullable: true })
  appliedTags?: ForumTagObject[];

  @Column("jsonb", { nullable: true })
  defaultReactionEmoji: DefaultReaction;

  @Column("varchar", { transformer: Flags.transformer(true), nullable: true })
  permissions?: Flags<PermissionFlag>;

  @Column("int", { transformer: Flags.transformer(), nullable: true })
  flags?: Flags<ChannelFlag>;

  @EnumColumn(ChannelType)
  channelType: ChannelType;

  @EnumColumn(VideoQualityMode, { default: VideoQualityMode.Auto })
  videoQualityMode: VideoQualityMode;

  @EnumColumn(SortOrderType, { nullable: true })
  defaultSortOrder?: SortOrderType;

  @EnumColumn(ForumLayoutType, { nullable: true })
  defaultForumLayout?: ForumLayoutType;

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

interface ForumTagObject {
  id: string;
  name: string;
  moderated: boolean;
  emoji_id?: string;
  emoji_name?: string;
}

interface DefaultReaction {
  emoji_id?: string;
  emoji_name?: string;
}

interface ThreadMetadata {
  archived: boolean;
  auto_archive_duration: boolean;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string;
}
