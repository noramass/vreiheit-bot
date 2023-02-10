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

    let hasCommand =
      (await guild.commands.cache).find(it => it.name === name) != null;
    if (!hasCommand)
      hasCommand =
        (await guild.commands.fetch()).find(it => it.name === name) != null;

    if (hasCommand) return;
    //Command does not exist in cache nor in fetch. create it
    await guild.commands.create(command);
  }
}
