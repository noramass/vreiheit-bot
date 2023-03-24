import { ClientEvents, GuildMember, Interaction } from "discord.js";

const META = Symbol("discord meta");

export interface DiscordMeta {
  handlers: DiscordHandlerMeta;
  prefix?: string;
}

export interface DiscordHandlerMeta {
  interaction: DiscordHandler<"interactionCreate">[];

  memberJoin: DiscordHandler<"guildMemberAdd">[];
  memberUpdate: DiscordHandler<"guildMemberUpdate">[];
  memberLeave: DiscordHandler<"guildMemberRemove">[];

  banCreate: DiscordHandler<"guildBanAdd">[];
  banRemove: DiscordHandler<"guildBanRemove">[];

  roleCreate: DiscordHandler<"roleCreate">[];
  roleUpdate: DiscordHandler<"roleUpdate">[];
  roleDelete: DiscordHandler<"roleDelete">[];

  messageCreate: DiscordHandler<"messageCreate">[];
  messageUpdate: DiscordHandler<"messageUpdate">[];
  messageDelete: DiscordHandler<"messageDelete">[];

  init: DiscordHandler<"ready">[];
  voiceStateUpdate: DiscordHandler<"voiceStateUpdate">[];
}

export type DiscordHandler<Field extends keyof ClientEvents> = (options: {
  params: ClientEvents[Field];
  context: any;
  meta: DiscordMeta;
}) => void;

export type DiscordHandlerParams<Field extends keyof DiscordHandlerMeta> =
  Parameters<DiscordHandlerMeta[Field][number]>[0]["params"];
export function getDiscordMeta(cls: any) {
  return (cls[META] ??= createMeta());
}

function createMeta(): DiscordMeta {
  return {
    handlers: {
      interaction: [],
      memberJoin: [],
      memberLeave: [],
      memberUpdate: [],
      banCreate: [],
      banRemove: [],
      roleCreate: [],
      roleDelete: [],
      roleUpdate: [],
      messageCreate: [],
      messageDelete: [],
      messageUpdate: [],
      init: [],
      voiceStateUpdate: [],
    },
  };
}

export function prefixedId(prefix?: string, id?: string) {
  if (id && id.startsWith("-")) return id.slice(1);
  if (prefix) return id ? `${prefix}:${id}` : prefix;
  return id ?? "";
}

export function idMatches(toCheck: string, prefix?: string, id?: string) {
  const full = prefixedId(prefix, id);
  return toCheck === full || toCheck.startsWith(`${full}:`);
}

export function remainingId(
  toCheck: string,
  prefix?: string,
  id?: string,
): string[] {
  const full = prefixedId(prefix, id);
  return toCheck
    .slice(full.length + 1)
    .split(":")
    .filter(it => it);
}
