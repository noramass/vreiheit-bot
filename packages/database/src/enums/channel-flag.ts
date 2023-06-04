export enum ChannelFlag {
  /** this thread is pinned to the top of its parent GUILD_FORUM channel */
  Pinned = 1 << 1,
  /** whether a tag is required to be specified when creating a thread in a GUILD_FORUM channel. Tags are specified in the applied_tags field. */
  RequireTag = 1 << 4,
}
