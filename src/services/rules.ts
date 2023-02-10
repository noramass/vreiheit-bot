import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  CommandInteraction,
  Guild,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextBasedChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ensureCommand } from "src/commands/ensure-command";
import {
  Handler,
  OnButton,
  OnCommand,
  OnFormSubmit,
  OnInit,
} from "src/decorators";
import { Server } from "src/entities/server";
import { withResource } from "src/init/data-source";
import {
  getServer,
  withServer,
  withServerMember,
} from "src/members/get-server-member";
import { editMessage } from "src/messages";
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
    await this.editRulesMessages(form.guild);
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
    await this.createRulesMessages(
      interaction.channel,
      interaction.guild,
      ruleTexts,
    );
  }

  async editRulesMessages(guild: Guild) {
    const server = await getServer(guild.id);
    const rules = await this.getRuleTexts(guild.id, false);
    if (server.rulesMessageIds.length !== rules.length) {
      console.error("rules message length mismatch");
      // TODO: later ;)
    } else {
      for (let i = 0; i < rules.length; ++i) {
        const messageId = server.rulesMessageIds[i];
        await editMessage(guild, server.rulesChannelId, messageId, rules[i]);
      }
    }
  }

  async createRulesMessages(
    channel: TextBasedChannel,
    guild: Guild,
    rules: string[],
  ) {
    const messageIds: string[] = [];

    for (const text of rules) {
      const message = await channel.send({ content: text });
      messageIds.push(message.id);
    }

    await editMessage(guild, channel, messageIds[messageIds.length - 1], {
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Akzeptieren")
            .setStyle(ButtonStyle.Success)
            .setCustomId("rules:accept"),
        ),
      ],
    });

    await withResource(Server, { discordId: guild.id }, server => {
      server.rulesChannelId = channel.id;
      server.rulesMessageIds = messageIds;
    });
  }

  async getRuleTexts(id: string, fillEmpty = true): Promise<string[]> {
    const ruleTexts = chunks<string>((await getServer(id)).rules ?? "", 4000);
    if (fillEmpty) while (ruleTexts.length < 5) ruleTexts.push("");
    return ruleTexts;
  }
}
