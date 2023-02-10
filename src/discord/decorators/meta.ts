import { emptyHandlerMap, HandlerMap } from "src/discord/decorators/handler";

export type Constructor<T = any, Args extends any[] = any> = (
  ...params: Args
) => T;
export interface DiscordHandlerMeta {
  prefix: string;
  handlers: HandlerMap;
}

const META = Symbol("discord handler meta");
export function getMeta(cls: Constructor): DiscordHandlerMeta {
  return ((cls as any)[META] ??= {
    prefix: "",
    handlers: emptyHandlerMap(),
  });
}
