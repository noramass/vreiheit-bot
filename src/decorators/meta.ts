import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  GuildMember,
  Interaction,
  Message,
  ModalSubmitInteraction,
} from "discord.js";
import { PromiseOr } from "src/util";

export type Constructor<T = any, Args extends any[] = any> = (
  ...params: Args
) => T;
export type InteractionHandler = (
  interaction: Interaction,
  id: string,
) => PromiseOr<void>;
export type ButtonHandler = (
  interaction: ButtonInteraction,
  id: string,
) => PromiseOr<void>;
export type CommandHandler = (
  interaction: CommandInteraction,
  id: string,
) => PromiseOr<void>;
export type MessageHandler = (message: Message) => PromiseOr<void>;
export type MemberHandler = (member: GuildMember) => PromiseOr<void>;
export type FormHandler = (
  interaction: ModalSubmitInteraction,
  id: string,
) => PromiseOr<void>;
export type InitHandler = (client: Client<true>) => PromiseOr<void>;
export interface DiscordHandlerMeta {
  prefix: string;
  interaction: Record<string, InteractionHandler[]>;
  button: Record<string, ButtonHandler[]>;
  command: Record<string, CommandHandler[]>;
  message: Record<string, MessageHandler[]>;
  form: Record<string, FormHandler[]>;
  memberJoin: Record<string, MemberHandler[]>;
  memberLeave: Record<string, MemberHandler[]>;
  init: Record<string, InitHandler[]>;
}

const META = Symbol("discord handler meta");
export function getMeta(cls: Constructor): DiscordHandlerMeta {
  return ((cls as any)[META] ??= {
    prefix: "",
    interaction: {},
    button: {},
    command: {},
    message: {},
    memberJoin: {},
    memberLeave: {},
    form: {},
    init: {},
  });
}

export function getHandlerMeta<
  T extends keyof Omit<DiscordHandlerMeta, "prefix">,
>(cls: Constructor, key: T, id: string): DiscordHandlerMeta[T][string] {
  return (getMeta(cls)[key][id] ??= []) as any;
}
