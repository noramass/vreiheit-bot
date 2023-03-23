export function parseMs(str: string | number): number {
  if (typeof str === "number") return str;
  let ms = 0;
  str.replace(
    /\b([0-9]+)\s*(weeks|week|w|days|day|d|hours|hour|h|minutes|minute|mins|min|m|seconds|second|secs|sec|s|milliseconds|millisecond|millis|milli|ms)\b/g,
    (_, amount, unit) => {
      switch (unit) {
        case "weeks":
        case "week":
        case "w":
          ms += amount * 1000 * 60 * 60 * 24 * 7;
          break;
        case "days":
        case "day":
        case "d":
          ms += amount * 1000 * 60 * 60 * 24;
          break;
        case "hours":
        case "hour":
        case "h":
          ms += amount * 1000 * 60 * 60;
          break;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          ms += amount * 1000 * 60;
          break;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          ms += amount * 1000;
          break;
        case "milliseconds":
        case "millisecond":
        case "millis":
        case "milli":
        case "ms":
          ms += +amount;
      }
      return "";
    },
  );
  return ms;
}

export function sleep(ms: string | number) {
  return new Promise(resolve => setTimeout(resolve, parseMs(ms)));
}
