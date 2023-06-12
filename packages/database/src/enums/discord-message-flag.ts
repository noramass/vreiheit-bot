export enum DiscordMessageFlag {
  /** this message has been published to subscribed channels (via Channel Following) */
  Crossposted = 1 << 0,
  /** this message originated from a message in another channel (via Channel Following) */
  IsCrosspost = 1 << 1,
  /** do not include any embeds when serializing this message */
  SuppressEmbeds = 1 << 2,
  /** the source message for this crosspost has been deleted (via Channel Following) */
  SourceMessageDeleted = 1 << 3,
  /** this message came from the urgent message system */
  Urgent = 1 << 4,
  /** this message has an associated thread, with the same id as the message */
  HasThread = 1 << 5,
  /** this message is only visible to the user who invoked the Interaction */
  Ephemeral = 1 << 6,
  /** this message is an Interaction Response and the bot is "thinking" */
  Loading = 1 << 7,
  /** this message failed to mention some roles and add their members to the thread */
  FailedToMentionSomeRolesInThread = 1 << 8,
  /** this message will not trigger push and desktop notifications */
  SuppressNotifications = 1 << 12,
  /** this message is a voice message */
  IsVoiceMessage = 1 << 13,
}
