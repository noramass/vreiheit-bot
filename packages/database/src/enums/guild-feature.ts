export enum GuildFeature {
  /** guild has access to set an animated guild banner image */
  AnimatedBanner = "ANIMATED_BANNER",
  /** guild has access to set an animated guild icon */
  AnimatedIcon = "ANIMATED_ICON",
  /** guild is using the old permissions configuration behavior */
  ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",
  /** guild has set up auto moderation rules */
  AutoModeration = "AUTO_MODERATION",
  /** guild has access to set a guild banner image */
  Banner = "BANNER",
  /** guild can enable welcome screen, Membership Screening, stage channels and discovery, and receives community updates */
  Community = "COMMUNITY",
  /** guild has enabled monetization */
  CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",
  /** guild has enabled the role subscription promo page */
  CreatorStorePage = "CREATOR_STORE_PAGE",
  /** guild has been set as a support server on the App Directory */
  DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",
  /** guild is able to be discovered in the directory */
  Discoverable = "DISCOVERABLE",
  /** guild is able to be featured in the directory */
  Featurable = "FEATURABLE",
  /** guild has paused invites, preventing new users from joining */
  InvitesDisabled = "INVITES_DISABLED",
  /** guild has access to set an invite splash background */
  InviteSplash = "INVITE_SPLASH",
  /** guild has enabled Membership Screening */
  MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",
  /** guild has increased custom sticker slots */
  MoreStickers = "MORE_STICKERS",
  /** guild has access to create announcement channels */
  News = "NEWS",
  /** guild is partnered */
  Partnered = "PARTNERED",
  /** guild can be previewed before joining via Membership Screening or the directory */
  PreviewEnabled = "PREVIEW_ENABLED",
  /** guild has disabled alerts for join raids in the configured safety alerts channel */
  RaidAlertsDisabled = "RAID_ALERTS_DISABLED",
  /** guild is able to set role icons */
  RoleIcons = "ROLE_ICONS",
  /** guild has role subscriptions that can be purchased */
  RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
  /** guild has enabled role subscriptions */
  RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
  /** guild has enabled ticketed events */
  TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",
  /** guild has access to set a vanity URL */
  VanityUrl = "VANITY_URL",
  /** guild is verified */
  Verified = "VERIFIED",
  /** guild has access to set 384kbps bitrate in voice (previously VIP voice servers) */
  VipRegions = "VIP_REGIONS",
  /** guild has enabled the welcome screen */
  WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}
