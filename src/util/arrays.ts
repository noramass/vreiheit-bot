export function chunks<T>(array: T[], chunkSize: number): T[][] {
  const count = Math.ceil(array.length / chunkSize);
  return Array.from({ length: count }, (_, i) => array.slice(i * chunkSize, (i + 1) * chunkSize));
}
