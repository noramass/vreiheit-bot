import { createMount } from "@propero/easy-api";
import { createInjectionDecorators } from "@vreiheit/util";
import { Router } from "express";

export const api = Router();
export const HttpController = createMount(api);

export const { Inject, Injectable } = createInjectionDecorators();
