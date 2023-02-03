import {
  ActionRowBuilder,
  ButtonBuilder,
  Guild,
  Interaction,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ComponentType,
} from "discord.js";
import { pronounPrefix, stripPronounPrefix } from "src/roles/pronouns/prefix";
import {
  createCustomPronounRole,
  getAllPronounRoles,
  togglePronounRole,
} from "src/roles/pronouns/roles";
import { chunks } from "src/util";

export async function createPrimaryPronounButtons(
  guild: Guild,
): Promise<ActionRowBuilder[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { other: ignored, ...primary } = await getAllPronounRoles(guild);
  const buttons = Object.values(primary)
    .map(role => {
      return new ButtonBuilder()
        .setCustomId("pronouns:set:" + stripPronounPrefix(role.name))
        .setStyle(ButtonStyle.Primary)
        .setLabel(stripPronounPrefix(role.name));
    })
    .concat(
      new ButtonBuilder()
        .setCustomId("pronouns:add")
        .setLabel("Andere...")
        .setStyle(ButtonStyle.Primary),
    );

  return chunks(buttons, 5).map(it => new ActionRowBuilder().setComponents(it));
}

export async function processPronounInteraction(interaction: Interaction) {
  if (
    !(interaction.isButton() || interaction.isModalSubmit()) ||
    !interaction.customId.startsWith("pronouns:")
  )
    return;
  const [, action, ...params] = interaction.customId.split(/:/g);
  switch (action) {
    case "set":
      if (!params.length) return;
      await interaction.deferUpdate();
      await togglePronounRole(
        interaction.member as any,
        pronounPrefix(params.join(":")),
      );
      break;
    case "add":
      if (interaction.isButton()) {
        await askForCustomPronouns(interaction);
      } else if (interaction.isModalSubmit()) {
        await interaction.deferUpdate();
        const name = interaction.fields.getField(
          "name",
          ComponentType.TextInput,
        ).value;
        const color =
          interaction.fields.getField("color", ComponentType.TextInput).value ||
          "#86efac";
        await createCustomPronounRole(
          interaction.guild,
          interaction.member as any,
          name,
          color,
        );
      }
  }
}

export async function askForCustomPronouns(interaction: Interaction) {
  if (interaction.isButton()) {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId("pronouns:add")
        .setTitle("Benutzerdefinierte Promomen")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("name")
              .setLabel("Bitte gebe deine gewünschten Pronomen ein.")
              .setPlaceholder("Xie/Xier")
              .setRequired(true)
              .setStyle(TextInputStyle.Short),
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("color")
              .setLabel("Bitte geben eine Farbe als Hex-Code ein.")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setPlaceholder("#86efac"),
          ) as any,
        ),
    );
  }
}
