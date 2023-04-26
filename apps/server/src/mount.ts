import { createMount } from "@propero/easy-api";
import { createInjectionDecorators } from "@vreiheit/util";
import { IRouter, Router } from "express";

export const api: IRouter = Router();
export const HttpController = createMount(api);

export const { Inject, Injectable } = createInjectionDecorators();
