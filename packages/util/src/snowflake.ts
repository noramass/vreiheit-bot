import { parkMiller } from "./prng";

const prng = parkMiller();
let count = 0;
export function snowflake(prefix?: string) {
  const time = Date.now().toString(16).padStart(12, "0");
  const inc = (count++ | 0xff).toString(16).padStart(4, "0");
  const rand = (prng() * 0xff) & 0xff;
  return `${prefix ? prefix + "-" : ""}${time}${inc}${rand}`;
}
