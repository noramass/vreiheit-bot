import { GuildMember } from "discord.js";
import { Server } from "src/database/entities/server";
import { ServerMember } from "src/database/entities/server-member";
import { dataSource } from "src/database/data-source";
import { PromiseOr } from "src/util";

export async function getServerMember(member: GuildMember, save = true) {
  let user = await dataSource.getRepository(ServerMember).findOne({
    where: { discordId: member.user.id, guild: { discordId: member.guild.id } },
    relations: ["guild"],
  });
  if (user == null) {
    user = new ServerMember();
    user.discordId = member.user.id;
    user.guild = await getServer(member.guild.id);
  }
  user.username = member.user.username;
  user.discriminator = member.user.discriminator;
  user.avatarUrl = member.displayAvatarURL();
  if (save) await dataSource.getRepository(ServerMember).save(user);
  return user;
}

export async function withServerMember(
  member: GuildMember,
  fn: (member: ServerMember) => PromiseOr<void>,
) {
  const user = await getServerMember(member, false);
  await fn(user);
  await dataSource.getRepository(ServerMember).save(user);
}

export async function getServer(id: string) {
  return await dataSource
    .getRepository(Server)
    .findOne({ where: { discordId: id } });
}

export async function withServer(
  id: string,
  fn: (server: Server) => PromiseOr<void>,
) {
  const server = await getServer(id);
  await fn(server);
  await dataSource.getRepository(Server).save(server);
}
