import { Guild, TextBasedChannel, TextChannel } from "discord.js";
import { findTextChannel } from "src/messages/find-channel";

export async function findMessage(
  guild: Guild,
  channel: TextBasedChannel | string,
  messageId: string,
) {
  channel =
    typeof channel === "string"
      ? await findTextChannel(guild, channel)
      : channel;
  return channel.messages.cache.has(messageId)
    ? channel.messages.cache.get(messageId)
    : channel.messages.fetch(messageId);
}
