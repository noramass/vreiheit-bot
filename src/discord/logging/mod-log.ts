import { Guild, MessageCreateOptions, MessagePayload } from "discord.js";
import { Server } from "src/database/entities/server";
import { dataSource } from "src/database/data-source";
import { sendMessage } from "src/discord/messages";

export async function modLog(
  guild: Guild,
  message: string | MessageCreateOptions | MessagePayload,
) {
  const { modLogChannel } = await dataSource
    .getRepository(Server)
    .findOne({ where: { discordId: guild.id } });
  return sendMessage(guild, modLogChannel ?? "logbuch", message);
}
