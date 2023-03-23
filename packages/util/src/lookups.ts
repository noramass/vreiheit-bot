export function createLookup<T, R extends string = string>(
  items: T[],
  map: (item: T, index: number, all: T[]) => R,
): Record<R, T> {
  return Object.fromEntries(
    items.map((item, index, all) => [map(item, index, all), item]),
  ) as any;
}

export function createInverseLookup<K extends string, T, IK extends string>(
  lookup: Record<K, T>,
  map: (item: T, key: K) => IK,
): Record<IK, K> {
  return Object.fromEntries(
    Object.entries(lookup).map(([key, value]) => [
      map(value as T, key as K),
      key,
    ]),
  ) as any;
}

export function mapMembers<K extends string, V, RV>(
  lookup: Record<K, V>,
  map: (item: V, key: K) => RV,
): Record<K, RV> {
  return Object.fromEntries(
    Object.entries(lookup).map(([key, value]) => [
      key,
      map(value as V, key as K),
    ]),
  ) as any;
}

export function resolve<T = any>(object: any, path: string): T {
  if (typeof object !== "object" || !object) return object;
  return path.split("/").reduce((trunk, branch) => trunk?.[branch], object);
}

export function resolveFirst<T = any>(
  object: any,
  paths: string[],
  condition: (value: any) => any = it => it != null,
): T {
  for (const path of paths) {
    const value = resolve<T>(object, path);
    if (condition(value)) return value;
  }
}
