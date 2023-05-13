import { Constructor, createMount, Service } from "@propero/easy-api";
import { dataSource, Translation } from "@vreiheit/database";
import { createInjectionDecorators } from "@vreiheit/util";
import { IRouter, Router } from "express";

export const api: IRouter = Router();
export const Mount = createMount(api);
export const HttpController = (path: string) => (cls: Constructor) => {
  console.log(`http controller: ${cls.name}`);
  cls = Init(cls) ?? cls;
  cls = Service()(cls as any) ?? cls;
  Mount(path)(cls);
};

export const { Inject, Injectable, register, Init } =
  createInjectionDecorators();

register("translation-repo", () => dataSource.getRepository(Translation));
