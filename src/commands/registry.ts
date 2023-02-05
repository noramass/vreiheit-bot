import { Message } from "discord.js";
import { PromiseOr } from "src/util";

export const registeredCommands: Record<
  string,
  (message: Message, ...params: string[]) => PromiseOr<void>
> = {};

export function register(
  name: string,
  handler: (message: Message, ...params: string[]) => void,
) {
  registeredCommands[name] = handler;
}
