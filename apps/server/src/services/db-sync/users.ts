import {
  DiscordGuild,
  DiscordGuildMember,
  DiscordRole,
  Flags,
} from "@vreiheit/database";
import { OnInit } from "@vreiheit/discord";
import { Color } from "@vreiheit/util";
import { Client, Guild, GuildMember, Role } from "discord.js";
import { Injectable } from "src/mount";

@Injectable({ initialise: true })
export class Users {
  @OnInit
  async onInit(client: Client<true>) {
    for (const guild of client.guilds.cache.values()) {
      await this.syncRoles([...guild.roles.cache.values()]);
      await this.syncMembers([...guild.members.cache.values()]);
    }
  }

  async syncGuild(guild: Guild) {
    await DiscordGuild.upsert(
      {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        banner: guild.bannerURL(),
        approximateMembers: guild.approximateMemberCount,
        approximateOnline: guild.approximatePresenceCount,
        description: guild.description,
        verificationLevel: guild.verificationLevel as any,
        systemChannelFlags: new Flags(guild.systemChannelFlags.bitfield, false),
        splash: guild.splashURL(),
        premiumTier: guild.premiumTier as any,
        defaultMessageNotificationLevel:
          guild.defaultMessageNotifications as any,
        ownerId: guild.ownerId,
        discoverySplash: guild.discoverySplashURL(),
        features: guild.features as any,
        preferredLocale: guild.preferredLocale as any,
        mfaLevel: guild.mfaLevel as any,
        explicitContentFilterLevel: guild.explicitContentFilter as any,
      },
      { conflictPaths: ["id"] },
    );
  }

  async syncRoles(roles: Role[]) {
    await DiscordRole.upsert(
      roles.map(role => {
        return {
          id: role.id,
          guildId: role.guild.id,
          color: Color.toRgb(role.color),
          icon: role.iconURL(),
          managed: role.managed,
          name: role.name,
          hoist: role.hoist,
          mentionable: role.mentionable,
          permissions: new Flags(role.permissions.bitfield, true),
          position: role.position,
          tags: role.tags,
          uniqueEmoji: role.unicodeEmoji,
        } as DiscordRole;
      }),
      { conflictPaths: ["id", "guildId"] },
    );
  }

  async syncMembers(members: GuildMember[]) {
    await DiscordGuildMember.upsert(
      members.map(member => {
        const roles = [...member.roles.cache.values()];
        const user = member.user;
        return {
          user: {
            id: user.id,
            username: user.username,
            accentColor: Color.toRgb(user.accentColor),
            avatar: user.avatarURL(),
            bot: user.bot,
            banner: user.bannerURL(),
            system: user.system,
            discriminator: user.discriminator,
            globalName: user.tag,
            flags: new Flags(user.flags.bitfield),
          },
          guildId: member.guild.id,
          avatar: member.avatarURL(),
          nick: member.displayName,
          premiumSince: member.premiumSince,
          communicationDisabledUntil: member.communicationDisabledUntil,
          roles: roles.length
            ? roles.map(role => ({ id: role.id, guildId: role.guild.id }))
            : undefined,
          flags: new Flags(member.flags.bitfield),
          joinedAt: member.joinedAt,
          createdAt: user.createdAt,
          deaf: member.voice.deaf,
          mute: member.voice.mute,
        };
      }),
      { conflictPaths: ["userId", "guildId"] },
    );
  }
}
