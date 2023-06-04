import { ValueTransformer } from "typeorm";

export class Flags<
  T extends number | bigint = number,
  M extends T extends number ? number : bigint = T extends number
    ? number
    : bigint,
> {
  constructor(public value: T | null, public bigint: boolean) {}

  has(mask: M) {
    if (this.value == null) return false;
    return (this.value & mask) === mask;
  }

  hasOne(flag: M) {
    if (this.value == null) return false;
    return (this.value & flag) === 0;
  }

  set(mask: M, enabled: boolean) {
    this.init();
    if (enabled) (this.value as any) |= mask;
    else (this.value as any) &= ~mask;
    return this;
  }

  init() {
    if (this.value == null) this.value = this.bigint ? (0n as T) : (0 as T);
  }

  static transformer(bigint: boolean = false): ValueTransformer {
    return {
      to: flags => {
        if (bigint) return new Flags(flags && BigInt(flags), true);
        return new Flags(flags, false);
      },
      from: (flags: Flags) => {
        return flags.bigint ? flags.value?.toString() : flags.value;
      },
    };
  }
}
