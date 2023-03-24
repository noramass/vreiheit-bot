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
  return interactionDecorator(
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
  return interactionDecorator<ButtonInteraction>(
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
  return interactionDecorator((interaction, context, { prefix }) => {
    if (!next(interaction.id)) return false;
    if (!interaction.isModalSubmit()) return false;
    return customIdMatches(interaction, prefix, formId);
  });
}

export function OnAutocomplete(command: string, option?: string) {
  const next = createLastFilter();
  function findFocusedOptionRecursive(
    options: ReadonlyArray<CommandInteractionOption>,
  ) {
    for (const option of options) {
      if (option.options) return findFocusedOptionRecursive(option.options);
      if (option.focused) return option;
    }
  }

  return interactionDecorator<AutocompleteInteraction>(
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

function interactionDecorator<T extends BaseInteraction = Interaction>(
  filter: (
    interaction: Interaction,
    context: any,
    meta: DiscordMeta,
  ) => unknown,
  parameters?: (
    interaction: T,
    context: any,
    meta: DiscordMeta,
  ) => PromiseOr<any[]>,
) {
  return function (proto: any, name: string | symbol) {
    getDiscordMeta(proto.constructor).handlers.interaction.push(
      async function ({ context, params: [interaction], meta }) {
        if (!filter(interaction, context, meta)) return;
        const params =
          (await parameters?.(interaction as T, context, meta)) ?? [];
        return context[name].call(this, interaction, ...params);
      },
    );
  };
}
