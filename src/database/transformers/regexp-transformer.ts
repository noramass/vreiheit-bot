import { ValueTransformer } from "typeorm";

export function regexp(flags: string): ValueTransformer {
  return {
    to: (regex: RegExp) => regex?.source,
    from: (source: string) => (source ? new RegExp(source, flags) : undefined),
  };
}
