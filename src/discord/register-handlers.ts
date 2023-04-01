import { GuildMember } from "discord.js";
import { dataSource } from "src/database/data-source";
import { Server } from "src/database/entities/server";
import { ServerMember } from "src/database/entities/server-member";
import { registeredHandlers } from "src/discord/decorators";
import { client } from "src/discord/init";
import {
  getServer,
  getServerMember,
} from "src/discord/members/get-server-member";
import { sendDm } from "src/discord/messages";
import { sleep } from "src/util";

let lastProcessed: string;
client.on("interactionCreate", async interaction => {
  if (lastProcessed === interaction.id) return;
  lastProcessed = interaction.id;
  for (const handler of registeredHandlers.interaction)
    await handler(interaction);
});

client.on("ready", async client => {
  await client.guilds.fetch();
  for (const guild of client.guilds.cache.values()) {
    await guild.fetch();
    const preview = await guild.fetchPreview();
    for (const channel of guild.channels.cache.values())
      if (channel.isTextBased()) await channel.messages.fetch();
    await dataSource.getRepository(Server).upsert(
      {
        discordId: guild.id,
        name: guild.name,
        icon: preview.iconURL(),
        splash: preview.splashURL(),
        description: preview.description,
      },
      ["discordId"],
    );
  }
  for (const handler of registeredHandlers.init) await handler(client);

  for (const guild of client.guilds.cache.values()) {
    await guild.fetch();
    const server = await getServer(guild.id);

    console.log("GUILD", guild.name, guild.approximateMemberCount);
    const mapped = await Promise.all(
      guild.members.cache
        .filter(it => !it.user.bot)
        .map(async member => {
          const data = await getServerMember(member);
          return {
            member,
            data,
          };
        }),
    );

    const toDm: { member: GuildMember; data: ServerMember }[] = [];
    const repo = dataSource.getRepository(ServerMember);

    for (const { member, data } of mapped) {
      if (!data.hierarchyRole) {
        if (!member.roles.highest) {
          await member.roles.add(server.newComerRoleId);
          data.hierarchyRole = server.newComerRoleId;
        } else data.hierarchyRole = member.roles.highest.id;
      }

      if (!data.rulesAccepted) {
        if (
          member.roles.cache.find(
            it =>
              it.id === server.veganRoleId || it.id === server.notVeganRoleId,
          )
        )
          data.rulesAccepted = true;
        else toDm.push({ member, data });
      }

      if (!data.pronouns) {
        const match = member.roles.cache.find(it =>
          it.name.startsWith("Pronomen: "),
        );
        if (match) data.pronouns = match.name.slice("Pronomen: ".length);
        else toDm.push({ member, data });
      }

      await repo.save(data);
    }
  }
});

client.on("guildMemberRemove", async member => {
  for (const handler of registeredHandlers.memberLeave)
    try {
      await handler(member as any);
    } catch (err) {
      console.error(err);
    }
});

client.on("guildMemberAdd", async member => {
  for (const handler of registeredHandlers.memberJoin)
    try {
      await handler(member as any);
    } catch (err) {
      console.error(err);
    }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  for (const handler of registeredHandlers.memberUpdate)
    try {
      await handler(oldMember as any, newMember);
    } catch (err) {
      console.error(err);
    }
});

client.on("guildBanAdd", async ban => {
  for (const handler of registeredHandlers.ban)
    try {
      await handler(ban);
    } catch (err) {
      console.error(err);
    }
});

client.on("guildBanRemove", async ban => {
  for (const handler of registeredHandlers.unban)
    try {
      await handler(ban);
    } catch (err) {
      console.error(err);
    }
});

client.on("roleUpdate", async (oldRole, newRole) => {
  for (const handler of registeredHandlers.roleUpdate)
    try {
      await handler(oldRole, newRole);
    } catch (err) {
      console.error(err);
    }
});

client.on("roleCreate", async role => {
  for (const handler of registeredHandlers.roleCreate)
    try {
      await handler(role);
    } catch (err) {
      console.error(err);
    }
});

client.on("roleDelete", async role => {
  for (const handler of registeredHandlers.roleDelete)
    try {
      await handler(role);
    } catch (err) {
      console.error(err);
    }
});

client.on("messageCreate", async message => {
  for (const handler of registeredHandlers.messageCreate)
    try {
      await handler(message);
    } catch (err) {
      console.error(err);
    }
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  for (const handler of registeredHandlers.messageUpdate)
    try {
      await handler(oldMessage as any, newMessage as any);
    } catch (err) {
      console.error(err);
    }
});

client.on("messageDelete", async message => {
  for (const handler of registeredHandlers.messageDelete)
    try {
      await handler(message as any);
    } catch (err) {
      console.error(err);
    }
});
client.on("voiceStateUpdate", async (oldState, newState) => {
  for (const handler of registeredHandlers.voiceStateUpdate)
    try {
      await handler(oldState, newState);
    } catch (err) {
      console.error(err);
    }
});

client.on("error", console.error);
