import {
  ApplicationCommandDataResolvable,
  BaseApplicationCommandData,
  Client,
  Guild,
} from "discord.js";
import { PromiseOr } from "src/util";

export async function ensureCommand(
  client: Client<true>,
  command:
    | ApplicationCommandDataResolvable
    | ((guild: Guild) => PromiseOr<ApplicationCommandDataResolvable>),
) {
  for (const guild of client.guilds.cache.values()) {
    if (typeof command === "function") command = await command(guild);
    const name = (command as BaseApplicationCommandData).name;
    const commands = await guild.commands.fetch();
    const match = commands.find(it => it.name === name);
    if (match) await guild.commands.delete(match);
    await guild.commands.create(command);
  }
}
