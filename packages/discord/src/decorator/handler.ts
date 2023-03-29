import { Client, ClientEvents } from "discord.js";
import { DiscordHandlerMeta, DiscordMeta, getDiscordMeta } from "src/util";

interface DiscordServiceMeta {
  cls: any;
  instance: any;
  meta: DiscordMeta;
}

export function createDiscordServiceDecorator() {
  const services: DiscordServiceMeta[] = [];
  function DiscordService(prefix?: string) {
    return function <T>(cls: T): T {
      const meta = getDiscordMeta(cls);
      meta.prefix = prefix;
      return class extends (cls as any) {
        constructor(...args: any[]) {
          super(...args);
          services.push({ cls, instance: this, meta });
        }
      } as T;
    };
  }

  function applyServices(client: Client) {
    const map: Record<keyof DiscordHandlerMeta, keyof ClientEvents> = {
      banCreate: "guildBanAdd",
      banRemove: "guildBanRemove",
      messageCreate: "messageCreate",
      messageUpdate: "messageUpdate",
      messageDelete: "messageDelete",
      roleCreate: "roleCreate",
      roleUpdate: "roleUpdate",
      roleDelete: "roleDelete",
      memberJoin: "guildMemberAdd",
      memberUpdate: "guildMemberUpdate",
      memberLeave: "guildMemberRemove",
      interaction: "interactionCreate",
      init: "ready",
      voiceStateUpdate: "voiceStateUpdate",
    };

    for (const { meta, instance } of services) {
      for (const type of Object.keys(
        meta.handlers,
      ) as (keyof DiscordHandlerMeta)[]) {
        const handlers = meta.handlers[type];
        if (!handlers.length) continue;
        client.on(map[type], async (...params: any[]) => {
          for (const handler of handlers)
            (handler as any)({ params, meta, context: instance });
        });
      }
    }
  }

  return [DiscordService, applyServices] as const;
}

export const [DiscordService, applyServices] = createDiscordServiceDecorator();
