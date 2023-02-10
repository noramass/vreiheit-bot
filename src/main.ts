import { ActivityType } from "discord.js";
import { dataSource } from "src/database/data-source";
import { generateInvite, withClient } from "src/discord/init";
import { cyclePresence } from "src/discord/presence/cycle-presence";
import { initApi } from "src/server/init";
import { cyclicIterator } from "src/util";
import "./discord/services";
import "./discord/register-handlers";
export async function initialise() {
  await dataSource.initialize();
  await withClient();
  const invite = generateInvite();
  console.log(`bot initialised!\ninvite with ${invite}!`);
  await initApi(invite);

  await cyclePresence([
    {
      status: "online",
      activities: [
        {
          type: ActivityType.Watching,
          name: "vegane Kochvideos",
        },
        {
          type: ActivityType.Competing,
          name: "mit den Besten",
        },
        {
          type: ActivityType.Playing,
          name: "Faschos wie eine Geige",
        },
        {
          type: ActivityType.Streaming,
          name: "vegane Debatten",
        },
        {
          type: ActivityType.Listening,
          name: "vegane Talks",
        },
        {
          type: ActivityType.Watching,
          name: "Dokumentationen",
        },
      ],
      duration: 120,
    },
  ]);
}

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
