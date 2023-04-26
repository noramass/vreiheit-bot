import { Service } from "@propero/easy-api";
import { dataSource, ServerMember } from "@vreiheit/database";
import {
  DiscordElements as React,
  DiscordController,
  OnMessageCreate,
  OnMessageDelete,
} from "@vreiheit/discord";
import { Message } from "discord.js";
import t from "./translations.json";

@DiscordController()
@Service()
export class AltReminderService {
  get users() {
    return dataSource.getRepository(ServerMember);
  }

  replies: Record<string, Message> = {};

  @OnMessageCreate
  async onMessageCreate(message: Message): Promise<void> {
    const withoutDesc = message.attachments.find(
      x => x.contentType.startsWith("image/") && !x.description,
    );

    if (!withoutDesc) return;

    const user = await this.users.findOne({
      where: { discordId: message.author.id },
    });
    const locale = user?.locale ?? "de";

    this.replies[message.id] = await message.reply({
      embeds: [<embed description={t.reminderText[locale]} />],
    });
  }

  @OnMessageDelete
  async onMessageDelete(message: Message): Promise<void> {
    const altReminderMessage = this.replies[message.id];
    if (!altReminderMessage) return;

    await altReminderMessage.delete();
    delete this.replies[message.id];
  }
}
