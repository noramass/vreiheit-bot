import { Constructor } from "src/decorators/meta";

const registeredServices = new Map<Constructor, any>();
export function InjectService(cls: () => Constructor) {
  return function (proto, key: string | symbol) {
    Object.defineProperty(proto, key, {
      get() {
        return registeredServices.get(cls());
      },
    });
  };
}

export function registerService(cls: Constructor, instance: any) {
  registeredServices.set(cls, instance);
}
