import { clamp, clampR, roundTo } from "src/math";

const { min, max, abs } = Math;

export interface RgbColorObject {
  r: number;
  g: number;
  b: number;
  a?: number;
  type?: "rgb";
}
export interface HslColorObject {
  h: number;
  s: number;
  l: number;
  a?: number;
  type: "hsl";
}

export type RgbColorArray = [r: number, g: number, b: number, a?: number] & {
  type: "rgb";
};
export type HslColorArray = [h: number, s: number, l: number, a?: number] & {
  type: "hsl";
};

export type HexColorString = `#${string}`;
export type RgbColorString = `rgb(${number},${number},${number})`;
export type RgbaColorString = `rgba(${number},${number},${number},${number})`;
export type HslColorString = `hsl(${number},${number},${number})`;
export type HslaColorString = `hsla(${number},${number},${number},${number})`;
export type ColorString =
  | HexColorString
  | RgbColorString
  | RgbaColorString
  | HslColorString
  | HslaColorString;
export type ColorObject = RgbColorObject | HslColorObject;
export type ColorArray = RgbColorArray | HslColorArray;
export type ColorValue = number;
export type ColorDefinition =
  | ColorString
  | ColorObject
  | ColorArray
  | ColorValue;

export function toColorArray(color: ColorDefinition): ColorArray {
  switch (typeof color) {
    case "number":
      return extractColorValues(color);
    case "string":
      return parseColorString(color);
    case "object":
      if (!color) throw new TypeError(`null is not a valid color`);
      if (Array.isArray(color)) return color;
      return colorObjectToArray(color);
    default:
      throw new TypeError(`Invalid color object: ${color}`);
  }
}

export function colorArrayToObject(array: ColorArray): ColorObject {
  if (array.type === "hsl") {
    const [h, s, l, a = 1] = array;
    return { h, s, l, a, type: "hsl" };
  } else {
    const [r, g, b, a = 1] = array;
    return { r, g, b, a, type: "rgb" };
  }
}

export function toHsl(color: ColorDefinition): HslColorArray {
  const array = toColorArray(color);
  if (array.type === "hsl") return array;
  // eslint-disable-next-line prefer-const
  let [r, g, b, a = 1] = array;
  r /= 255;
  g /= 255;
  b /= 255;
  const cmax = max(r, g, b);
  const cmin = min(r, g, b);
  const delta = cmax - cmin;
  const lighting = (cmin + cmax) / 2;
  const saturation = !delta ? 0 : delta / (1 - abs(2 * lighting - 1));
  let hue;
  if (!delta) hue = 0;
  else if (cmax === r) {
    const segment = (g - b) / delta;
    hue = segment + (segment < 0 ? 6 : 0);
  } else if (cmax === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  if (hue < 0) hue += 6;
  return hslColorArray(
    clampR(hue * 60, 0, 360),
    clamp(saturation * 100, 0, 100),
    clamp(lighting * 100, 0, 100),
    a,
  );
}

export function toRgb(color: ColorDefinition): RgbColorArray {
  const array = toColorArray(color);
  if (array.type === "rgb") return array;
  // eslint-disable-next-line prefer-const
  let [h, s, l, alpha = 1] = array;
  l /= 100;
  s /= 100;
  const a = s * min(l, 1 - l);
  return rgbColorArray(
    hslColorPart(0, a, h, l),
    hslColorPart(8, a, h, l),
    hslColorPart(4, a, h, l),
    alpha,
  );
}

export function toHex(color: ColorDefinition): string {
  const [r, g, b, a] = toRgb(color).map(hexPad);
  return `#${r}${g}${b}${a === "ff" ? "" : a}`;
}

export function toInt(
  color: ColorDefinition,
  withAlpha: boolean = false,
): number {
  const [r, g, b, a] = toRgb(color);
  if (withAlpha) return (r << 24) | (g << 16) | (b << 8) | a;
  else return (r << 16) | (g << 8) | b;
}

function hexPad(n: number) {
  return n.toString(16).padStart(2, "0");
}

function hslColorPart(n: number, a: number, h: number, l: number) {
  const k = (n + h / 30) % 12;
  return clamp(roundTo(255 * (l - a * max(min(k - 3, 9 - k, 1), -1))), 0, 255);
}

function colorObjectToArray(object: ColorObject): ColorArray {
  if (object.type === "hsl")
    return hslColorArray(object.h, object.s, object.l, object.a ?? 1);
  else return rgbColorArray(object.r, object.g, object.b, object.a ?? 1);
}

function parseColorString(color: ColorString): ColorArray {
  if (isHexColorString(color)) return parseHexColorString(color);
  if (isRgbColorString(color)) return parseRgbColorString(color);
  if (isHslColorString(color)) return parseHslColorString(color);
  throw new TypeError(`Invalid color string: "${color}"`);
}

function parseHexColorString(color: HexColorString) {
  let part = color.slice(1);
  if (part.length < 6) part = part.replace(/(.)/g, "$1$1");
  return extractColorValues(parseInt(part, 16));
}

function isHexColorString(color: ColorString): color is HexColorString {
  return /#[0-9a-fA-F]{3,4,6,8}/g.test(color);
}

const regexNumber = "\\s*(-?\\d+|-?\\.\\d+|-?\\d+\\.\\d+)\\s*";
const regexRgb = new RegExp(
  `rgba?\\(${regexNumber},${regexNumber},${regexNumber}(?:,${regexNumber})?\\)`,
);
const regexHsl = new RegExp(
  `hsla?\\(${regexNumber},${regexNumber},${regexNumber}(?:,${regexNumber})?\\)`,
);

function parseRgbColorString(color: RgbaColorString): RgbColorArray {
  const group = regexRgb.exec(color);
  if (!group) throw new TypeError(`Invalid rgb color string: ${color}`);
  const [, r, g, b, a = "1"] = group;
  return rgbColorArray(+r, +g, +b, +a);
}

function isRgbColorString(color: ColorString): color is RgbaColorString {
  return regexRgb.test(color);
}

function parseHslColorString(color: HslaColorString): HslColorArray {
  const group = regexHsl.exec(color);
  if (!group) throw new TypeError(`Invalid hsl color string: ${color}`);
  const [, h, s, l, a = "1"] = group;
  return hslColorArray(+h, +s, +l, +a);
}

function isHslColorString(color: ColorString): color is HslaColorString {
  return regexHsl.test(color);
}

function extractColorValues(color: ColorValue): ColorArray {
  const a = color > 0xffffff ? ((color >>> 3) & 0xff) / 0xff : 1;
  const r = (color >>> 2) & 0xff;
  const g = (color >>> 1) & 0xff;
  const b = (color >>> 0) & 0xff;
  return rgbColorArray(r, g, b, a);
}

function rgbColorArray(r: number, g: number, b: number, a?: number) {
  return Object.assign([r, g, b, a ?? 1], {
    toJSON: colorArrayToJson,
    toString: colorArrayToString,
    type: "rgb",
  }) as unknown as RgbColorArray;
}

function hslColorArray(h: number, s: number, l: number, a?: number) {
  return Object.assign([h, s, l, a ?? 1], {
    toJSON: colorArrayToJson,
    toString: colorArrayToString,
    type: "hsl",
  }) as unknown as HslColorArray;
}

function colorArrayToJson(this: ColorArray): ColorObject {
  return colorArrayToObject(this);
}

function colorArrayToString(this: ColorArray): string {
  const [v1, v2, v3, a = 1] = this;
  if (this.type === "hsl") return `hsla(${v1}, ${v2}, ${v3}, ${a})`;
  else return `rgba(${v1}, ${v2}, ${v3}, ${a})`;
}
