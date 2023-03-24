export function createLastFilter() {
  let last: unknown = undefined;
  return function next(it: unknown) {
    if (last === it) return false;
    last = it;
    return true;
  };
}
