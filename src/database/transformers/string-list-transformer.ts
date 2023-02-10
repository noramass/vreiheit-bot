import { ValueTransformer } from "typeorm";
export function stringList(
  delimiter = ";",
  nullable?: boolean,
): ValueTransformer {
  return {
    to: value => (value ? value.join(delimiter) : nullable ? null : ""),
    from: value => (value ? value.split(delimiter) : []),
  };
}
