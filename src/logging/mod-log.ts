import { Guild, MessageCreateOptions, MessagePayload } from "discord.js";
import { Server } from "src/entities/server";
import { dataSource } from "src/init/data-source";
import { sendMessage } from "src/messages";

export async function modLog(
  guild: Guild,
  message: string | MessageCreateOptions | MessagePayload,
) {
  const { modLogChannel } = await dataSource
    .getRepository(Server)
    .findOne({ where: { discordId: guild.id } });
  return sendMessage(guild, modLogChannel ?? "logbuch", message);
}
