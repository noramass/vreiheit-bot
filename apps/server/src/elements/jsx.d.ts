import { Locale, ChannelType } from "discord.js";

declare namespace JSX {
  type LocaleMap = Partial<Record<`${Locale}`, string>>;

  interface WithName {
    name: string;
    nameLocalizations?: LocaleMap;
  }

  interface WithDesc {
    description: string;
    descriptionLocalizations?: LocaleMap;
  }

  interface WithNameAndDesc extends WithDesc, WithName {}
  interface WithMinMax {
    min?: number;
    max?: number;
  }

  interface WithAutocomplete<T> {
    autocomplete?: boolean;
    children?: JsxCommandOptionChoice<T>[];
  }

  interface JsxCommandOptionChoice<T = string | number> extends WithName {
    value: T;
  }

  interface JsxSlashCommand extends WithNameAndDesc {
    children?:
      | JsxSlashCommandOption[]
      | (JsxSlashSubCommand | JsxSlashSubCommandGroup)[];
    dm?: boolean;
    nsfw?: boolean;
  }

  interface JsxSlashSubCommand extends WithNameAndDesc {
    children?: JsxSlashCommandOption[];
  }

  interface JsxSlashSubCommandGroup extends WithNameAndDesc {
    children?: JsxSlashSubCommand[];
  }

  interface JsxSlashCommandOptionBase extends WithNameAndDesc {
    type: string;
    required?: boolean;
  }

  interface JsxSlashCommandStringOption
    extends JsxSlashCommandOptionBase,
      WithMinMax,
      WithAutocomplete<string> {
    type: "string";
  }

  // todo: user, role

  interface JsxSlashCommandAttachmentOption extends JsxSlashCommandOptionBase {
    type: "attachment";
  }

  interface JsxSlashCommandBooleanOption extends JsxSlashCommandOptionBase {
    type: "boolean";
  }

  interface JsxSlashCommandChannelOption extends JsxSlashCommandOptionBase {
    type: "channel";
    channelTypes: (
      | ChannelType.GuildText
      | ChannelType.GuildVoice
      | ChannelType.GuildCategory
      | ChannelType.GuildAnnouncement
      | ChannelType.AnnouncementThread
      | ChannelType.PublicThread
      | ChannelType.PrivateThread
      | ChannelType.GuildStageVoice
      | ChannelType.GuildForum
    )[];
  }

  interface JsxSlashCommandIntegerOption
    extends JsxSlashCommandOptionBase,
      WithMinMax,
      WithAutocomplete<number> {
    type: "integer";
  }

  interface JsxSlashCommandMentionableOption extends JsxSlashCommandOptionBase {
    type: "mentionable";
  }

  interface JsxSlashCommandNumberOption
    extends JsxSlashCommandOptionBase,
      WithMinMax,
      WithAutocomplete<number> {
    type: "number";
  }

  interface JsxSlashCommandRoleOption extends JsxSlashCommandOptionBase {
    type: "role";
  }

  interface JsxSlashCommandUserOption extends JsxSlashCommandOptionBase {
    type: "user";
  }

  type JsxSlashCommandOption =
    | JsxSlashCommandStringOption
    | JsxSlashCommandAttachmentOption
    | JsxSlashCommandChannelOption
    | JsxSlashCommandBooleanOption
    | JsxSlashCommandIntegerOption
    | JsxSlashCommandMentionableOption
    | JsxSlashCommandNumberOption
    | JsxSlashCommandRoleOption
    | JsxSlashCommandUserOption;

  interface IntrinsicElements {
    slashCommand: JsxSlashCommand;
    subCommand: JsxSlashSubCommand;
    subCommandGroup: JsxSlashSubCommandGroup;
    commandOption: JsxSlashCommandOption;
    commandChoice: JsxCommandOptionChoice;
  }
  type Element = keyof IntrinsicElements;
}
