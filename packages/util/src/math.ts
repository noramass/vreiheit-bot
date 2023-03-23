const { abs, round, sin, cos, atan2, max, min, pow, PI: pi } = Math;
const taw = pi * 2;
export function roundTo(n: number, digits = 8) {
  const factor = pow(10, digits);
  return round(n * factor) / factor;
}

export function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

export function lerpR(a: number, b: number, n: number) {
  const cs = (1 - n) * cos(a) + n * cos(b);
  const sn = (1 - n) * sin(a) + n * sin(b);
  return atan2(sn, cs);
}

export function lerpBounds(
  a: number,
  b: number,
  n: number,
  lower: number,
  higher: number,
) {
  const delta = higher - lower;
  a = (a - lower) % delta;
  b = (b - lower) % delta;
  if (abs(b - a) < abs(b > a ? b - (a + delta) : b + delta - a))
    return clampR(lerp(a, b, n) + lower, lower, higher);
  else if (b > a) return clampR(lerp(a + delta, b, n) + lower, lower, higher);
  else return clampR(lerp(a, b + delta, n) + lower, lower, higher);
}

export function clamp(n: number, lower: number, upper: number) {
  return max(lower, min(upper, n));
}

export function clampR(n: number, lower: number = -pi, upper: number = pi) {
  const delta = upper - lower;
  return lower + ((((n - lower) % delta) + delta) % delta);
}

export function distanceR(
  a: number,
  b: number,
  lower: number = -pi,
  higher: number = pi,
) {
  const delta = higher - lower;
  a = (a - lower) % delta;
  b = (b - lower) % delta;
  const rangeA = abs(a - b);
  const rangeB = abs(b > a ? b - (a + delta) : b + delta - a);
  return min(rangeA, rangeB);
}
