import {
  Locale,
  ApplicationCommandOptionType,
  SlashCommandBuilder,
} from "discord.js";
import { JSX } from "src/elements/jsx";
import IntrinsicElements = JSX.IntrinsicElements;

export class DiscordElements {
  static createElement<T extends keyof IntrinsicElements>(
    element: T,
    options: IntrinsicElements[T],
    ...children: IntrinsicElements[T] extends { children?: any }
      ? IntrinsicElements[T]["children"]
      : never
  ) {
    if (element in DiscordElementFactories)
      return (DiscordElementFactories as any)[element](
        options,
        ...(Array.isArray(children)
          ? (children as any)
          : children
          ? [children]
          : []
        ).flat(),
      );
    else console.log(`Unhandled element ${element}`);
  }

  static Fragment(option: unknown, ...children: any[]) {
    return children.flat();
  }
}

export class DiscordElementFactories {
  static commandOption(options: any, ...children: any[]) {
    options.type =
      ApplicationCommandOptionType[
        options.type.slice(0, 1).toUpperCase() + options.type.slice(1)
      ];
    options.choices = children;
    return options;
  }

  static slashCommand(options: any, ...children: any[]) {
    options.dm ??= false;
    const cmd = new SlashCommandBuilder();
    for (const [key, value] of Object.entries(options)) {
      const setter = setterName(key);
      if (setter in cmd) cmd[setter].call(cmd, value);
    }
    for (const child of children) {
      switch (child.type) {
        case "subCommand":
          cmd.addSubcommand(it => {
            for (const [key, value] of Object.entries(child)) {
              const setter = setterName(key);
              if (setter in it) it[setter].call(it, value);
            }
            for (const option of child.options) {
              console.log(option.type, option);
            }

            return it;
          });
          break;
        case "subCommandGroup":
          cmd.addSubcommandGroup(it => {
            for (const [key, value] of Object.entries(child)) {
              const setter = setterName(key);
              if (setter in it) it[setter].call(it, value);
            }

            return it;
          });
          break;
        default:
          console.log("option", child);
      }
    }
    return cmd;
  }

  static subCommand(options: any, ...children: any[]) {
    return { type: "subCommand", ...options, options: children };
  }

  static subCommandGroup(options: any, ...children: any[]) {
    return { type: "subCommandGroup", options, children };
  }
}

function setterName(str: string) {
  switch (str) {
    case "nsfw":
      return "setNSFW";
    case "dm":
      return "setDMPermission";
  }
  return "set" + str.slice(0, 1).toUpperCase() + str.slice(1);
}

export type DiscordElementFactoryMap = {
  [Key in keyof typeof DiscordElementFactories]: (typeof DiscordElementFactories)[Key] extends (
    ...args: any[]
  ) => any
    ? (typeof DiscordElementFactories)[Key]
    : never;
};
