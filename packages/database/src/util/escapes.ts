import { ILike, Like } from "typeorm";

export function replaceLike(
  pattern: string,
  replacements: Record<string, string>,
) {
  return replace(pattern, replacements, escapeLike);
}

export function replace(
  pattern: string,
  replacements: Record<string, string>,
  escape: (str: string) => string,
) {
  for (const [key, value] of Object.entries(replacements))
    pattern = replaceParam(pattern, key, value, escape);
  return pattern;
}

export function replaceParam(
  pattern: string,
  key: string,
  value: string,
  escape: (str: string) => string,
) {
  if (typeof value === "function")
    throw new Error(`Function parameter is not supported for "${key}"`);
  if (!key.match(/^([A-Za-z0-9_.]+)$/))
    throw new Error(
      "Parameter keys may only contain numbers, letters, underscores or periods",
    );
  return pattern.replace(
    new RegExp(`:${key.replaceAll(".", "\\.")}`, "g"),
    escape(String(value)),
  );
}

export function escapeLike(str: string) {
  return str.replace(/[\\%_]/g, "\\$&");
}

export const Safe = {
  ILike: (pattern: string, replacements: Record<string, string>) =>
    ILike(replaceLike(pattern, replacements)),
  Like: (pattern: string, replacements: Record<string, string>) =>
    Like(replaceLike(pattern, replacements)),
};
