import { config } from "dotenv";

const configured = false;
export function env<T = string>(key: string, defaultValue?: T | (() => T)): T {
  if (!configured) config({ path: ".env.local" });
  const type = typeof defaultValue;
  if (type === "function") return env(key, (defaultValue as () => T)());
  const value = process.env[key];
  switch (type) {
    case "string":
      return value as T;
    case "object":
      return value ? JSON.parse(value) : (defaultValue as T);
    case "number":
      return isNaN(+value) ? (defaultValue as T) : (+value as T);
    case "boolean":
      return value != null ? ((value === "true") as T) : (defaultValue as T);
    case "symbol":
      return value != null ? (Symbol.for(value) as T) : (defaultValue as T);
    case "bigint":
      return value != null ? (BigInt(value) as T) : (defaultValue as T);
    case "undefined":
      return value as T;
  }
}
