export enum DiscordGuildMemberFlag {
  /** Member has left and rejoined the guild */
  DidRejoin = 1 << 0,
  /** Member has completed onboarding */
  CompletedOnboarding = 1 << 1,
  /** Member is exempt from guild verification requirements */
  BypassesVerification = 1 << 2,
  /** Member has started onboarding */
  StartedOnboarding = 1 << 3,
}
