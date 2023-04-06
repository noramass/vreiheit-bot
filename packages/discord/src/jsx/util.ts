export function setterName(
  str: string,
  replacementMap: Record<string, string> = {},
) {
  if (str in replacementMap) return replacementMap[str];
  return "set" + upperFirst(str);
}

export function upperFirst<T extends string>(str: T): Capitalize<T> {
  if (str.length === 0) return "" as any;
  return (str.slice(0, 1).toUpperCase() + str.slice(1)) as any;
}

export function applySetters(builder: any, record: any, replacements?: any) {
  for (const [key, value] of Object.entries(record ?? {})) {
    if (value == null) continue;
    const setter = setterName(key, replacements);
    if (setter in builder) builder[setter].call(builder, value);
  }
}
