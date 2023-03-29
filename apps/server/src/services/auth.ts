import { Get, Query, Req, Service, Session } from "@propero/easy-api";
import { dataSource, User } from "@vreiheit/database";
import { env } from "@vreiheit/util";
import * as crypto from "crypto";
import qs from "qs";
import axios from "axios";
import { Request } from "express";
import { Repository } from "typeorm";

@Service("/auth")
export class DiscordOAuth2 {
  get client_id() {
    return env("discord_client_id");
  }

  get client_secret() {
    return env("discord_client_secret");
  }

  get scope() {
    return env("discord_scope", "identify");
  }

  get repo(): Repository<User> {
    return dataSource.getRepository(User);
  }

  @Get("/authorize")
  async authorize(
    @Session() session: any,
    @Req request: Request,
    @Query("referer") referer: string = "/",
    @Query("code") code?: string,
    @Query("state") state?: string,
  ) {
    if (!code || !state) {
      state = crypto.randomUUID();
      session.oauth2 = { state, referer };
      return {
        redirect: this.buildAuthUrl("authorize", {
          response_type: "code",
          redirect_uri: this.getRedirectUri(request),
          client_id: this.client_id,
          scope: this.scope,
          state,
        }),
      };
    }

    if (state !== session.oauth2?.state)
      return { status: 401, data: "Invalid State" };

    const tokenData = await this.postAuthUrl("token", undefined, {
      grant_type: "authorization_code",
      client_id: this.client_id,
      client_secret: this.client_secret,
      redirect_uri: this.getRedirectUri(request),
      scope: this.scope,
      state,
      code,
    });

    const ref = session.oauth2.referer ?? "/";
    session.oauth2 = { token: tokenData };
    session.user = await this.getOrCreateUser(tokenData);
    return this.closeWindow(ref);
  }

  @Get("/logout")
  async logout(@Session("user") user: any, @Session() session: any) {
    if (!user) return { status: 200, data: { success: true } };
    await this.postAuthUrl("token/revoke", undefined, {
      client_id: this.client_id,
      client_secret: this.client_secret,
      token: session.oauth2.token.refresh_token,
    });
    await this.postAuthUrl("token/revoke", undefined, {
      client_id: this.client_id,
      client_secret: this.client_secret,
      token: session.oauth2.token.access_token,
    });
    session.user = session.oauth2 = undefined;
    return { status: 200, data: { success: true } };
  }

  getRedirectUri(req: Request) {
    return req.protocol + "://" + req.get("host") + req.baseUrl + req.path;
  }

  buildAuthUrl(endpoint: string, params?: any) {
    const url = `https://discordapp.com/api/oauth2/${endpoint}`;
    return params ? `${url}?${qs.stringify(params)}` : url;
  }

  async postAuthUrl(endpoint: string, params?: any, form?: any) {
    const { data } = await axios.post(
      this.buildAuthUrl(endpoint, params),
      qs.stringify(form),
      {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
    );
    return data;
  }

  scriptBody(script: string) {
    return `<html><head><script>${script}</script></head></html>`;
  }

  closeWindow(url: string) {
    return this.scriptBody(
      this.functionBody(
        (REDIRECT_URL: string) => {
          if (window.opener) {
            window.opener.postMessage({ type: "oauth", success: true });
            try {
              window.close();
            } catch (e) {
              /* unhandled */
            }
          } else window.location.href = REDIRECT_URL;
        },
        { REDIRECT_URL: JSON.stringify(url) },
      ),
    );
  }

  functionBody(
    fn: (...args: any[]) => void,
    replacements: Record<string, string> = {},
  ) {
    const body = fn.toString();
    const firstBrace = body.indexOf("{");
    const lastBrace = body.lastIndexOf("}");
    let code = body.slice(firstBrace + 1, lastBrace - 1).trim();
    for (const [key, value] of Object.entries(replacements))
      code = code.replaceAll(key, value);
    return code;
  }

  async getOrCreateUser({ token_type = "Bearer", access_token }: any) {
    const { data } = await axios.get("https://discordapp.com/api/users/@me", {
      headers: { Authorization: `${token_type} ${access_token}` },
    });
    const user = this.repo.create({
      id: data.id,
      username: data.username,
      avatarUrl: `//cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`,
    });
    await this.repo.save(user);
    return user;
  }
}
