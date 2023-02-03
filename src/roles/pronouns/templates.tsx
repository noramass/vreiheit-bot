import { Guild } from "discord.js";
import {
  MessageActionRow,
  MessageButton,
  DiscordComponents,
} from "discord.tsx";
import { chunks } from "../../util";
import { stripPronounPrefix } from "./prefix";
import { getAllPronounRoles } from "./roles";

export async function createPronounButtons(guild: Guild) {
  const { other: _, ...primary } = await getAllPronounRoles(guild);
  const roles = chunks(Object.values(primary), 5);
  return (
    <>
      {roles.map(row => (
        <MessageActionRow>
          {row.map(role => (
            <MessageButton
              style="SECONDARY"
              label={stripPronounPrefix(role.name)}
              customId={stripPronounPrefix(role.name)}
            />
          ))}
        </MessageActionRow>
      ))}
    </>
  );
}

export async function createPronounModal() {
  return;
}
