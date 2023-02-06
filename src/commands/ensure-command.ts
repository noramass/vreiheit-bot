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
    //Check if in cache
    let commands = await guild.commands.cache;
    const cacheMatch = commands.find(it => it.name === name);
    if (cacheMatch) return;
    //Check again for fetch
    commands = await guild.commands.fetch();
    const fetchMatch = commands.find(it => it.name === name);
    if (fetchMatch) return;
    //Command does not exist in cache nor in fetch. create it
    await guild.commands.create(command);
  }
}
