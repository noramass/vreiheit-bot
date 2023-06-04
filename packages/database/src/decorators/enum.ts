import { Column, ColumnOptions } from "typeorm";

export function EnumColumn(
  def: Record<string, any>,
  options: ColumnOptions = {},
) {
  return Column({
    type: "enum",
    enum: def,
    ...options,
  });
}
