import { CachedManager } from "discord.js";

export async function getSingleCached<K, T, R>(
  manager: CachedManager<K, T, R>,
  key: K,
  many = false,
): Promise<T> {
  if (manager.cache.has(key)) return manager.cache.get(key);
  if (many) await (manager as any).fetch();
  else return (manager as any).fetch(key);
  return manager.cache.get(key);
}
