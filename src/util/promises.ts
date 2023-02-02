export type ThenHandler<T, R> = (result: T) => Promise<R>;
export interface Thenable<T> {
  then(): Promise<T>;
  then<R = T>(handler?: ThenHandler<T, R>): Promise<R>;
}

export interface Catchable<E> {
  catch(): Promise<E>;
  catch<R = E>(handler?: ThenHandler<E, R>): Promise<R>;
}

export type PromiseOr<T> = Promise<T> | T;

export function isThenable<T = unknown>(it: any): it is Thenable<T> {
  return !!it && typeof it === "object" && "then" in it && typeof it["then"] === "function";
}

export function isCatchable<E = unknown>(it: any): it is Catchable<E> {
  return !!it && typeof it === "object" && "catch" in it && typeof it["catch"] === "function";
}
