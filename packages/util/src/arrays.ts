export function chunks<T>(
  array: T extends string ? string : T[],
  chunkSize: number,
): T extends string ? string[] : T[][] {
  const count = Math.ceil(array.length / chunkSize);
  return Array.from({ length: count }, (_, i) =>
    array.slice(i * chunkSize, (i + 1) * chunkSize),
  ) as any;
}
