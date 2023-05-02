export interface InjectableOptions<T> {
  initialise?: boolean;
  factory?: () => T;
}

export type Constructor<T> = new (...args: any) => T;

export type InjectableDecorator = <T>(
  options?: InjectableOptions<T>,
) => (Cls: Constructor<T>) => Constructor<T>;
export type InjectPropertyDecorator = <T>(
  cls: () => Constructor<T>,
) => (
  proto: any,
  propertyKey: string | symbol,
  desc?: TypedPropertyDescriptor<T>,
) => void;

export interface InjectionDecorators {
  Injectable: InjectableDecorator;
  Inject: InjectPropertyDecorator;
}

function cache<T>(fn: () => T): () => T {
  let cached: T | undefined;
  return () => (cached ??= fn());
}

export function createInjectionDecorators(): InjectionDecorators {
  const registered = new Map<any, () => any>();
  function Injectable({ initialise, factory }: InjectableOptions<any> = {}) {
    return function (Cls: any) {
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

  function Inject(cls: () => any): PropertyDecorator {
    return (proto, key) => {
      Object.defineProperty(proto, key, {
        get: () => registered.get(cls()),
      });
    };
  }

  return { Inject, Injectable };
}
