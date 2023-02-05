import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Guild,
  GuildMember,
  ModalBuilder,
  ModalSubmitInteraction,
  Role,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import {
  Handler,
  OnButton,
  OnCommand,
  OnFormSubmit,
  OnInit,
  OnMemberLeave,
} from "src/decorators";
import { modLog } from "src/logging/mod-log";
import { ensureRolesExist } from "src/roles/ensure-roles-exist";
import { getRolesMatching } from "src/roles/get-roles-matching";
import { rolesByName } from "src/roles/role-by-name";
import { chunks, createInverseLookup } from "src/util";

@Handler("pronouns")
export class Pronouns {
  pronounPrefix = "Pronomen";
  pronounRoles = {
    "she/her": {
      name: this.prefix("She/Her"),
      color: "#fda4af",
    },
    "she/they": {
      name: this.prefix("She/They"),
      color: "#f0abfc",
    },
    "they/them": {
      name: this.prefix("They/Them"),
      color: "#a78bfa",
    },
    "he/they": {
      name: this.prefix("He/They"),
      color: "#818cf8",
    },
    "he/him": {
      name: this.prefix("He/Him"),
      color: "#93c5fd",
    },
    "he/she/they": {
      name: this.prefix("He/She/They"),
      color: "#fdba74",
    },
    "ask": {
      name: this.prefix("Nachfragen"),
      color: "#86efac",
    },
  } as const;
  pronounRolesShared = {
    permissions: [],
    mentionable: false,
  } as const;

  @OnInit()
  async onInit(client: Client<true>) {
    for (const guild of client.guilds.cache.values()) {
      const commands = await guild.commands.fetch();
      const match = commands.find(it => it.name == "pronouns");
      if (!match)
        await guild.commands.create(
          new SlashCommandBuilder()
            .setName("pronouns")
            .setDescription("Zeige die Pronomenselektion an")
            .setDMPermission(false),
        );
    }
  }

  @OnCommand("pronouns")
  async onPronounsCommand(interaction: CommandInteraction) {
    if (!interaction.memberPermissions.has("Administrator")) {
      await interaction.reply({
        ephemeral: true,
        content: "Dazu hast du keine Berechtigungen!",
      });
      return;
    } else {
      await interaction.deferReply({ ephemeral: true });
      await interaction.deleteReply();
    }

    await interaction.channel.send({
      content: "Wähle deine Pronomen",
      components: await this.primaryPronounButtons(interaction.guild),
    });
  }

  @OnButton("set")
  async onPrimaryPronounsClick(
    interaction: ButtonInteraction,
    remainingPrefix: string,
  ) {
    await interaction.deferUpdate();
    await this.togglePronounRole(
      interaction.member as GuildMember,
      remainingPrefix,
    );
  }

  @OnButton("add")
  async onCustomPronounsClick(event: ButtonInteraction) {
    await event.showModal(
      new ModalBuilder()
        .setCustomId("pronouns:add")
        .setTitle("Benutzerdefinierte Pronomen")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("name")
              .setLabel("Bitte gebe deine gewünschten Pronomen ein.")
              .setPlaceholder("Xie/Xier")
              .setRequired(true)
              .setStyle(TextInputStyle.Short),
          ),
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("color")
              .setLabel("Bitte gebe eine Farbe als Hex-Code ein.")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
              .setPlaceholder("#86efac"),
          ),
        ),
    );
  }

  @OnButton("delete")
  async onPronounsDelete(i: ButtonInteraction, userId: string) {
    const member = await i.guild.members.fetch(userId);
    if (!member)
      return i.reply({
        content: "Dieses Mitglied existiert nicht!",
        ephemeral: true,
      });
    else {
      await i.deferReply();
      await this.onMemberLeave(member);
      await i.editReply("Pronomen Gelöscht!");
      await i.message.edit({
        components: [],
      });
    }
  }

  @OnFormSubmit("add")
  async onCustomPronounsSubmit(form: ModalSubmitInteraction) {
    const color =
      form.fields.getField("color", ComponentType.TextInput).value || "#86efac";
    const name = form.fields.getField("name", ComponentType.TextInput).value;
    if (!name || name.length > 15) await form.followUp("Ungültige Pronomen");
    else if (!/^#[0-9a-fA-F]{6}$/.test(color))
      await form.followUp("Ungültiger Farbcode");
    else {
      await form.deferUpdate();
      await this.createCustomPronounRole(
        form.member as GuildMember,
        name,
        color as any,
      );
      await modLog(form.guild, {
        embeds: [
          new EmbedBuilder()
            .setTitle("Benutzerdefinierte Pronomen: " + name)
            .setFooter({
              text: form.user.username,
              iconURL: form.user.displayAvatarURL(),
            })
            .setColor(color as any),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel("Löschen")
              .setCustomId("pronouns:delete:" + form.user.id)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setLabel("Kicken")
              .setCustomId("members:kick:" + form.user.id)
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setLabel("Bannen")
              .setCustomId("members:ban:" + form.user.id)
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setLabel("Okay!")
              .setCustomId("messages:delete")
              .setStyle(ButtonStyle.Success),
          ),
        ],
      });
    }
  }

  @OnMemberLeave()
  async onMemberLeave(member: GuildMember) {
    const other = await this.getCustomPronouns(member.guild);
    for (const role of other)
      if (member.roles.cache.has(role.id))
        await member.guild.roles.delete(role);
  }

  async createCustomPronounRole(
    member: GuildMember,
    pronouns: string,
    color: `#${string}`,
  ) {
    const role = await member.guild.roles.create({
      ...this.pronounRolesShared,
      name: this.prefix(pronouns),
      color,
    });
    await this.togglePronounRole(member, role.id);
  }

  async togglePronounRole(member: GuildMember, roleId: string) {
    await member.fetch();
    const roles = member.roles.cache;
    const { other, ...primary } = await this.getPronouns(member.guild);
    const pronouns = Object.values(primary).concat(...other);
    if (!/^[0-9]+$/.test(roleId))
      roleId = pronouns.find(it => it.name === this.prefix(roleId)).id;
    for (const role of pronouns) {
      const has = roles.has(role.id);
      const match = role.id === roleId;
      if ((has && match) || !match) {
        await member.roles.remove(role);
        if (has && other.find(it => it.id === role.id))
          await member.guild.roles.delete(role);
      } else if (match) await member.roles.add(role);
    }
  }

  async primaryPronounButtons(guild: Guild) {
    const pronouns = await this.getPrimaryPronouns(guild);
    const buttons = Object.values(pronouns)
      .map(role =>
        new ButtonBuilder()
          .setCustomId("pronouns:set:" + this.stripPrefix(role.name))
          .setStyle(ButtonStyle.Primary)
          .setLabel(this.stripPrefix(role.name)),
      )
      .concat(
        new ButtonBuilder()
          .setCustomId("pronouns:add")
          .setLabel("Andere...")
          .setStyle(ButtonStyle.Primary),
      );
    return chunks(buttons, 5).map(it =>
      new ActionRowBuilder<ButtonBuilder>().setComponents(it),
    );
  }

  async getPrimaryPronouns(guild: Guild) {
    await this.ensureRolesExist(guild);
    const matching = await rolesByName(
      guild,
      Object.values(this.pronounRoles).map(({ name }) => name),
    );
    const results: Record<keyof this["pronounRoles"], Role> = {} as any;
    const names = createInverseLookup(this.pronounRoles, ({ name }) => name);
    for (const role of matching.values()) {
      const key = names[role.name];
      if (key) results[key] = role;
    }
    return results;
  }

  async getPronouns(guild: Guild) {
    await this.ensureRolesExist(guild);
    const matching = await getRolesMatching(guild, ({ name }) =>
      name.startsWith(this.prefix()),
    );
    const results: Record<keyof this["pronounRoles"], Role> & {
      other: Role[];
    } = { other: [] } as any;
    const names = createInverseLookup(this.pronounRoles, ({ name }) => name);
    for (const role of matching.values()) {
      const key = names[role.name];
      if (key) results[key] = role;
      else results.other.push(role);
    }
    return results;
  }

  async getCustomPronouns(guild: Guild) {
    const { other } = await this.getPronouns(guild);
    return other;
  }

  async ensureRolesExist(guild: Guild) {
    return ensureRolesExist(
      guild,
      Object.values(this.pronounRoles).map(role => ({
        ...this.pronounRolesShared,
        ...role,
      })),
    );
  }

  prefix(name: string = "") {
    return `${this.pronounPrefix}: ${name}`;
  }

  stripPrefix(name: string) {
    return name.startsWith(this.prefix())
      ? name.slice(this.prefix().length)
      : name;
  }
}
