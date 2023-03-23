import * as Diff from "diff";

interface BasicPatch {
  added: boolean;
  removed: boolean;
  value: string;
}

interface ConsolidatedPatch {
  added?: string;
  removed?: string;
  value?: string;
}

export function buildDiffFormatter(
  diffGenerator: (a: string, b: string) => BasicPatch[],
  formatAdded: (str: string) => string,
  formatRemoved: (str: string) => string,
  formatReplaced?: (from: string, to: string) => string,
) {
  formatReplaced ??= (from, to) =>
    `${formatRemoved(from)} -> ${formatAdded(to)}`;
  return function (a: string, b: string) {
    const patches = diffGenerator(a, b);
    if (patches.length === 1) return patches[0].value;
    const parts = consolidatePatches(patches);
    return parts
      .map(({ added, removed, value }) => {
        if (added != null && removed != null)
          return formatReplaced(removed, added);
        if (added != null) return formatAdded(added);
        if (removed != null) return formatRemoved(removed);
        return value;
      })
      .join("");
  };
}

function consolidatePatches(patches: BasicPatch[]): ConsolidatedPatch[] {
  const results: ConsolidatedPatch[] = [];
  let last: ConsolidatedPatch | undefined = undefined;
  function next(patch: ConsolidatedPatch): void {
    results.push((last = patch));
  }
  for (const { added, removed, value } of patches) {
    if (added || removed) {
      if (
        typeof last?.value === "undefined" ||
        (added && typeof last!.added !== "undefined") ||
        (removed && typeof last!.removed !== "undefined")
      )
        next({
          added: added ? value : undefined,
          removed: removed ? value : undefined,
        });
      else if (added) last!.added = value;
      else if (removed) last!.added = value;
      else
        next({
          added: added ? value : undefined,
          removed: removed ? value : undefined,
        });
    } else next({ value });
  }
  return results;
}

export const markdownDiff = buildDiffFormatter(
  (a, b) => Diff.diffWords(a, b, { ignoreCase: true }),
  str => `[**${str}**]`,
  str => `[~~${str}~~]`,
  (from, to) => `[~~${from}~~ -> **${to}**]`,
);
