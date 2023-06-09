export enum DiscordUserFlag {
  /** Discord Employee */
  Staff = 1 << 0,
  /** Partnered Server Owner */
  Partner = 1 << 1,
  /** HypeSquad Events Member */
  Hypesquad = 1 << 2,
  /** Bug Hunter Level 1 */
  BugHunterLevel1 = 1 << 3,
  /** House Bravery Member */
  HypesquadOnlineHouse1 = 1 << 6,
  /** House Brilliance Member */
  HypesquadOnlineHouse2 = 1 << 7,
  /** House Balance Member */
  HypesquadOnlineHouse3 = 1 << 8,
  /** Early Nitro Supporter */
  PremiumEarlySupporter = 1 << 9,
  /** User is a team */
  TeamPseudoUser = 1 << 10,
  /** Bug Hunter Level 2 */
  BugHunterLevel2 = 1 << 14,
  /** Verified Bot */
  VerifiedBot = 1 << 16,
  /** Early Verified Bot Developer */
  VerifiedDeveloper = 1 << 17,
  /** Moderator Programs Alumni */
  CertifiedModerator = 1 << 18,
  /** Bot uses only HTTP interactions and is shown in the online member list */
  BotHttpInteractions = 1 << 19,
  /** User is an Active Developer */
  ActiveDeveloper = 1 << 22,
}
