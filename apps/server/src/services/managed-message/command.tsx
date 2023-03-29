import { DiscordElements as React, JSX } from "@vreiheit/discord";
import { ChannelType } from "discord.js";
import t from "./translations.json";

function SubCommand({
  name,
  children,
}: {
  name: keyof (typeof t)["subCommands"];
  children?: any;
}) {
  return (
    <subCommand
      name={t.subCommands[name].name["en-US"]}
      nameLocalizations={t.subCommands[name].name}
      description={t.subCommands[name].desc["en-US"]}
      descriptionLocalizations={t.subCommands[name].desc}>
      {children}
    </subCommand>
  );
}

function Option({
  name,
  children,
  required,
  autocomplete,
  type = "string",
  ...options
}: {
  name: keyof (typeof t)["options"];
  children?: any[];
  autocomplete?: boolean;
} & Partial<JSX.JsxSlashCommandOption>) {
  return (
    <commandOption
      type={type}
      name={t.options[name].name["en-US"]}
      nameLocalizations={t.options[name].name}
      description={t.options[name].desc["en-US"]}
      descriptionLocalizations={t.options[name].desc}
      autocomplete={autocomplete}
      required={required}
      {...options}>
      {children}
    </commandOption>
  );
}

function TagOption({ required = true }: { required?: boolean }) {
  return <Option name="tag" required={required} autocomplete />;
}

function TypeOption() {
  return (
    <Option name="type">
      <commandChoice
        value="embed"
        name={t.options.type.values.embed["en-US"]}
        nameLocalizations={t.options.type.values.embed}
      />
      <commandChoice
        value="plain"
        name={t.options.type.values.plain["en-US"]}
        nameLocalizations={t.options.type.values.plain}
      />
    </Option>
  );
}

function ContentOption() {
  return <Option name="content" />;
}

function ChannelOption({ required }: { required?: boolean }) {
  return (
    <Option
      name="channel"
      type="channel"
      channelTypes={[
        ChannelType.PublicThread,
        ChannelType.AnnouncementThread,
        ChannelType.PrivateThread,
        ChannelType.GuildText,
        ChannelType.GuildNews,
      ]}
      required={required}
    />
  );
}

export function managedMessageCommand() {
  return (
    <slashCommand
      name={t.name["en-US"]}
      nameLocalizations={t.name}
      description={t.name["en-US"]}
      descriptionLocalizations={t.desc}>
      <SubCommand name="refresh">
        <TagOption required={false} />
      </SubCommand>
      <SubCommand name="get">
        <TagOption />
      </SubCommand>
      <SubCommand name="edit">
        <TagOption />
        <ContentOption />
        <TypeOption />
      </SubCommand>
      <SubCommand name="create">
        <TagOption />
        <ContentOption />
        <TypeOption />
        <ChannelOption />
      </SubCommand>
      <SubCommand name="post">
        <TagOption />
        <ChannelOption required />
      </SubCommand>
      <SubCommand name="delete">
        <TagOption />
      </SubCommand>
      <SubCommand name="list" />
    </slashCommand>
  );
}
