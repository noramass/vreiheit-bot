import { Constructor, createMount, Service } from "@propero/easy-api";
import { dataSource, Translation } from "@vreiheit/database";
import { createInjectionDecorators } from "@vreiheit/util";
import { IRouter, Router } from "express";

export const { Inject, Injectable, register, Init, withInit } =
  createInjectionDecorators();

export const api: IRouter = Router();
export const Mount = createMount(api);
export const HttpController = withInit((path: string) => (cls: Constructor) => {
  cls = Service()(cls as any) ?? cls;
  Mount(path)(cls);
});

register("translation-repo", () => dataSource.getRepository(Translation));
