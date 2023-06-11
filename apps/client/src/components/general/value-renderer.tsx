import React from "react";
import { Color, resolveFirst } from "@vreiheit/util";

export type ColorFor<T> = (
  element: T,
) =>
  | Color.RgbColorArray
  | Color.HslColorArray
  | Color.HexColorString
  | undefined;

export type KeyFor<T> = (
  element: T,
  index?: number,
) => string | number | undefined;
export type DescriptionFor<T> = (element: T) => string | undefined;

export interface ValueRendererOptions<T = any> {
  keyFor?: T extends any[] ? KeyFor<T> : never;
  colorFor?: ColorFor<T>;
  descriptionFor?: DescriptionFor<T>;
  expandArray?: boolean;
  description?: string | boolean;
  highlight?: string;
  renderer?: (value: T) => string;
  locale?: string;

  numberValues?: NumberValueOptions;
  dateValues?: DateValueOptions;
  textValues?: TextValueOptions;
  arrayValues?: ArrayValueOptions;
}

interface TextValueOptions {
  true?: string;
  false?: string;
  null?: string;
  undefined?: string;
  unknown?: string;
}

interface DateValueOptions {
  format?: string;
}

type NumberValueOptions = Intl.NumberFormatOptions;

interface ArrayValueOptions {
  max?: number;
  separator?: string;
}

export function ValueRenderer<T = any>(
  options: ValueRendererOptions<T> & { value: T },
) {
  if (Array.isArray(options.value) && options.expandArray)
    return (
      <>
        {options.value.map((value, index) => (
          <ValueRenderer
            {...options}
            value={value}
            key={options.keyFor?.(value, index)}
          />
        ))}
      </>
    );
  const color = options.colorFor && options.colorFor(options.value)?.toString();

  return (
    <>
      <span
        key={options.keyFor?.(options.value)}
        style={color ? { color } : undefined}>
        {renderValue(options.value, options)}
      </span>
      {options.descriptionFor && (
        <span>{options.descriptionFor(options.value)}</span>
      )}
    </>
  );
}
export function renderValue<T = any>(
  value: T,
  options: ValueRendererOptions<T> = {},
): string | undefined {
  value = options.renderer ? options.renderer(value) : (value as any);
  const locale = currentLocale(options.locale);

  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "bigint":
      return new Intl.NumberFormat(locale, options.numberValues).format(value);
    case "boolean":
      return value
        ? options.textValues?.true ?? "yes"
        : options.textValues?.false ?? "no";
    case "undefined":
      return options.textValues?.undefined ?? "";
    case "object":
      if (!value) return options.textValues?.null ?? "<null>";
      if (Array.isArray(value))
        return value
          .map(value => renderValue(value, options))
          .join(options.arrayValues?.separator ?? ", ");
      return resolveFirst(value, ["text", "name"]) ?? "value" in value
        ? renderValue((value as any).value, options)
        : JSON.stringify(value);
  }
}

export function currentLocale(selected?: string) {
  return selected ?? navigator.language ?? "en-US";
}
