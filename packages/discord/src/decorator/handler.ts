import { Client, ClientEvents } from "discord.js";
import { DiscordHandlerMeta, DiscordMeta, getDiscordMeta } from "src/util";

interface DiscordServiceMeta {
  cls: any;
  instance: any;
  meta: DiscordMeta;
}

export function createDiscordServiceDecorator() {
  const services: DiscordServiceMeta[] = [];
  function DiscordController(prefix?: string) {
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

    const allHandlers: Record<string, any[]> = {};

    for (const { meta, instance } of services) {
      for (const type of Object.keys(
        meta.handlers,
      ) as (keyof DiscordHandlerMeta)[]) {
        const handlers = meta.handlers[type];
        if (!handlers.length) continue;
        (allHandlers[map[type]] ??= []).push(async (...params: any[]) => {
          for (const handler of handlers)
            (handler as any)({ params, meta, context: instance });
        });
      }
    }
    for (const [event, handlers] of Object.entries(allHandlers))
      client.on(event, async (...params: any[]) => {
        for (const handler of handlers)
          try {
            await handler(...params);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
      });
  }

  return [DiscordController, applyServices] as const;
}

export const [DiscordController, applyServices] =
  createDiscordServiceDecorator();
