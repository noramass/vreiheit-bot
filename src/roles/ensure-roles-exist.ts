import { CreateRoleOptions, Guild } from "discord.js";

export async function ensureRolesExist(guild: Guild, roles: CreateRoleOptions[]) {
  const existing = guild.roles.cache;
  for (const role of roles) {
    const match = existing.find(it => it.name === role.name);
    if (!match) await guild.roles.create(role);
    else {
      if (role.color !== match.hexColor) await match.setColor(role.color);
      if (role.mentionable !== match.mentionable) await match.setMentionable(role.mentionable, role.reason);
      if (role.position !== match.position) await match.setPosition(role.position);
    }
  }
}
