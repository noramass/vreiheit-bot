import { diffJson } from "diff";
export type Entry<Key extends string = string, Value = unknown> = [Key, Value];

function buildRecursiveProcessor(
  filter: (a: Entry) => unknown,
  sort: (a: Entry, b: Entry) => number,
) {
  return function recurse(obj: any) {
    return Array.isArray(obj)
      ? obj.map(recurse)
      : typeof obj === "object" && obj
      ? Object.fromEntries(
          Object.entries(obj)
            .filter(filter)
            .sort(sort)
            .map(([key, value]) => [key, recurse(value)]),
        )
      : obj;
  };
}

function sortKeys([a]: Entry, [b]: Entry) {
  return b > a ? 1 : b < a ? -1 : 0;
}

function excludeTerms(terms: string[]) {
  return ([key]: Entry) => !terms.includes(key);
}

export function objectsAreEqual(
  source: any,
  target: any,
  excludes: string[] = [],
) {
  const normalise = buildRecursiveProcessor(excludeTerms(excludes), sortKeys);

  const fromKeys = (command: any, other: any) =>
    Array.isArray(command) || Array.isArray(other)
      ? other ?? []
      : Object.fromEntries(
          Object.entries(command).map(([key, value]) => {
            if (typeof value === "object" || typeof other?.[key] === "object")
              return [key, fromKeys(value, other?.[key])];
            else return [key, other?.[key]];
          }),
        );

  return (
    diffJson(
      JSON.stringify(normalise(source), null, 2),
      JSON.stringify(normalise(fromKeys(source, target)), null, 2),
    ).length === 1
  );
}
