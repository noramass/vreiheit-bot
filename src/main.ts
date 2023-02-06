import { ActivityType } from "discord.js";
import { registeredHandlers } from "src/decorators/handler";
import { Server } from "src/entities/server";
import { dataSource } from "src/init/data-source";
import { client, generateInvite, withClient } from "src/init/discord";
import { cyclePresence } from "src/presence/cycle-presence";
import { cyclicIterator } from "src/util";
import "./services";
export async function initialise() {
  await dataSource.initialize();
  const client = await withClient();
  const invite = generateInvite();
  console.log(`bot initialised!\ninvite with ${invite}!`);

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

  await cyclePresence([
    {
      status: "online",
      activities: [
        {
          type: ActivityType.Watching,
          name: "Derkarldent auf Twitch zu",
          url: "https://www.twitch.tv/dekarldent",
        },
      ],
      duration: 120,
    },
  ]);
}

let lastProcessed: string;
client.on("interactionCreate", async interaction => {
  if (lastProcessed === interaction.id) return;
  lastProcessed = interaction.id;
  for (const handler of registeredHandlers.interaction)
    await handler(interaction);
});

client.on("ready", async client => {
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

if (!module.parent)
  (async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const ignored of cyclicIterator([""]))
      try {
        await initialise();
      } catch (e) {
        console.error(e);
        console.log("restarting");
      }
  })().then();
