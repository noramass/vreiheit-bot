import { GuildMember } from "discord.js";
import { Server } from "../../database/entities/server";
import { ServerMember } from "../../database/entities/server-member";
import { dataSource } from "../../database/data-source";

export const addMemberEntry = async (member: GuildMember) => {
  const guild = await dataSource
    .getRepository(Server)
    .findOne({ where: { discordId: member.guild.id } });

  const existingUser = await dataSource
    .getRepository(ServerMember)
    .findOne({ where: { discordId: member.user.id } });
  if (existingUser) {
    existingUser.leftAt = null;
    await dataSource.getRepository(ServerMember).save(existingUser);
    return;
  }
  const userEntry: Partial<ServerMember> = {
    discordId: member.user.id,
    username: member.user.username,
    discriminator: member.user.discriminator,
    avatarUrl: member.user.avatarURL(),
    guild,
  };
  userEntry.discordId = member.user.id;
  await dataSource.getRepository(ServerMember).save(userEntry);
};
