import { Column, ColumnOptions } from "typeorm";

export function EnumColumn(
  def: { [Key in string]: Record<string, any> },
  options: ColumnOptions = {},
) {
  const [key, values] = Object.entries(def)[0];
  return Column({
    type: "enum",
    enumName: key,
    enum: values,
    ...options,
  });
}
