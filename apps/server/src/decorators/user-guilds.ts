import { createRequestInjector } from "@propero/easy-api";
import { dataSource, Server, ServerMember, User } from "@vreiheit/database";
import { discord, getSingleCached } from "@vreiheit/discord";
import { PermissionsString } from "discord.js";
import { Request } from "express";
import { client } from "../../../../src/discord/init";

export const UserGuilds = createUserDecorator(async (req, user) => {
  return await dataSource.getRepository(Server).find({
    where: {
      members: { discordId: user.id },
    },
  });
});

export const UserMembers = createUserDecorator(async (req, user) => {
  return await dataSource.getRepository(ServerMember).find({
    where: { discordId: user.id },
  });
});

export const UserPermissions = (...permissions: PermissionsString[]) =>
  createUserDecorator(async (req, user) => {
    const servers = await dataSource.getRepository(Server).find({
      where: {
        members: { discordId: user.id },
      },
    });
    const guilds = await Promise.all(
      servers.map(({ discordId }) =>
        getSingleCached(discord.guilds, discordId),
      ),
    );
    const members = await Promise.all(
      guilds.map(({ members }) => getSingleCached(members, user.id)),
    );
    return Object.fromEntries(
      members.map(member => [
        member.guild.id,
        permissions.every(it => member.permissions.has(it)),
      ]),
    );
  });

export function createUserDecorator(fn: (req: Request, user: User) => any) {
  return createRequestInjector(() => async req => {
    const user = req.session["user"];
    if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    return await fn(req, user);
  });
}
