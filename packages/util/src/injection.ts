export interface InjectableOptions<T> {
  initialise?: boolean;
  factory?: () => T;
}

export type Constructor<T> = new (...args: any) => T;

export type InjectableDecorator = <T>(
  options?: InjectableOptions<T>,
) => (Cls: Constructor<T>) => Constructor<T>;
export type InjectPropertyDecorator = <T>(
  cls: (() => Constructor<T>) | string,
) => (
  proto: any,
  propertyKey: string | symbol,
  desc?: TypedPropertyDescriptor<T>,
) => void;

export type InitDecorator = <T>(cls: T) => T;

export interface InjectionDecorators {
  Injectable: InjectableDecorator;
  Inject: InjectPropertyDecorator;
  register: (key: any, factory: () => any) => void;
  Init: InitDecorator;
  withInit: <T extends (...any) => any>(decorator: T) => T;
}

function cache<T>(fn: () => T): () => T {
  let cached: T | undefined;
  return () => (cached ??= fn());
}

export function createInjectionDecorators(
  appendInit = true,
): InjectionDecorators {
  const registered = new Map<any, () => any>();

  function register(key: any, factory: () => any) {
    registered.set(key, cache(factory));
  }

  function Injectable({ initialise, factory }: InjectableOptions<any> = {}) {
    return function (Cls: any) {
      Cls = Init(Cls);
      if (initialise) factory = () => new Cls();
      if (factory) {
        registered.set(Cls, cache(factory));
        return Cls;
      }
      return class extends Cls {
        constructor(...params: any[]) {
          super(...params);
          registered.set(Cls, () => this);
        }
      };
    };
  }

  function Inject(cls: (() => any) | string): PropertyDecorator {
    return (proto, key) => {
      const descriptor = {
        get: () => registered.get(typeof cls === "string" ? cls : cls())(),
      };
      Object.defineProperty(proto, key, descriptor);
      if (appendInit) {
        if (!(proto as any).__init) (proto as any).__init = () => undefined;
        const orig = (proto as any).__init;
        (proto as any).__init = function (...params) {
          orig.call(this, ...params);
          Object.defineProperty(this, key, descriptor);
        };
      }
    };
  }

  function Init(cls: any): any {
    return class extends cls {
      constructor(...params: any[]) {
        super(...params);
        if (typeof this["__init"] === "function") this.__init();
        this["__init"] = undefined;
      }
    };
  }

  function withInit(decorator: any): any {
    return function (...params) {
      return function (Cls) {
        return decorator(...params)(Init(Cls));
      };
    };
  }

  return { Inject, Injectable, Init, register, withInit };
}
