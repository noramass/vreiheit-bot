import { dataSource, ManagedMessage } from "@vreiheit/database";
import {
  DC,
  DiscordController,
  ensureCommand,
  OnAutocomplete,
  OnChatCommand,
  OnInit,
} from "@vreiheit/discord";
import {
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";
import { lang } from "src/consts";
import { ManagedMessageService } from "src/services";
import { managedMessageCommand } from "src/services/managed-message/command";
import t from "src/services/managed-message/translations.json";
import { ILike, Repository } from "typeorm";

@DiscordController("managed-message")
export class ManagedMessageDiscordController {
  messageService!: ManagedMessageService;

  get repo(): Repository<ManagedMessage> {
    return dataSource.getRepository(ManagedMessage);
  }

  @OnInit
  async onInit(client: Client<true>) {
    await ensureCommand(client, managedMessageCommand());
  }

  @OnAutocomplete("message", "tag")
  async onAutocompleteTag(
    auto: AutocompleteInteraction,
    option: any,
    value: string,
  ) {
    const options = await this.repo.find({
      where: {
        tag: ILike(`%${value}%`),
        guild: { discordId: auto.guildId },
      },
      order: { tag: "DESC" },
    });
    await auto.respond(options.map(it => ({ name: it.tag, value: it.tag })));
  }

  @OnChatCommand("message", "get")
  async onCommandGet(
    @DC.Interaction cmd: CommandInteraction,
    @DC.Option.Value("tag") tag: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    const msg: any = await this.buildDiscordMessage(cmd.guildId, tag);
    await cmd.editReply(msg);
  }

  @OnChatCommand("message", "delete")
  async onCommandDelete(
    @DC.Interaction cmd: CommandInteraction,
    @DC.Option.Value("tag") tag: string,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.deleteDiscordMessage(cmd.guildId, tag);
    await this.messageService.deleteMessage(cmd.guildId, tag);
    await cmd.editReply({
      content: this.translate("delete", "success", cmd.locale),
    });
  }

  @OnChatCommand("message", "post")
  async onCommandPost(
    @DC.Interaction cmd: CommandInteraction,
    @DC.Option.Value("tag") tag: string,
    @DC.Option.Channel("channel") channel: GuildTextBasedChannel,
  ) {
    await cmd.deferReply({ ephemeral: true });
    await this.deleteDiscordMessage(cmd.guildId, tag);
    await this.postDiscordMessage(cmd.guildId, tag, channel.id);
    await cmd.editReply({
      content: this.translate("post", "success", cmd.locale),
    });
  }

  @OnChatCommand("message", "edit")
  async onCommandEdit(
    @DC.Interaction cmd: CommandInteraction,
    @DC.Option.Value("tag") tag: string,
    @DC.Option.Value("type") type?: "embed" | "plain",
    @DC.Option.Value("content") content?: string,
  ) {
    if (!content) return this.buildMessageModal("edit", cmd, tag, type);
    await cmd.deferReply({ ephemeral: true });
    await this.messageService.updateMessage(cmd.guildId, tag, content, type);
    await this.updateDiscordMessage(cmd.guildId, tag);
    await cmd.editReply({
      content: this.translate("edit", "success", cmd.locale),
    });
  }

  @OnChatCommand("message", "create")
  async onCommandCreate(
    @DC.Interaction cmd: CommandInteraction,
    @DC.Option.Value("tag") tag: string,
    @DC.Option.Value("type") type?: "embed" | "plain",
    @DC.Option.Value("content") content?: string,
    @DC.Option.Channel("channel") channel?: GuildTextBasedChannel,
  ) {
    if (!content)
      return this.buildMessageModal("create", cmd, tag, type, channel?.id);
    await cmd.deferReply({ ephemeral: true });
    await this.messageService.createMessage(cmd.guildId, tag, content, type);
    if (channel) await this.postDiscordMessage(cmd.guildId, tag, channel.id);
    await cmd.editReply({
      content: this.translate("create", "success", cmd.locale),
    });
  }

  translate(
    key: keyof (typeof t)["actions"],
    state: keyof (typeof t)["actions"][typeof key] = "success",
    locale: string = lang,
  ) {
    const translations = t.actions[key][state];
    return translations[locale] ?? translations[lang];
  }

  async buildMessageModal(
    action: "edit" | "create",
    cmd: CommandInteraction,
    tag: string,
    type?: "embed" | "plain",
    channel?: string,
  ) {
    // TODO: NYI
    console.log("build message modal", action, cmd, tag, type, channel);
  }

  async buildDiscordMessage(guildId: string, tag: string) {
    // TODO: NYI
    console.log("build discord message", guildId, tag);
  }

  async postDiscordMessage(guildId: string, tag: string, channel: string) {
    // TODO: NYI
    console.log("post discord message", guildId, tag, channel);
  }

  async updateDiscordMessage(guildId: string, tag: string) {
    // TODO: NYI
    console.log("update discord message", guildId, tag);
  }

  async deleteDiscordMessage(guildId: string, tag: string) {
    // TODO: NYI
    console.log("delete discord message", guildId, tag);
  }
}
