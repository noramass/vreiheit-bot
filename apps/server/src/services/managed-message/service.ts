import { Get, Param, Service } from "@propero/easy-api";
import { dataSource, ManagedMessage, Server } from "@vreiheit/database";
import {
  OnInit,
  DiscordService,
  ensureCommand,
  OnAutocomplete,
  OnChatCommand,
  DC,
} from "@vreiheit/discord";
import {
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";
import { lang } from "src/consts";
import { managedMessageCommand } from "./command";
import { UserGuilds } from "src/decorators/user-guilds";
import { ILike, Repository } from "typeorm";
import t from "./translations.json";

@DiscordService("managed-message")
@Service("/managed-message")
export class ManagedMessageService {
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

  translate(
    key: keyof (typeof t)["actions"],
    state: keyof (typeof t)["actions"][typeof key] = "success",
    locale: string = lang,
  ) {
    const translations = t.actions[key][state];
    return translations[locale] ?? translations[lang];
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
    await this.deleteMessage(cmd.guildId, tag);
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
    await this.updateMessage(cmd.guildId, tag, content, type);
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
    await this.createMessage(cmd.guildId, tag, content, type);
    if (channel) await this.postDiscordMessage(cmd.guildId, tag, channel.id);
    await cmd.editReply({
      content: this.translate("create", "success", cmd.locale),
    });
  }

  async createMessage(
    guildId: string,
    tag: string,
    content?: string,
    type?: "embed" | "plain",
  ) {
    // TODO: NYI
    console.log("create message", guildId, tag, content, type);
  }

  async updateMessage(
    guildId: string,
    tag: string,
    content?: string,
    type?: "embed" | "plain",
  ) {
    // TODO: NYI
    console.log("create message", guildId, tag, content, type);
  }

  async deleteMessage(guildId: string, tag: string) {
    await this.repo.delete({ tag, guild: { discordId: guildId } });
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

  async buildDiscordMessage(guildId: string, tag: string) {
    // TODO: NYI
    console.log("build discord message", guildId, tag);
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

  @Get("/:guildId?")
  async list(
    @UserGuilds userGuilds: Server[],
    @Param("guildId") guildId?: string,
  ) {
    console.log(userGuilds);
    const [items, count] = await this.repo.findAndCount({
      where: {
        guild: guildId && { discordId: guildId },
      },
    });
    return {
      data: {
        items,
        count,
      },
    };
  }
}
