import { CreateRoleOptions, Guild, GuildMember, Role, User } from "discord.js";
import { ensureRolesExist } from "src/roles/ensure-roles-exist";
import { getRolesMatching } from "src/roles/get-roles-matching";
import { createInverseLookup, createLookup } from "src/util/lookups";

const pronounRolePrefix = "Pronomen";
function prefix(name: string) {
  return `${pronounRolePrefix}: ${name}`;
}

const pronounRoles = {
  "she/her": {
    name: prefix("She/Her"),
    color: "#fda4af",
  },
  "she/they": {
    name: prefix("She/They"),
    color: "#f0abfc",
  },
  "they/them": {
    name: prefix("They/Them"),
    color: "#a78bfa",
  },
  "he/they": {
    name: prefix("He/They"),
    color: "#818cf8",
  },
  "he/him": {
    name: prefix("He/Him"),
    color: "#93c5fd",
  },
  "he/she/they": {
    name: prefix("He/She/They"),
    color: "#fdba74",
  },
  "ask": {
    name: prefix("Nachfragen"),
    color: "#86efac",
  },
} as const;

const pronounRoleShared: CreateRoleOptions = {
  permissions: [],
  mentionable: false,
};

export async function getAllPronounRoles(guild: Guild) {
  await ensureRolesExist(
    guild,
    Object.values(pronounRoles).map(role => ({
      ...pronounRoleShared,
      ...role,
    })),
  );
  const matching = await getRolesMatching(guild, role =>
    role.name.startsWith(prefix("")),
  );
  const results: Record<keyof typeof pronounRoles, Role> & { other: Role[] } = {
    other: [],
  } as any;
  const names = createInverseLookup(pronounRoles, ({ name }) => name);
  for (const role of matching.values()) {
    const key = names[role.name];
    if (key) results[key] = role;
    else results.other.push(role);
  }

  return results;
}

export async function getAllPronounRolesArray(guild: Guild) {
  const { other, ...primary } = await getAllPronounRoles(guild);
  return Object.values(primary).concat(...other);
}

export async function cleanupPronounRoles(guild: Guild) {
  /*await guild.members.fetch();
  console.log("cleanup pronouns:", guild.name);
  const roles = await getAllPronounRoles(guild);
  for (const role of roles.other) {
    console.log("members", role.members.size, ...role.members.values());
    // if (!role.members.size) await role.delete("Unused");
  }*/
}

export async function createCustomPronounRole(
  guild: Guild,
  member: GuildMember,
  pronouns: string,
  color: string,
) {
  const role = await guild.roles.create({
    ...pronounRoleShared,
    name: prefix(pronouns),
    color: color as any,
  });
  await togglePronounRole(member, role.id);
}

export async function togglePronounRole(member: GuildMember, roleId: string) {
  const { other, ...primary } = await getAllPronounRoles(member.guild);
  const pronounRoles = Object.values(primary).concat(...other);
  if (!/^[0-9]+$/.test(roleId))
    roleId = pronounRoles.find(it => it.name === roleId).id;
  await member.fetch();
  const roles = member.roles.cache;
  for (const role of pronounRoles) {
    const hasRole = roles.has(role.id);
    const matches = role.id === roleId;
    if ((hasRole && matches) || !matches) {
      await member.roles.remove(role);
      if (other.find(it => it.id === role.id) && hasRole)
        await member.guild.roles.delete(role);
    } else if (matches) await member.roles.add(role);
  }
}

export async function removeCustomPronounRole(member: GuildMember) {
  const { other } = await getAllPronounRoles(member.guild);
  for (const role of other) {
    if (member.roles.cache.has(role.id)) await member.guild.roles.delete(role);
  }
}
