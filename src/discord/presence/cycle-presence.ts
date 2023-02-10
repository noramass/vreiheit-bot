import { PresenceData } from "discord.js";
import { withClient } from "src/discord/init";
import { sleep } from "src/util";
import { cyclicIterator } from "src/util/iterator";

export async function cyclePresence(
  presences: (PresenceData & { duration?: number })[],
) {
  const client = await withClient();

  for (const { duration = 60, ...presence } of cyclicIterator(presences)) {
    client.user.setPresence(presence);
    await sleep(duration * 1000);
  }
}
