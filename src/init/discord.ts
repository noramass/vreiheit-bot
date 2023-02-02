import { Client, OAuth2Scopes } from "discord.js";
import { env } from "src/init/env";
import { PromiseOr } from "src/util";

export const client = new Client({
  intents: [
    "Guilds",
    //    "GuildIntegrations",
    //    "GuildMembers",
    //    "GuildMessages",
    //    "GuildMessageReactions",
    //    "GuildModeration",
    //    "GuildEmojisAndStickers",
    "DirectMessages",
    //    "DirectMessageReactions",
    //    "MessageContent",
  ],
});

let clientLoginPromise: Promise<Client> | undefined;
export async function withClient(): Promise<Client<true>> {
  if (client.isReady()) return client;
  if (clientLoginPromise != null) return clientLoginPromise;
  clientLoginPromise = (client as any).login(env("discord_token")).then(() => client);
  await clientLoginPromise;
  clientLoginPromise = undefined;
  return client;
}

export function generateInvite() {
  return client.generateInvite({
    scopes: [OAuth2Scopes.Bot],
    permissions: ["Administrator"],
  });
}
