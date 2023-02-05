import {
  Guild,
  MessageCreateOptions,
  MessageEditOptions,
  MessagePayload,
  TextChannel,
} from "discord.js";
import { findTextChannel } from "src/messages/find-channel";
import { findMessage } from "src/messages/find-message";

export async function sendMessage(
  guild: Guild,
  channel: TextChannel | string,
  message: string | MessagePayload | MessageCreateOptions,
) {
  if (typeof channel === "string")
    channel = await findTextChannel(guild, channel);
  return channel.send(message);
}

export async function editMessage(
  guild: Guild,
  channel: TextChannel | string,
  messageId: string,
  body: string | MessageEditOptions | MessagePayload,
) {
  const message = await findMessage(guild, channel, messageId);
  return message.edit(body);
}
