import { env } from "@vreiheit/util";
import { Client } from "discord.js";

export const discord = new Client({
  intents: [
    "Guilds",
    "GuildIntegrations",
    "GuildMembers",
    "GuildMessages",
    "GuildBans",
    "GuildPresences",
    // "GuildMessageReactions",
    "GuildModeration",
    // "GuildEmojisAndStickers",
    "GuildVoiceStates",
    "DirectMessages",
    "DirectMessageReactions",
    "MessageContent",
  ],
});

export const discordLogin = () => discord.login(env("discord_token"));
