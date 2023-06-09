export enum DiscordVerificationLevel {
  /** unrestricted */
  None = 0,
  /** must have account */
  Low = 1,
  /** must be registered for longer than 5 minutes */
  Medium = 2,
  /** must be a member of the server for longer than 10 minutes */
  High = 3,
  /** must have a verified phone number */
  VeryHigh = 4,
}
