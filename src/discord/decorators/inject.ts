import { Constructor } from "src/discord/decorators/meta";

const registeredServices = new Map<Constructor, any>();
export function InjectService(cls: () => any) {
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
