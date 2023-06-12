import { ConstEnum } from "src/util/enum";

export const DiscordPermissionFlag = {
  /** Allows creation of instant invites */
  CreateInstantInvite: 1n,
  /** Allows kicking members */
  KickMembers: 2n,
  /** Allows banning members */
  BanMembers: 4n,
  /** Allows all permissions and bypasses channel permission overwrites */
  Administrator: 8n,
  /** Allows management and editing of channels */
  ManageChannels: 16n,
  /** Allows management and editing of the guild */
  ManageGuild: 32n,
  /** Allows for the addition of reactions to messages */
  AddReactions: 64n,
  /** Allows for viewing of audit logs */
  ViewAuditLog: 128n,
  /** Allows for using priority speaker in a voice channel */
  PrioritySpeaker: 256n,
  /** Allows the user to go live */
  Stream: 512n,
  /** Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels */
  ViewChannel: 1024n,
  /** Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads) */
  SendMessages: 2048n,
  /** Allows for sending of /tts messages */
  SendTtsMessages: 4096n,
  /** Allows for deletion of other users messages */
  ManageMessages: 8192n,
  /** Links sent by users with this permission will be auto-embedded */
  EmbedLinks: 16384n,
  /** Allows for uploading images and files */
  AttachFiles: 32768n,
  /** Allows for reading of message history */
  ReadMessageHistory: 65536n,
  /** Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel */
  MentionEveryone: 131072n,
  /** Allows the usage of custom emojis from other servers */
  UseExternalEmojis: 262144n,
  /** Allows for viewing guild insights */
  ViewGuildInsights: 524288n,
  /** Allows for joining of a voice channel */
  Connect: 1048576n,
  /** Allows for speaking in a voice channel */
  Speak: 2097152n,
  /** Allows for muting members in a voice channel */
  MuteMembers: 4194304n,
  /** Allows for deafening of members in a voice channel */
  DeafenMembers: 8388608n,
  /** Allows for moving of members between voice channels */
  MoveMembers: 16777216n,
  /** Allows for using voice-activity-detection in a voice channel */
  UseVad: 33554432n,
  /** Allows for modification of own nickname */
  ChangeNickname: 67108864n,
  /** Allows for modification of other users nicknames */
  ManageNicknames: 134217728n,
  /** Allows management and editing of roles */
  ManageRoles: 268435456n,
  /** Allows management and editing of webhooks */
  ManageWebhooks: 536870912n,
  /** Allows management and editing of emojis, stickers, and soundboard sounds */
  ManageGuildExpressions: 1073741824n,
  /** Allows members to use application commands, including slash commands and context menu commands. */
  UseApplicationCommands: 2147483648n,
  /** Allows for requesting to speak in stage channels. (This permission is under active development and may be changed or removed.) */
  RequestToSpeak: 4294967296n,
  /** Allows for creating, editing, and deleting scheduled events */
  ManageEvents: 8589934592n,
  /** Allows for deleting and archiving threads, and viewing all private threads */
  ManageThreads: 17179869184n,
  /** Allows for creating public and announcement threads */
  CreatePublicThreads: 34359738368n,
  /** Allows for creating private threads */
  CreatePrivateThreads: 68719476736n,
  /** Allows the usage of custom stickers from other servers */
  UseExternalStickers: 137438953472n,
  /** Allows for sending messages in threads */
  SendMessagesInThreads: 274877906944n,
  /** Allows for using Activities (applications with the EMBEDDED flag) in a voice channel */
  UseEmbeddedActivities: 549755813888n,
  /** Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels */
  ModerateMembers: 1099511627776n,
  /** Allows for viewing role subscription insights */
  ViewCreatorMonetizationAnalytics: 2199023255552n,
  /** Allows for using soundboard in a voice channel */
  UseSoundboard: 4398046511104n,
  /** Allows the usage of custom soundboard sounds from other servers */
  UseExternalSounds: 35184372088832n,
  /** Allows sending voice messages */
  SendVoiceMessages: 70368744177664n,
} as const;

Object.freeze(DiscordPermissionFlag);

export type DiscordPermissionFlag = ConstEnum<typeof DiscordPermissionFlag>;
