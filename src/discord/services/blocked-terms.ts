import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
  ComponentType,
  GuildMember,
  Message,
  MessageCreateOptions,
  MessagePayload,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { ensureCommand } from "src/discord/commands/ensure-command";
import {
  Handler,
  OnCommand,
  OnFormSubmit,
  OnInit,
  OnMessageCreate,
} from "src/discord/decorators";
import { BlockedTerm } from "src/database/entities/blocked-term";
import { Server } from "src/database/entities/server";
import { dataSource } from "src/database/data-source";
import { modLog } from "src/discord/logging/mod-log";

@Handler("blocked-terms")
export class BlockedTermsService {
  blockedTermsMap: Record<string, BlockedTerm[]> = {};
  guildsMap: Record<string, Server> = {};

  @OnInit()
  async init(client: Client<true>) {
    for (const guild of client.guilds.cache.values()) {
      this.guildsMap[guild.id] = await dataSource
        .getRepository(Server)
        .findOne({ where: { discordId: guild.id } });
      this.blockedTermsMap[guild.id] = await dataSource
        .getRepository(BlockedTerm)
        .find({
          where: { guild: { discordId: guild.id } },
        });
    }
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName("create-blocked-term")
        .setDMPermission(false)
        .setDescription("Erstellt ein Blockpattern")
        .addStringOption(builder =>
          builder
            .setName("pattern")
            .setDescription(
              "Der zu blockierende Begriff, bzw das RegExp pattern",
            )
            .setRequired(true),
        )
        .addStringOption(builder =>
          builder
            .setName("tags")
            .setDescription("Eine Liste an Tags, durch Kommata separiert")
            .setRequired(false),
        )
        .addStringOption(builder =>
          builder
            .setName("action")
            .setDescription("Eine Aktion, die ausgeführt werden soll")
            .setRequired(false),
        ),
    );
    await ensureCommand(
      client,
      new SlashCommandBuilder()
        .setName("delete-blocked-term")
        .setDMPermission(false)
        .setDescription("Löscht ein Blockpattern")
        .addStringOption(builder =>
          builder
            .setName("pattern")
            .setRequired(true)
            .setDescription("Das zu entfernende Blockpattern"),
        ),
    );
  }

  @OnCommand("delete-blocked-term")
  async onDeleteBlockedTerm(command: CommandInteraction) {
    await command.deferReply({ ephemeral: true });
    if (!command.memberPermissions.has("ManageMessages"))
      return await command.editReply({
        content: "Du hast keine Berechtigungen, blockierte Wörter zu löschen!",
      });

    const id = command.options.data.find(it => it.name === "pattern")
      .value as string;
    const termIndex = this.blockedTermsMap[command.guildId].findIndex(
      it => it.id === +id,
    );
    if (termIndex === -1)
      return await command.editReply({
        content: "Dieses Pattern existiert nicht!",
      });
    const term = this.blockedTermsMap[command.guildId][termIndex];
    await dataSource.getRepository(BlockedTerm).delete(term.id);
    this.blockedTermsMap[command.guildId].splice(termIndex, 1);
    await command.editReply({
      content: "Blockpattern gelöscht!",
    });
    await modLog(command.guild, {
      content: `${
        (command.member.user as User).tag
      } löschte den geblockten Begriff: **"${term.pattern.source}"**`,
    });
  }

  @OnCommand("create-blocked-term")
  async onCreateBlockedTerm(command: CommandInteraction) {
    await command.deferReply({ ephemeral: true });
    if (!command.memberPermissions.has("ManageMessages"))
      return await command.editReply({
        content: "Du hast keine Berechtigung, blockierte Wörter festzulegen!",
      });

    const term: Partial<BlockedTerm> = {};
    term.guild = this.guildsMap[command.guildId] as any;
    term.author = { discordId: command.user.id } as any;

    for (const option of command.options.data) {
      switch (option.name) {
        case "pattern":
          term.pattern = new RegExp(option.value as string, "i");
          break;
        case "tags":
          term.tags = option.value as string;
          break;
        case "action":
          term.action = option.value as string;
          break;
      }
    }

    await dataSource.getRepository(BlockedTerm).save(term);
    this.blockedTermsMap[command.guildId].push(term as any);
    await command.editReply({
      content: "Blockierter Begriff erfasst!",
    });
    await modLog(command.guild, {
      content: `${
        (command.member.user as User).tag
      } erstellte den geblockten Begriff: **"${
        term.pattern.source
      }"**, aktion: ${term.action}`,
    });
  }

  @OnMessageCreate()
  async onMessage(message: Message) {
    if (!message.member || message.member.user.bot) return;
    for (const term of this.getBlockedTerms(message.guildId, "chat")) {
      const match = term.pattern.exec(message.cleanContent);
      if (match) {
        const tag = message.member.user.tag;
        await message.delete();
        const reason = `Geblockter Begriff "${match[0]}"`;
        switch (term.action) {
          case "warn":
            await modLog(message.guild, {
              content: `User ${message.member.displayName} wurde für eine Nachricht im chat verwarnt: **"${match[0]}"**`,
              components: [
                this.buildUserActionRow(message.member.user, reason),
              ],
            });
            return this.dmUser(message.member.user, {
              content: `Deine Nachricht wurde entfernt, weil sie **"${match[0]}"** enthielt. Die Moderation wurde informiert.`,
            });
          case "kick":
            await message.member.kick(reason);
            return modLog(message.guild, {
              content: `User ${tag} wurde gekickt für: **"${match[0]}"**`,
            });
          case "ban":
            await message.member.ban({ reason });
            return modLog(message.guild, {
              content: `User ${tag} wurde gebannt für: **"${match[0]}"**`,
            });
        }
      }
    }
  }

  @OnFormSubmit("-pronouns:add")
  async onPronounsSubmit(forms: ModalSubmitInteraction) {
    const name =
      forms.fields.getField("name", ComponentType.TextInput).value ?? "";
    for (const term of this.getBlockedTerms(forms.guildId, "pronouns")) {
      const match = term.pattern.exec(name);
      if (match) {
        const reason = `Geblocktes Pronomen "${match[0]}"`;
        switch (term.action) {
          case "kick":
            await (forms.member as GuildMember).kick(reason);
            return modLog(forms.guild, {
              content: `User ${forms.member.user.username} wurde gekickt für: **"${match[0]}"**`,
            });
          case "ban":
            await (forms.member as GuildMember).ban({ reason });
            return modLog(forms.guild, {
              content: `User ${forms.member.user.username} wurde gebannt für: **"${match[0]}"**`,
            });
          case "warn":
            forms.fields.getField("name", ComponentType.TextInput).value =
              "Blockiert";
        }
      }
    }
    await modLog(forms.guild, {
      content: `${forms.user} setzte benutzerdefinierte Pronomen: "${name}"`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Löschen")
            .setCustomId("pronouns:delete:" + forms.user.id)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setLabel("Kicken")
            .setCustomId(`members:kick:${forms.user.id}:Blockierte Pronomen`)
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setLabel("Bannen")
            .setCustomId(`members:ban:${forms.user.id}:Blockierte Pronomen`)
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setLabel("Okay!")
            .setCustomId("messages:delete:::1")
            .setStyle(ButtonStyle.Success),
        ),
      ],
    });
  }

  getBlockedTerms(guildId: string, category: string) {
    return (
      this.blockedTermsMap[guildId]?.filter(term => {
        const isGeneral = term.tags.includes("general");
        if (category === "general") return isGeneral;
        return isGeneral || term.tags.includes(category);
      }) ?? []
    );
  }

  buildUserActionRow(user: User, reason: string = "N/A") {
    return new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`members:kick:${user.id}:${reason.replace(/:/g, "-")}`)
        .setLabel("Kicken"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`members:ban:${user.id}:${reason.replace(/:/g, "-")}`)
        .setLabel("Bannen"),
    );
  }

  async dmUser(
    user: User,
    message: string | MessagePayload | MessageCreateOptions,
  ) {
    if (!user.dmChannel) await user.createDM();
    await user.dmChannel.send(message);
    await user.deleteDM();
  }
}
