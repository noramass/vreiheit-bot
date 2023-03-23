import { sleep } from "@vreiheit/util";
import { useCallback, useLayoutEffect, useRef } from "react";

export function resize(
  el: HTMLElement | undefined,
  { width = false, height = false } = {},
) {
  if (!el) return;
  if (height) {
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }
  if (width) {
    el.style.width = "0px";
    el.style.width = el.scrollWidth + "px";
  }
}
export function useGrowing<T extends HTMLElement>({
  width = false,
  height = false,
  events = ["input", "change", "keypress"],
} = {}) {
  const ref = useRef<T>();
  const applySize = useCallback(() => {
    if (ref.current) resize(ref.current, { width, height });
  }, [width, height]);

  useLayoutEffect(() => {
    applySize();

    const handler = () => {
      applySize();
      sleep(1).then(applySize);
    };

    for (const event of events) ref.current!.addEventListener(event, handler);

    return () => {
      for (const event of events)
        ref.current!.removeEventListener(event, handler);
    };
  }, [events]);

  return [ref, applySize] as const;
}
