import { ValueTransformer } from "typeorm";
import { Color } from "@vreiheit/util";

export function color(
  saveAs: "hsl" | "rgb" | "int" | "hex" = "hex",
  parseAs: "hsl" | "rgb" = "rgb",
): ValueTransformer {
  function from(value?: Color.ColorDefinition): Color.ColorArray | null {
    if (value == null) return null;
    switch (parseAs) {
      case "hsl":
        return Color.toHsl(value);
      case "rgb":
        return Color.toRgb(value);
    }
  }

  function to(value?: Color.ColorArray): string | number | null {
    if (value == null) return null;
    switch (saveAs) {
      case "rgb":
        return Color.toRgb(value!).toString();
      case "hsl":
        return Color.toHsl(value!).toString();
      case "hex":
        return Color.toHex(value!);
      case "int":
        return Color.toInt(value!, false);
    }
  }

  return { from, to };
}
