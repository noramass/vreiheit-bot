import { dataSource } from "src/database/data-source";
import { Server } from "src/database/entities/server";
import { registeredHandlers } from "src/discord/decorators";
import { client } from "src/discord/init";

let lastProcessed: string;
client.on("interactionCreate", async interaction => {
  if (lastProcessed === interaction.id) return;
  lastProcessed = interaction.id;
  for (const handler of registeredHandlers.interaction)
    await handler(interaction);
});

client.on("ready", async client => {
  await client.guilds.fetch();
  for (const guild of client.guilds.cache.values()) {
    const preview = await guild.fetchPreview();
    await dataSource.getRepository(Server).upsert(
      {
        discordId: guild.id,
        name: guild.name,
        icon: preview.iconURL(),
        splash: preview.splashURL(),
        description: preview.description,
      },
      ["discordId"],
    );
  }
  for (const handler of registeredHandlers.init) await handler(client);
});

client.on("guildMemberRemove", async member => {
  for (const handler of registeredHandlers.memberLeave)
    await handler(member as any);
});

client.on("guildMemberAdd", async member => {
  for (const handler of registeredHandlers.memberJoin)
    await handler(member as any);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  for (const handler of registeredHandlers.memberUpdate)
    await handler(oldMember as any, newMember);
});

client.on("guildBanAdd", async ban => {
  for (const handler of registeredHandlers.ban) await handler(ban);
});

client.on("guildBanRemove", async ban => {
  for (const handler of registeredHandlers.unban) await handler(ban);
});

client.on("roleUpdate", async (oldRole, newRole) => {
  for (const handler of registeredHandlers.roleUpdate)
    await handler(oldRole, newRole);
});

client.on("roleCreate", async role => {
  for (const handler of registeredHandlers.roleCreate) await handler(role);
});

client.on("roleDelete", async role => {
  for (const handler of registeredHandlers.roleDelete) await handler(role);
});

client.on("messageCreate", async message => {
  for (const handler of registeredHandlers.messageCreate)
    await handler(message);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  for (const handler of registeredHandlers.messageUpdate)
    await handler(oldMessage as any, newMessage as any);
});

client.on("messageDelete", async message => {
  for (const handler of registeredHandlers.messageDelete)
    await handler(message as any);
});

client.on("error", console.error);
