import {
  Guild,
  GuildMember,
  MessageCreateOptions,
  MessageEditOptions,
  MessagePayload,
  TextBasedChannel,
  TextChannel,
  User,
} from "discord.js";
import { findTextChannel } from "src/discord/messages/find-channel";
import { findMessage } from "src/discord/messages/find-message";

export async function sendMessage(
  guild: Guild,
  channel: TextBasedChannel | string,
  message: string | MessagePayload | MessageCreateOptions,
) {
  if (typeof channel === "string")
    channel = await findTextChannel(guild, channel);
  return channel.send(message);
}

export async function editMessage(
  guild: Guild,
  channel: TextBasedChannel | string,
  messageId: string,
  body: string | MessageEditOptions | MessagePayload,
) {
  const message = await findMessage(guild, channel, messageId);
  return message.edit(body);
}

export async function sendDm(
  member: GuildMember | User,
  body: string | MessagePayload | MessageCreateOptions,
) {
  if (member.dmChannel) return member.dmChannel.send(body);
  else {
    await member.createDM();
    member.dmChannel.send(body);
    await member.deleteDM();
  }
}
