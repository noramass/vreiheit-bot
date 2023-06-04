export enum ExplicitContentFilterLevel {
  /** media content will not be scanned */
  Disabled = 0,
  /** media content sent by members without roles will be scanned */
  MembersWithoutRoles = 1,
  /** media content sent by all members will be scanned */
  AllMembers = 2,
}
