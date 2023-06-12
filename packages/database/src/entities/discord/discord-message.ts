import { EnumColumn } from "src/decorators";
import { DiscordChannel } from "src/entities/discord/discord-channel";
import { DiscordGuild } from "src/entities/discord/discord-guild";
import { DiscordGuildMember } from "src/entities/discord/discord-guild-member";
import {
  DiscordStickerFormatType,
  DiscordInteractionType,
  DiscordMessageActivityType,
  DiscordMessageFlag,
  DiscordMessageType,
} from "src/enums";
import { Flags } from "src/transformers";
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("Message", { schema: "discord" })
export class DiscordMessage extends BaseEntity {
  @PrimaryColumn("varchar")
  id: string;

  @Column("varchar")
  channelId: string;

  @Column("varchar")
  authorId: string;

  @Column("varchar", { nullable: true })
  guildId: string;

  @Column("varchar", { nullable: true })
  content?: string;

  @Column("timestamp")
  timestamp: Date;

  @Column("timestamp", { nullable: true })
  editedTimestamp?: Date;

  @Column("varchar", { nullable: true })
  nonce?: string;

  @Column("bool", { default: false })
  tts: boolean;

  @Column("bool", { default: false })
  mentionEveryone: boolean;

  @Column("varchar", { array: true })
  mentionedUsers: string[];

  @Column("varchar", { array: true })
  mentionedRoles: string[];

  @Column("varchar", { array: true })
  mentionedChannels: string[];

  @Column("jsonb")
  attachments: DiscordMessageAttachment[];

  @Column("jsonb")
  embeds: DiscordMessageEmbed[];

  @Column("jsonb")
  reactions: DiscordMessageReaction[];

  @Column("bool", { default: false })
  pinned: boolean;

  @Column("varchar", { nullable: true })
  webhookId?: string;

  @EnumColumn({ DiscordMessageType })
  type: DiscordMessageType;

  @Column("jsonb", { nullable: true })
  activity?: DiscordMessageActivity;

  @Column("jsonb", { nullable: true })
  application?: Partial<DiscordApplication>;

  @Column("varchar", { nullable: true })
  applicationId?: string;

  @Column("varchar", { nullable: true })
  referenceMessageId?: string;

  @Column("varchar", { nullable: true })
  referenceChannelId?: string;

  @Column("varchar", { nullable: true })
  referenceGuildId?: string;

  @Column("int", { transformer: Flags.transformer() })
  flags: Flags<DiscordMessageFlag>;

  @Column("jsonb", { nullable: true })
  interaction?: DiscordMessageInteraction;

  @Column("varchar", { nullable: true })
  threadId?: string;

  @Column("jsonb", { nullable: true })
  components?: any;

  @Column("jsonb", { nullable: true })
  stickerItems?: DiscordMessageStickerItem[];

  @Column("int", { nullable: true })
  position?: number;

  @Column("jsonb", { nullable: true })
  roleSubscriptionData?: DiscordRoleSubscriptionData;

  @ManyToOne(() => DiscordGuildMember, member => member.messages)
  @JoinColumn([
    { name: "guildId", referencedColumnName: "guildId" },
    { name: "authorId", referencedColumnName: "userId" },
  ])
  author: DiscordGuildMember;

  @ManyToOne(() => DiscordGuild, guild => guild.messages)
  @JoinColumn({ name: "guildId", referencedColumnName: "id" })
  guild: DiscordGuild;

  @ManyToOne(() => DiscordChannel, channel => channel.messages)
  @JoinColumn([
    { name: "guildId", referencedColumnName: "guildId" },
    { name: "channelId", referencedColumnName: "id" },
  ])
  channel: DiscordChannel;
}

export interface DiscordRoleSubscriptionData {
  role_subscription_listing_id: string;
  tier_name: string;
  total_months_subscribed: number;
  is_renewal: boolean;
}

export interface DiscordMessageStickerItem {
  id: string;
  name: string;
  format_type: DiscordStickerFormatType;
}

export interface DiscordMessageInteraction {
  id: string;
  type: DiscordInteractionType;
  name: string;
  user: { id: string };
  member?: { id: string };
}

export interface DiscordApplication {
  id: string;
  name: string;
  icon?: string;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: { id: string };
  verify_key: string;
  team?: DiscordTeam;
  guild_id?: string;
  primary_sku_id?: string;
  slub?: string;
  cover_image?: string;
  flags?: number;
  tags?: string[];
  install_params?: {
    scopes: string[];
    permissions: string;
  };
  custom_install_url?: string;
  role_connections_verification_url?: string;
}

export interface DiscordTeam {
  icon?: string;
  id: string;
  members: DiscordTeamMember[];
  name: string;
  owner_user_id: string;
}

export interface DiscordTeamMember {
  membership_state: number;
  permissions: string[];
  team_id: string;
  user: { id: string };
}

export interface DiscordMessageActivity {
  type: DiscordMessageActivityType;
  party_id?: string;
}

export interface DiscordMessageReaction {
  count: number;
  me: boolean;
  emoji: Partial<{
    id: string;
    name: string;
  }>;
}

export interface DiscordMessageAttachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
}

export interface DiscordMessageEmbed {
  title?: string;
  type?: "rich" | "image" | "video" | "gifv" | "article" | "link";
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordMessageEmbedFooter;
  image?: DiscordMessageEmbedImage;
  thumbnail?: DiscordMessageEmbedThumbnail;
  video?: DiscordMessageEmbedVideo;
  provider?: DiscordMessageEmbedProvider;
  author?: DiscordMessageEmbedAuthor;
  fields?: DiscordMessageEmbedField[];
}

export interface DiscordMessageEmbedThumbnail {
  url: string;
  proxy_url?: string;
  width?: number;
  height?: number;
}

export interface DiscordMessageEmbedVideo {
  url?: string;
  proxy_url?: string;
  width?: number;
  height?: number;
}

export interface DiscordMessageEmbedImage {
  url: string;
  proxy_url?: string;
  width?: number;
  height?: number;
}

export interface DiscordMessageEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordMessageEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordMessageEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordMessageEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}
