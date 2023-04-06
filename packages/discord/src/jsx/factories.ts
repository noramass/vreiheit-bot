import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { applySetters, setterName, upperFirst } from "./util";
import type { JSX } from "./elements";

export class DiscordElements {
  static createElement<FN extends (options: any) => JSX.Element>(
    element: FN,
    options: Omit<Parameters<FN>[0], "children">,
    ...children: Parameters<FN>[0]["children"]
  );
  static createElement<T extends keyof JSX.IntrinsicElements>(
    element: T,
    options: JSX.IntrinsicElements[T],
    ...children: JSX.IntrinsicElements[T] extends { children?: any }
      ? JSX.IntrinsicElements[T]["children"]
      : never
  );
  static createElement(
    element: string | ((options: any) => JSX.Element),
    options: any,
    ...children: any[]
  ) {
    if (typeof element === "function")
      return element({
        ...(options ?? {}),
        children: this.normaliseChildren(children),
      });
    if (element in DiscordElementFactories)
      return (DiscordElementFactories as any)[element](
        options,
        this.normaliseChildren(children),
      );
    else return this.createElementFallback(element, options, children);
  }

  static normaliseChildren(children: any): any[] {
    return (Array.isArray(children) ? children : [children])
      .flat()
      .filter(Boolean);
  }

  static createElementFallback(element: string, options: any, children: any) {
    return {
      type: element,
      options,
      children: this.normaliseChildren(children),
    };
  }

  static Fragment(option: unknown, ...children: any[]) {
    return this.normaliseChildren(children);
  }
}

type ArrayExtract<T> = T extends Array<infer Wrapped> ? Wrapped : T;

interface WrappedJSX<T, Extracted extends ArrayExtract<T> = ArrayExtract<T>> {
  type: keyof {
    [Key in keyof JSX.IntrinsicElements as JSX.IntrinsicElements[Key] extends Extracted
      ? Key
      : never]: JSX.IntrinsicElements[Key];
  };
  options: Omit<Extracted, "children">;
  children: Extracted extends { children?: any }
    ? WrappedJSX<Required<Extracted>["children"]>[]
    : never;
}

export class DiscordElementFactories {
  static modal(options: any, children: any[]) {
    options.required ??= false;
    const modal = new ModalBuilder();
    applySetters(modal, options);
    modal.setComponents(children);
    return modal;
  }

  static actionRow(options: any, children: any[]): any {
    return new ActionRowBuilder().setComponents(children);
  }

  static textInput(options: any) {
    options.style ??= TextInputStyle.Short;
    const input = new TextInputBuilder();
    applySetters(input, options);
    return input;
  }

  static embed(options: any) {
    const embed = new EmbedBuilder();
    applySetters(embed, options);
    return embed;
  }

  static field(options: any) {
    return options;
  }

  static button(options: any) {
    const btn = new ButtonBuilder();
    applySetters(btn, options);
    return btn;
  }

  static _subCommand(
    cmd: WrappedJSX<JSX.JsxSlashSubCommandProps>,
    builder: SlashCommandSubcommandBuilder,
  ) {
    const { options, children } = cmd;
    applySetters(builder, options, {
      dm: "setDMPermission",
      nsfw: "setNSFW",
    });
    for (const option of children) this._applyOption(option, builder);
    return builder;
  }

  static _applyOption(
    option: WrappedJSX<JSX.JsxSlashCommandOptionProps>,
    builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  ) {
    const replacements = (
      {
        number: { min: "setMinValue", max: "setMaxValue" },
        integer: { min: "setMinValue", max: "setMaxValue" },
        string: { min: "setMinLength", max: "setMaxLength" },
      } as Partial<Record<typeof option.options.type, Record<string, string>>>
    )[option.options.type];
    builder[`add${upperFirst(option.options.type)}Option`].call(
      builder,
      builder => {
        applySetters(builder, option.options, replacements);
        if ((option as any).children?.length && "addChoices" in builder)
          builder.addChoices(...(option as any).children.map(it => it.options));
        return builder;
      },
    );
  }
  static slashCommand(options: any, children: any[]) {
    options.dm ??= false;
    const cmd = new SlashCommandBuilder();
    applySetters(cmd, options, {
      dm: "setDMPermission",
      nsfw: "setNSFW",
    });
    for (const child of children as WrappedJSX<
      JSX.JsxSlashCommandProps["children"]
    >[]) {
      switch (child.type) {
        case "subCommand":
          cmd.addSubcommand(builder => this._subCommand(child as any, builder));
          break;
        case "subCommandGroup":
          cmd.addSubcommandGroup(it => {
            for (const [key, value] of Object.entries(child)) {
              const setter = setterName(key);
              if (setter in it) it[setter].call(it, value);
            }
            it.addSubcommand(builder =>
              this._subCommand(child as any, builder),
            );
            return it;
          });
          break;
        default:
          this._applyOption(child as any, cmd);
      }
    }
    return cmd;
  }
}
