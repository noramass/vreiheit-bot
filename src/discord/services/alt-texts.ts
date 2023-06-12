import { EmbedBuilder, Message } from "discord.js";
import {
  Handler,
  OnMessageCreate,
  OnMessageDelete,
} from "src/discord/decorators";
import { sleep } from "src/util";

const text = `
**Hey!** Das Bild, das Du gerade eingestellt hast, hat keine Beschreibung. Dies schließt blinde oder sehbehinderte Benutzer\\*innen von der vollen Teilnahme an dieser Gemeinschaft aus.

Bitte, wenn möglich, poste Dein Bild mit einem Alt-Text [Eine Anleitung findest Du hier.](https://support.discord.com/hc/en-us/articles/211866427-How-do-I-upload-images-and-GIFs-#h_01GWWTHYJEV2S1WCDGFEMY21AQ)

**Hey!** The image you have just posted does not have a description. This excludes blind or low vision users from fully participating in this community.

Please, if possible, re-post your image with an alt-text. [A tutorial can be found here.](https://support.discord.com/hc/en-us/articles/211866427-How-do-I-upload-images-and-GIFs-#h_01GWWTHYJEV2S1WCDGFEMY21AQ)
`.trim();

@Handler()
export class AltTexts {
  replies: Record<string, Message> = {};

  @OnMessageCreate()
  async onMessageCreate(message: Message) {
    if (message.member.user.bot) return;
    if (message.channel.isVoiceBased()) return;

    const withoutDesc = message.attachments.find(
      x => x.contentType.startsWith("image/") && !x.description,
    );

    if (!withoutDesc) return;

    this.replies[message.id] = await message.reply({
      embeds: [new EmbedBuilder().setDescription(text)],
    });

    await sleep(60000);
    await this.onMessageDelete(message);
  }

  @OnMessageDelete()
  async onMessageDelete(message: Message) {
    const reply = this.replies[message.id];
    delete this.replies[message.id];
    if (reply) await reply.delete();
  }
}
