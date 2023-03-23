export function* cyclicIterator<T>(values: T[]) {
  for (let i = 0; i < values.length; ++i) {
    yield values[i];
    if (i === values.length - 1) i = 0;
  }
}
