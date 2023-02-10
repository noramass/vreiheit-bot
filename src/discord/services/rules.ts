import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  CommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ensureCommand } from "src/discord/commands/ensure-command";
import {
  Handler,
  OnButton,
  OnCommand,
  OnFormSubmit,
  OnInit,
} from "src/discord/decorators";
import {
  getServer,
  withServer,
  withServerMember,
} from "src/discord/members/get-server-member";
import { chunks } from "src/util";

@Handler("rules")
export class RulesService {
  @OnInit()
  async onInit(client: Client<true>) {
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setDMPermission(false)
        .setName("edit-rules")
        .setDescription("Bearbeite die Regeln"),
    );

    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setDMPermission(false)
        .setName("show-rules")
        .setDescription("Poste die aktuellen Regeln"),
    );
  }

  @OnButton("accept")
  async onRulesAccept(interaction: ButtonInteraction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.deleteReply();
    await withServerMember(interaction.member as any, user => {
      user.rulesAccepted = true;
    });
  }

  @OnFormSubmit("edit")
  async onRulesEdit(form: ModalSubmitInteraction) {
    if (!form.memberPermissions.has("Administrator")) return;
    await form.deferUpdate();
    const text1 = form.fields.getTextInputValue("text1");
    const text2 = form.fields.getTextInputValue("text2");
    const text3 = form.fields.getTextInputValue("text3");
    const text4 = form.fields.getTextInputValue("text4");
    const text5 = form.fields.getTextInputValue("text5");
    const fullText = [text1, text2, text3, text4, text5].join("\n");
    await withServer(form.guildId, server => {
      server.rules = fullText.trim();
    });
  }

  @OnCommand("edit-rules")
  async onEditRules(interaction: CommandInteraction) {
    const ruleTexts = await this.getRuleTexts(interaction.guildId);
    await interaction.showModal(
      new ModalBuilder()
        .setTitle("Regeln bearbeiten")
        .setCustomId("rules:edit")
        .setComponents(
          ruleTexts.map((text, index) =>
            new ActionRowBuilder<TextInputBuilder>().setComponents(
              new TextInputBuilder()
                .setLabel(`Regeln ${index + 1}`)
                .setValue(text)
                .setCustomId(`text${index + 1}`)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(index === 0),
            ),
          ),
        ),
    );
  }

  @OnCommand("show-rules")
  async onShowRules(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has("Administrator")) return;
    await interaction.deferReply({ ephemeral: true });
    await interaction.deleteReply();
    let ruleTexts = await this.getRuleTexts(interaction.guildId);
    ruleTexts = ruleTexts.filter(it => it);
    const last = ruleTexts.pop();
    const channel = interaction.channel;
    for (const text of ruleTexts) await channel.send({ content: text });
    channel.send({
      content: last,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Akzeptieren")
            .setStyle(ButtonStyle.Success)
            .setCustomId("rules:accept"),
        ),
      ],
    });
  }

  async getRuleTexts(id: string): Promise<string[]> {
    const ruleTexts = chunks<string>((await getServer(id)).rules ?? "", 4000);
    while (ruleTexts.length < 5) ruleTexts.push("");
    return ruleTexts;
  }
}
