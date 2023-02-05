import { Guild, TextChannel } from "discord.js";
import { findTextChannel } from "src/messages/find-channel";

export async function findMessage(
  guild: Guild,
  channel: TextChannel | string,
  messageId: string,
) {
  channel =
    typeof channel === "string"
      ? await findTextChannel(guild, channel)
      : channel;
  return channel.messages.fetch(messageId);
}
