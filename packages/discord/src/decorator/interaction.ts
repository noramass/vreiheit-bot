import {
  createParameterMetaAccessors,
  createParameterMetaDecoratorFactory,
} from "@propero/easy-api";
import { PromiseOr } from "@vreiheit/util";
import {
  AutocompleteInteraction,
  BaseInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  CommandInteractionOption,
  ContextMenuCommandInteraction,
  Interaction,
  ModalSubmitInteraction,
} from "discord.js";
import {
  DiscordMeta,
  getDiscordMeta,
  idMatches,
  remainingId,
  createLastFilter,
} from "src/util";

export function OnInteraction(interactionId?: string) {
  const next = createLastFilter();
  return interactionDecorator<Interaction, [string?, ...string[]]>(
    (interaction, context, { prefix }) => {
      if (!next(interaction.id)) return;
      return customIdMatches(interaction, prefix, interactionId);
    },
    (interaction, context, { prefix }) => {
      if (!("customId" in interaction)) return [];
      return remainingId(interaction.customId, prefix, interactionId);
    },
  );
}

export function OnButton(buttonId?: string) {
  const next = createLastFilter();
  return interactionDecorator<ButtonInteraction, [string, ...string[]]>(
    (interaction, context, { prefix }) => {
      if (!next(interaction.id)) return;
      if (!interaction.isButton()) return;
      return customIdMatches(interaction, prefix, buttonId);
    },
    (interaction, context, { prefix }) => {
      return remainingId(interaction.customId, prefix, buttonId);
    },
  );
}

export function OnChatCommand(
  commandId?: string,
  subGroupId?: string,
  subId?: string,
) {
  if (!subId && subGroupId) {
    subId = subGroupId;
    subGroupId = undefined;
  }
  const next = createLastFilter();
  return interactionDecorator<ChatInputCommandInteraction>(interaction => {
    if (!next(interaction.id)) return false;
    if (!interaction.isChatInputCommand()) return false;
    if (commandId && interaction.commandName !== commandId) return false;
    if (subGroupId && interaction.options.getSubcommandGroup() !== subGroupId)
      return false;
    return subId ? interaction.options.getSubcommand() === subId : true;
  });
}

export function OnContextCommand(
  commandId?: string,
  type?: "message" | "user",
) {
  const next = createLastFilter();
  return interactionDecorator<ContextMenuCommandInteraction>(interaction => {
    if (!next(interaction.id)) return false;
    if (!interaction.isContextMenuCommand()) return false;
    if (commandId && interaction.commandName !== commandId) return false;
    if (type === "user") return interaction.isUserContextMenuCommand();
    if (type === "message") return interaction.isMessageContextMenuCommand();
    return true;
  });
}

export function OnCommand(commandId?: string) {
  const next = createLastFilter();
  return interactionDecorator<CommandInteraction>(interaction => {
    if (!next(interaction.id)) return false;
    if (!interaction.isCommand()) return false;
    return !commandId || interaction.commandName === commandId;
  });
}

export function OnModalSubmit(formId?: string) {
  const next = createLastFilter();
  return interactionDecorator<ModalSubmitInteraction, [string, ...string[]]>(
    (interaction, context, { prefix }) => {
      if (!next(interaction.id)) return false;
      if (!interaction.isModalSubmit()) return false;
      return customIdMatches(interaction, prefix, formId);
    },
    (interaction, context, { prefix }) => {
      return remainingId(interaction.customId, prefix, formId);
    },
  );
}

function findFocusedOptionRecursive(
  options: ReadonlyArray<CommandInteractionOption>,
) {
  for (const option of options) {
    if (option.options) return findFocusedOptionRecursive(option.options);
    if (option.focused) return option;
  }
}

export function OnAutocomplete(command: string, option?: string) {
  const next = createLastFilter();

  return interactionDecorator<
    AutocompleteInteraction,
    [CommandInteractionOption, string]
  >(
    interaction => {
      if (!next(interaction.id)) return;
      if (!interaction.isAutocomplete()) return;
      if (interaction.commandName !== command) return false;
      if (option)
        return interaction.options.data.find(it => it.focused).name === option;
      else return true;
    },
    interaction => [
      findFocusedOptionRecursive(interaction.options.data),
      interaction.options.getFocused(),
    ],
  );
}

function customIdMatches(
  interaction: Interaction,
  prefix?: string,
  id?: string,
) {
  if (!id) return true;
  if (!("customId" in interaction)) return false;
  return idMatches(interaction.customId, prefix, id);
}

export type InteractionMetaGenerator<T = unknown> = (
  interaction: BaseInteraction,
  context: any,
) => T;
const { getMeta, setMeta } =
  createParameterMetaAccessors<InteractionMetaGenerator>("interaction-meta");

export const createInteractionInjector =
  createParameterMetaDecoratorFactory(setMeta);

function createOptionDecorator(key: keyof CommandInteractionOption) {
  return (name: string, required?: boolean) =>
    createInteractionInjector(() => interaction => {
      if (!interaction.isCommand()) return;
      return interaction.options.get(name, required)?.[key];
    });
}

function Option(name: string) {
  return createInteractionInjector(() => interaction => {
    if ("options" in interaction) return interaction.options[name];
  });
}

Option.Value = createOptionDecorator("value");
Option.Channel = createOptionDecorator("channel");
Option.Attachment = createOptionDecorator("attachment");
Option.User = createOptionDecorator("user");
Option.Role = createOptionDecorator("role");
Option.Member = createOptionDecorator("member");
Option.Focused = createInteractionInjector(() => interaction => {
  if (!interaction.isAutocomplete()) return;
  return findFocusedOptionRecursive(interaction.options.data);
});
Option.FocusedValue = createInteractionInjector(() => interaction => {
  if (!interaction.isAutocomplete()) return;
  return interaction.options.getFocused();
});
export const DC = {
  Interaction: createInteractionInjector(() => interaction => interaction),
  Option,
};

function interactionDecorator<
  T extends BaseInteraction = Interaction,
  P extends any[] = any[],
>(
  filter: (
    interaction: Interaction,
    context: any,
    meta: DiscordMeta,
  ) => unknown,
  parameters?: (
    interaction: T,
    context: any,
    meta: DiscordMeta,
  ) => PromiseOr<P>,
) {
  return function (proto: any, name: string | symbol) {
    const paramMeta = Object.values(getMeta(proto, name));
    getDiscordMeta(proto.constructor).handlers.interaction.push(
      async function ({ context, params: [interaction], meta }) {
        if (!filter(interaction, context, meta)) return;
        if (paramMeta.length) {
          const parameters = await Promise.all(
            paramMeta.map(extract => extract(interaction, context)),
          );
          return context[name].call(context, ...parameters);
        }
        const params =
          (await parameters?.(interaction as T, context, meta)) ?? [];
        return context[name].call(context, interaction, ...params);
      },
    );
  };
}
