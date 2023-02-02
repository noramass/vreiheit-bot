import { generateInvite, withClient } from "src/init/discord";
export async function initialise() {
  await withClient();
  const invite = generateInvite();
  console.log(`bot initialised!\ninvite with ${invite}!`);
}

if (!module.parent) initialise().then();
