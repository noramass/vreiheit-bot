import { DiscordElements as React, JSX } from "@vreiheit/discord";
import t from "./translations.json";

function Option({
  name,
  children,
  required,
  autocomplete,
  type = "string",
}: {
  name: keyof (typeof t)["options"];
  type?: JSX.JsxSlashCommandOption["type"];
  children?: any[];
  required?: boolean;
  autocomplete?: boolean;
}) {
  return (
    <commandOption
      type={type}
      name={t.options[name].name["en-US"]}
      nameLocalizations={t.options[name].name}
      description={t.options[name].desc["en-US"]}
      descriptionLocalizations={t.options[name].desc}
      autocomplete={autocomplete}
      required={required}>
      {children}
    </commandOption>
  );
}

function TagOption() {
  return <Option name="tag" required autocomplete />;
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

function ChannelOption() {
  return <Option name="channel" type="channel" />;
}

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

export function managedMessageCommand() {
  return (
    <slashCommand
      name={t.name["en-US"]}
      nameLocalizations={t.name}
      description={t.name["en-US"]}
      descriptionLocalizations={t.desc}>
      <SubCommand name="refresh">
        <TagOption />
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
    </slashCommand>
  );
}
