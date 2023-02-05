import { ActivityType } from "discord.js";
import { registeredHandlers } from "src/decorators/handler";
import { Server } from "src/entities/server";
import { ServerMember } from "./entities/server-member";
import { dataSource } from "src/init/data-source";
import { client, generateInvite, withClient } from "src/init/discord";
import { cyclePresence } from "src/presence/cycle-presence";
import { getHierarchy, getHierarchyRole } from "src/roles/hierachy/hierachy";
import { roleByName } from "src/roles/role-by-name";
import { cyclicIterator } from "src/util";
import "./commands";
import "./services";
import { addMemberEntry, setMemberLeft } from "./members/member-entries";
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
  const id = (interaction as any).customId ?? "";
  for (const [cid, handlers] of Object.entries(
    registeredHandlers.interaction,
  )) {
    if (id === cid || id.startsWith(cid + ":")) {
      const remaining =
        cid === "" ? id : id === cid ? "" : id.slice(cid.length + 1);
      for (const handler of handlers)
        await handler(interaction, ...remaining.split(":"));
    }
  }
});

client.on("messageCreate", async message => {
  for (const handler of registeredHandlers.message) {
    await handler(message);
  }
});

client.on("guildMemberRemove", async member => {
  for (const handler of registeredHandlers.memberLeave)
    await handler(member as any);

  // await removeCustomPronounRole(member as any);
  if(member.user.bot) return;
  await setMemberLeft(member);
});

client.on("guildMemberAdd", async member => {
  for (const handler of registeredHandlers.memberJoin)
    await handler(member as any);

  const bot = await roleByName(member.guild, "Bot");
  const hierarchy = await getHierarchy(member.guild);

  if (member.user.bot) await member.roles.add(bot);
  else {
    await member.fetch();
    const role = await getHierarchyRole(member, hierarchy);
    if (!role) await member.roles.add(hierarchy[0]);
    console.log(member.user.username, "ist dem server beigetreten");
    // TODO: welcome messages
    await addMemberEntry(member);
  }
});

client.on("ready", async client => {
  for (const handler of registeredHandlers.init) await handler(client);
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
