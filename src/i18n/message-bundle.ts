import { readFile } from "fs/promises";
export class MessageBundle {
  values: Record<string, string> = {};
  languages: Record<string, MessageBundle> = {};
  constructor(public fileName: string, languages: string[] = []) {
    for (const language of languages)
      this.languages[language] = new MessageBundle(
        fileName.replace(".properties", `.${language}.properties`),
      );
  }

  async init() {
    for (const bundle of Object.values(this.languages)) await bundle.init();
    const str = await readFile(this.fileName, "utf-8");
    let value = "",
      key = "";
    for (let line of str.split(/(?:\r?\n)/g)) {
      line = line.trim();
      if (!line && !value) continue;
      const commentIndex = line.indexOf("#");
      if (commentIndex !== -1) line = line.slice(0, commentIndex).trim();
      const equalsIndex = line.indexOf("=");
      if (equalsIndex !== -1) {
        if (key) this.values[key] = value;
        key = line.slice(0, equalsIndex).trimEnd();
        value = line.slice(equalsIndex + 1).trimStart();
      } else value += `\n${line}`;
    }
    if (key) this.values[key] = value;
  }
  get(key: string, ...params: any[]) {
    return params.reduce((str, param, index) => {
      return str.replaceAll(`{${index}}`, String(param));
    }, this.values[key] ?? "");
  }

  getDict(key: string, values: Record<string, any>) {
    return Object.entries(values).reduce((str, [key, value]) => {
      return str.replaceAll(`{${key}}`, String(value));
    }, this.values[key] ?? "");
  }

  lang(code: string): Pick<MessageBundle, "get" | "getDict"> {
    return {
      get(key: string, ...params: any[]) {
        return (
          this.languages[code].get(key, ...params) || this.get(key, ...params)
        );
      },
      getDict(key: string, values: Record<string, any>) {
        return (
          this.languages[code].getDict(key, values) || this.getDict(key, values)
        );
      },
    };
  }
}
