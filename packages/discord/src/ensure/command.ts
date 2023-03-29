import { PromiseOr } from "@vreiheit/util";
import {
  ApplicationCommandDataResolvable,
  BaseApplicationCommandData,
  Client,
  Guild,
} from "discord.js";
import { objectsAreEqual } from "src/util";

export async function ensureCommand(
  client: Client<true>,
  command:
    | ApplicationCommandDataResolvable
    | ((guild: Guild) => PromiseOr<ApplicationCommandDataResolvable>),
) {
  for (const guild of client.guilds.cache.values()) {
    if (typeof command === "function") command = await command(guild);
    const name = (command as BaseApplicationCommandData).name;

    let orig = guild.commands.cache.find(it => it.name === name);
    if (!orig)
      orig = (await guild.commands.fetch()).find(it => it.name === name);

    if (orig) {
      if ("toJSON" in command) {
        if (
          !objectsAreEqual(command.toJSON(), orig.toJSON(), ["dm_permission"])
        )
          await orig.edit(command.toJSON() as any);
      }
      return;
    }

    await guild.commands.create(command as ApplicationCommandDataResolvable);
  }
}
