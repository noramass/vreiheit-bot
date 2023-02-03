import { ActivityType } from "discord.js";
import { client, generateInvite, withClient } from "src/init/discord";
import { cyclePresence } from "src/presence/cycle-presence";
import {
  cleanupPronounRoles,
  getAllPronounRoles,
  removeCustomPronounRole,
} from "src/roles/pronouns";
import {
  createPrimaryPronounButtons,
  processPronounInteraction,
} from "src/roles/pronouns/buttons";
export async function initialise() {
  const client = await withClient();
  const invite = generateInvite();
  console.log(`bot initialised!\ninvite with ${invite}!`);

  cyclePresence([
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
  ]).then();

  await client.guilds.fetch();
  for (const guild of client.guilds.cache.values()) {
    await cleanupPronounRoles(guild);
  }
}

let lastProcessed: string;
client.on("interactionCreate", async interaction => {
  if (lastProcessed === interaction.id) return;
  lastProcessed = interaction.id;
  console.log(interaction.guild.name, interaction.id);
  await processPronounInteraction(interaction);
});

client.on("messageCreate", async message => {
  console.log(message.content, message.cleanContent);
  if (message.guild && message.content.startsWith("!!!")) {
    const buttons = await createPrimaryPronounButtons(message.guild as any);
    try {
      await message.channel.send({
        content: "Wähle deine Pronomen",
        embeds: [],
        components: buttons as any,
      });
    } catch (e) {
      console.log(e);
    }
  }
});

client.on("guildMemberRemove", async member => {
  await removeCustomPronounRole(member as any);
});

if (!module.parent) initialise().then();
