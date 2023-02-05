import { Guild, GuildMember, Role } from "discord.js";
import { rolesByName } from "src/roles/role-by-name";

const hierarchyRoles = [
  "Neu Hier",
  "Nicht Vegan",
  "Vegan",
  "Verifiziert Vegan",
  "Aktivisti",
  "Stage Moderation",
  "Moderation",
  "Serveradmin",
];

export async function getHierarchy(guild: Guild) {
  return rolesByName(guild, hierarchyRoles);
}

export async function promote(
  member: GuildMember,
  role?: Role,
  hierarchy?: Role[],
) {
  if (!hierarchy) hierarchy = await getHierarchy(member.guild);
  const current = await getHierarchyRole(member);
  if (!current) return member.roles.add(role ?? hierarchy[0]);
  if (role) {
    const roleIndex = hierarchy.indexOf(role);
    const currentIndex = hierarchy.indexOf(current);
    if (currentIndex < roleIndex) {
      await member.roles.add(role);
      await member.roles.remove(current);
    } else return;
  } else {
    const currentIndex = hierarchy.indexOf(current);
    if (currentIndex === hierarchy.length - 1) return;
    await member.roles.remove(current);
    await member.roles.add(hierarchy[currentIndex + 1]);
  }
}

export async function demote(
  member: GuildMember,
  role?: Role,
  hierarchy?: Role[],
) {
  if (!hierarchy) hierarchy = await getHierarchy(member.guild);
  const current = await getHierarchyRole(member);
  if (!current) return member.roles.add(role ?? hierarchy[0]);
  if (role) {
    const roleIndex = hierarchy.indexOf(role);
    const currentIndex = hierarchy.indexOf(current);
    if (currentIndex > roleIndex) {
      await member.roles.add(role);
      await member.roles.remove(current);
    } else return;
  } else {
    const currentIndex = hierarchy.indexOf(current);
    if (currentIndex <= 0) return;
    await member.roles.remove(current);
    await member.roles.add(hierarchy[currentIndex - 1]);
  }
}

export async function getHierarchyRole(
  member: GuildMember,
  hierarchy?: Role[],
) {
  if (!hierarchy) hierarchy = await getHierarchy(member.guild);
  await member.fetch();
  return hierarchy.find(role => member.roles.cache.has(role.id));
}

export async function isAbove(
  member: GuildMember,
  other: GuildMember,
  hierarchy?: Role[],
) {
  if (!hierarchy) hierarchy = await getHierarchy(member.guild);
  const memberRole = await getHierarchyRole(member, hierarchy);
  const otherRole = await getHierarchyRole(other, hierarchy);
  return hierarchy.indexOf(memberRole) > hierarchy.indexOf(otherRole);
}

export async function isBelow(
  member: GuildMember,
  other: GuildMember,
  hierarchy?: Role[],
) {
  if (!hierarchy) hierarchy = await getHierarchy(member.guild);
  const memberRole = await getHierarchyRole(member, hierarchy);
  const otherRole = await getHierarchyRole(other, hierarchy);
  return hierarchy.indexOf(memberRole) < hierarchy.indexOf(otherRole);
}
