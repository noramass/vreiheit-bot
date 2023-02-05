import { Guild, MessageCreateOptions, MessagePayload } from "discord.js";
import { sendMessage } from "src/messages";

export function modLog(
  guild: Guild,
  message: string | MessageCreateOptions | MessagePayload,
) {
  return sendMessage(guild, "logbuch", message);
}
