import { resolveFirst } from "@vreiheit/util";
import React from "react";
import { IconsId } from "src/icons";

export type IconString = IconsId | `https://${string}`;
export type IconFor<T> = (value: T) => IconString;

export type WhiteSpace = " " | "" | "\n";
export type HexColor = `#${string}`;
export type RgbColor =
  | `rgb(${number},${number},${number})`
  | `rgba(${number},${number},${number},${number})`;
export type Color = HexColor | RgbColor;

const c: Color = "rgba(1,1,1,0.5)";

console.log(c);

export interface ValueRendererOptions<T = any> {
  keyFor?: T extends any[] ? KeyFor<T> : never;
  iconFor?: IconFor<T>;
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

interface TextValueOptions<T = any> {
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
            key={keyFor(value, index)}
          />
        ))}
      </>
    );
}
export function renderValue<T = any>(
  value: T,
  options: ValueRendererOptions<T> = {},
) {
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
