export function parkMiller(seed: string | number = Date.now()) {
  let s = typeof seed === "string" ? cyrb53(seed) : seed;
  return function next() {
    return (s = (Math.imul(48271, s) >>> 0) % 2147483647) / 2147483647;
  };
}

/**
 * cyrb53 (c) 2018 bryc (github.com/bryc)
 * A fast and simple hash function with decent collision resistance.
 * Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
 * Public domain. Attribution appreciated.
 */
export function cyrb53(str: string, seed: number = 0): number {
  let h1 = 0xdeedbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; ++i) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
