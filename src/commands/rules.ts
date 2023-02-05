import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { register } from "src/commands/registry";

register("rules", async message => {
  if (!message.member.permissions.has("Administrator")) return;
  const content = message.content;
  const text = content.slice(content.indexOf(" ") + 1).trim();
  message.channel.send({
    content: text,
    components: [createAcceptDenyButtons("rules")],
  });
});

function createAcceptDenyButtons(
  prefix: string,
  accept: string = "accept",
  deny: string = "deny",
) {
  return new ActionRowBuilder<ButtonBuilder>().setComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Ablehnen")
      .setCustomId(`${prefix}:${accept}`),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setLabel("Akzeptieren")
      .setCustomId(`${prefix}:${deny}`),
  );
}
