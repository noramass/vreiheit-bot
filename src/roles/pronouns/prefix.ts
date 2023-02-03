export function pronounPrefix(pronouns: string): string {
  return `Pronomen: ${pronouns}`;
}

export function stripPronounPrefix(name: string): string {
  const prefix = pronounPrefix("");
  if (!name.startsWith(prefix)) throw new Error(`${name} is not a prefixed pronoun`);
  return name.slice(prefix.length);
}
