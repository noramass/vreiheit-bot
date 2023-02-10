import { Handler, OnInit } from "src/discord/decorators";
import { MessageBundle } from "src/discord/i18n/message-bundle";

@Handler()
export class I18nService {
  bundle = new MessageBundle("i18n/i18n.properties");

  @OnInit()
  async onInit() {
    await this.bundle.init();
  }

  get(key: string, ...params: any[]) {
    return this.bundle.get(key, ...params);
  }

  getDict(key: string, params: Record<string, any>) {
    return this.bundle.getDict(key, params);
  }

  lang(code: string) {
    return this.bundle.lang(code);
  }
}
