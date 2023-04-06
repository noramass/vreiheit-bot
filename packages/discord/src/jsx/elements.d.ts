import { Locale, ChannelType, TextInputStyle, ButtonStyle } from "discord.js";

export declare namespace JSX {
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
    children?: JsxCommandOptionChoiceProps<T>[];
  }

  interface JsxCommandOptionChoiceProps<T = string | number> extends WithName {
    value: T;
  }

  interface JsxSlashCommandProps extends WithNameAndDesc {
    children?:
      | JsxSlashCommandOptionProps[]
      | (JsxSlashSubCommandProps | JsxSlashSubCommandGroupProps)[];
    dm?: boolean;
    nsfw?: boolean;
  }

  interface JsxSlashSubCommandProps extends WithNameAndDesc {
    children?: JsxSlashCommandOptionProps[];
  }

  interface JsxSlashSubCommandGroupProps extends WithNameAndDesc {
    children?: JsxSlashSubCommandProps[];
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

  type JsxSlashCommandOptionProps =
    | JsxSlashCommandStringOption
    | JsxSlashCommandAttachmentOption
    | JsxSlashCommandChannelOption
    | JsxSlashCommandBooleanOption
    | JsxSlashCommandIntegerOption
    | JsxSlashCommandMentionableOption
    | JsxSlashCommandNumberOption
    | JsxSlashCommandRoleOption
    | JsxSlashCommandUserOption;

  interface ModalProps {
    title: string;
    customId: string;
    children?: Element[];
  }

  interface ActionRowProps {
    children?: Element[];
  }

  interface TextInputProps {
    style: TextInputStyle;
    label: string;
    customId: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
  }

  interface EmbedProps {
    title?: string;
    description?: string;
    footer?: { text: string };
    fields?: Element[];
  }

  interface FieldProps {
    name: string;
    value: string;
  }

  interface ButtonProps {
    customId: string;
    style: ButtonStyle;
    label?: string;
    url?: string;
    emoji?: string;
    disabled?: boolean;
  }

  interface IntrinsicElements {
    slashCommand: JsxSlashCommandProps;
    subCommand: JsxSlashSubCommandProps;
    subCommandGroup: JsxSlashSubCommandGroupProps;
    commandOption: JsxSlashCommandOptionProps;
    commandChoice: JsxCommandOptionChoiceProps;

    modal: ModalProps;
    actionRow: ActionRowProps;
    textInput: TextInputProps;

    embed: EmbedProps;
    field: FieldProps;
    button: ButtonProps;
  }
  type Element = keyof IntrinsicElements;
}
