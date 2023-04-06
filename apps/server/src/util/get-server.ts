import { dataSource, Server } from "@vreiheit/database";
import { discord, getSingleCached } from "@vreiheit/discord";

export async function getServer(id: string) {
  const guild = await getSingleCached(discord.guilds, id);
  const repo = dataSource.getRepository(Server);
  const server = repo.create({
    discordId: guild.id,
    name: guild.name,
    description: guild.description,
    icon: guild.iconURL(),
    splash: guild.splashURL(),
  });
  await repo.upsert(server, {
    conflictPaths: ["discordId"],
    skipUpdateIfNoValuesChanged: true,
  });
  return await repo.findOne({ where: { discordId: id } });
}
