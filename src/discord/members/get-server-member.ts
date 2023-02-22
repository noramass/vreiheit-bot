import { GuildMember } from "discord.js";
import { Server } from "src/database/entities/server";
import { ServerMember } from "src/database/entities/server-member";
import { dataSource } from "src/database/data-source";
import { PromiseOr } from "src/util";
import { DeepPartial } from "typeorm";

const serverCache: Record<string, string> = {};

export async function getServerMember(
  member: GuildMember,
  properties: DeepPartial<ServerMember> = {},
) {
  const repo = dataSource.getRepository(ServerMember);
  const filter = {
    where: {
      discordId: member.user.id,
      guild: { discordId: member.guild.id },
    },
    relations: ["guild"],
  };

  const matching = await repo.findOne(filter);
  const { identifiers } = await repo.upsert(
    {
      uuid: matching?.uuid,
      discordId: member.user.id,
      username: member.user.username,
      discriminator: member.user.discriminator,
      avatarUrl: member.user.displayAvatarURL(),
      ...properties,
    },
    ["uuid"],
  );
  return await repo.findOne({ where: identifiers[0], relations: ["guild"] });
}

export async function withServerMember(
  member: GuildMember,
  fn: (member: ServerMember) => PromiseOr<void>,
) {
  const user = await getServerMember(member);
  await fn(user);
  await dataSource.getRepository(ServerMember).save(user);
}

export async function updateServerMember(
  member: GuildMember,
  partial: DeepPartial<ServerMember>,
) {
  await getServerMember(member, partial);
}

export async function getServer(id: string) {
  return await dataSource
    .getRepository(Server)
    .findOne({ where: { discordId: id } });
}

export async function getServerConstraint(id: string) {
  return { uuid: await getServerId(id) } as Server;
}

export async function getServerId(id: string) {
  return (serverCache[id] ??= (await getServer(id)).uuid);
}

export async function withServer(
  id: string,
  fn: (server: Server) => PromiseOr<void>,
) {
  const server = await getServer(id);
  await fn(server);
  await dataSource.getRepository(Server).save(server);
}
