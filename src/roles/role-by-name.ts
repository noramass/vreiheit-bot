import { Guild } from "discord.js";

export async function roleByName(guild: Guild, role: string) {
  if (/^[0-9]+$/.test(role)) return guild.roles.fetch(role);
  else {
    const all = await guild.roles.fetch();
    return all.find(it => it.name === role);
  }
}

export async function rolesByName(guild: Guild, roles: string[]) {
  const all = await guild.roles.fetch();
  return roles.map(role => {
    if (/^[0-9]+$/.test(role)) return all.get(role);
    else return all.find(it => it.name === role);
  });
}
