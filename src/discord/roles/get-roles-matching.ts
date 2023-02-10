import { Collection, Guild, Role } from "discord.js";

export async function getRolesMatching(
  guild: Guild,
  filter: (role: Role) => boolean,
): Promise<Collection<string, Role>> {
  return guild.roles.cache.filter(filter);
}
