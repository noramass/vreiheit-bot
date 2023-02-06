import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  CommandInteraction,
  GuildMember,
  Role,
  SlashCommandBuilder,
} from "discord.js";
import { ensureCommand } from "src/commands/ensure-command";
import { Handler, OnButton, OnCommand, OnInit } from "src/decorators";
import { Pronouns } from "src/services/pronouns";
import { chunks } from "src/util";

//TODO: Talking with the Database.
@Handler("lifestyle")
export class VeganSelectionService {
  private noPronounsReponse = `Damit du auswählen kannst ob du Vegan oder Nicht-Vegan lebst must du vorher deine pronomen angeben!`;
  private SlashCommandDescription = "Zeig die Lebensstiel auswahl an.";
  private commandName = "vegan";
  private veganRoleName: "Vegan";
  private nonVeganRoleName: "Nicht Vegan";
  //Injected Services
  private pronounsService: Pronouns;

  @OnInit()
  async onInit(client: Client<true>) {
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName(this.commandName)
        .setDescription(this.SlashCommandDescription)
        .setDMPermission(false),
    );
  }

  private ChooseLifestyleText = "Wähle deinen Lebensstiel.";

  @OnCommand("vegan")
  async onVeganCommand(interaction: CommandInteraction) {
    //interation.member kann auch 'APIInteractionGuildMember' sein.
    const member = interaction.member as GuildMember;
    if (!this.hasPronounsSelected(member)) {
      await this.handleHasNoPronounes(member, interaction);
    }
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: this.ChooseLifestyleText,
      components: await this.buildButtons(),
    });
  }

  @OnButton("set")
  private async onSelected(
    interaction: ButtonInteraction,
    remainingPrefix: string,
  ) {
    interaction.deferUpdate();
    await this.handleRoleSelection(
      interaction.member as GuildMember,
      remainingPrefix,
    );
    await interaction.deleteReply();
  }

  private hasPronounsSelected(member: GuildMember): boolean {
    return true; //not calling service method due to DI mission and i have no
    //idea how i would do this :)
    return this.pronounsService.hasPronouns(member);
  }

  private async handleHasNoPronounes(
    member: GuildMember,
    interaction: CommandInteraction,
  ) {
    await interaction.reply({
      content: this.noPronounsReponse,
      ephemeral: true,
    });
    //TODO: Delegate pronouns selection to Pronoun Service
    //Could not test this.
    await this.pronounsService.onPronounsCommand(interaction);
  }

  private async buildButtons() {
    const veganButton = new ButtonBuilder()
      .setCustomId(`lifestyle:set:vegan`)
      .setStyle(ButtonStyle.Primary)
      .setLabel("vegan");
    const nonVeganButton = new ButtonBuilder()
      .setCustomId(`lifestyle:set:nonVegan`)
      .setStyle(ButtonStyle.Primary)
      .setLabel("nonVegan");

    return chunks([veganButton, nonVeganButton], 2).map(it =>
      new ActionRowBuilder<ButtonBuilder>().setComponents(it),
    );
  }

  private async handleRoleSelection(
    member: GuildMember,
    remainingPrefix: string,
  ) {
    await member.fetch();
    const roles = member.roles.cache;
    const veganRole = await member.guild.roles.cache
      .filter(
        ({ name }) => name == "Vegan", //cant use const bc its undefined in loop
      )
      .first();
    const nonVeganRole = await member.guild.roles.cache
      .filter(
        ({ name }) => name == "Nicht Vegan", //cant use const bc its undefined in loop
      )
      .first();

    const hasVeganRole = roles.has(veganRole.id);
    const hasNonVeganRole = roles.has(nonVeganRole.id);

    let role: Role;
    if (veganRole.name.toLocaleLowerCase() == remainingPrefix) {
      role = veganRole;
    }
    if (nonVeganRole.name.toLocaleLowerCase() == remainingPrefix) {
      role = nonVeganRole;
    }

    if (!hasVeganRole && !hasNonVeganRole) {
      await member.roles.add(role);
      return;
    }

    if (hasVeganRole && !hasNonVeganRole) {
      await member.roles.remove(veganRole);
      await member.roles.add(nonVeganRole);
      return;
    }

    if (!hasVeganRole && hasNonVeganRole) {
      await member.roles.remove(nonVeganRole);
      await member.roles.add(veganRole);
      return;
    }
  }
}
