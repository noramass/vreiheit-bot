export function createInjectionDecorators() {
  const registered = new Map<any, any>();
  function Injectable(Cls: any) {
    return class extends Cls {
      constructor(...params: any[]) {
        super(...params);
        registered.set(Cls, this);
      }
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
