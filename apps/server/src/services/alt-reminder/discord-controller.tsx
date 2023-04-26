import { dataSource, ServerMember } from "@vreiheit/database";
import {
  DiscordController,
  DiscordElements as React,
<<<<<<< HEAD:apps/server/src/services/alt-reminder/discord-controller.tsx
=======
  DiscordController,
>>>>>>> dev:apps/server/src/services/alt-reminder/service.tsx
  OnMessageCreate,
  OnMessageDelete,
} from "@vreiheit/discord";
import { Message } from "discord.js";
import t from "./translations.json";

@DiscordController()
<<<<<<< HEAD:apps/server/src/services/alt-reminder/discord-controller.tsx
export class AltReminderDiscordController {
=======
@Service()
export class AltReminderService {
>>>>>>> dev:apps/server/src/services/alt-reminder/service.tsx
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
