export function openWindow(
  url: string,
  target = "_blank",
  timeout = 60000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const w = window.open(url, target)!;
    if (!w) reject("popup");
    const timeoutId = setTimeout(() => {
      reject("timeout");
      clearInterval(intervalId);
    }, timeout);
    const intervalId = setInterval(() => {
      if (!w.closed) return;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      resolve();
    }, 200);
  });
}
