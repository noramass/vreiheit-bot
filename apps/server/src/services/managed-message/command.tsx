import { DiscordElements as React, JSX } from "@vreiheit/discord";
import { ChannelType } from "discord.js";
import { lang } from "src/consts";
import t from "./translations.json";

function SubCommand({
  name: cmd,
  children,
}: {
  name: keyof (typeof t)["subCommands"];
  children?: any;
}) {
  const { name, desc } = t.subCommands[cmd];
  return (
    <subCommand
      name={name[lang]}
      nameLocalizations={name}
      description={desc[lang]}
      descriptionLocalizations={desc}>
      {children}
    </subCommand>
  );
}

function Option({
  name: option,
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
  const { name, desc } = t.options[option];
  return (
    <commandOption
      type={type}
      name={name[lang]}
      nameLocalizations={name}
      description={desc[lang]}
      descriptionLocalizations={desc}
      autocomplete={autocomplete}
      required={required}
      {...options}>
      {children}
    </commandOption>
  );
}

function TagOption({
  required = true,
  autocomplete = true,
}: {
  required?: boolean;
  autocomplete?: boolean;
}) {
  return <Option name="tag" required={required} autocomplete={autocomplete} />;
}

function TypeOption() {
  return (
    <Option name="type">
      <commandChoice
        value="embed"
        name={t.options.type.values.embed[lang]}
        nameLocalizations={t.options.type.values.embed}
      />
      <commandChoice
        value="plain"
        name={t.options.type.values.plain[lang]}
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
      name={t.name[lang]}
      nameLocalizations={t.name}
      description={t.name[lang]}
      descriptionLocalizations={t.desc}>
      <SubCommand name="get">
        <TagOption />
      </SubCommand>
      <SubCommand name="edit">
        <TagOption />
        <ContentOption />
        <TypeOption />
      </SubCommand>
      <SubCommand name="create">
        <TagOption autocomplete={false} />
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
    </slashCommand>
  );
}

managedMessageCommand.meta = {
  name: t.name[lang],
};
