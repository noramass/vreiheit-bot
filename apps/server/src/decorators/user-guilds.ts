import { createRequestInjector } from "@propero/easy-api";
import { dataSource, Server, ServerMember, User } from "@vreiheit/database";
import { Request } from "express";

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

export function createUserDecorator(fn: (req: Request, user: User) => any) {
  return createRequestInjector(() => async req => {
    const user = req.session["user"];
    if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
    return await fn(req, user);
  });
}
