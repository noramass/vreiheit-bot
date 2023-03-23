import clsx from "clsx";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useGrowing } from "src/hook/growing";
import classes from "./editor.module.pcss";

export interface TextEditorOptions {
  disabled?: boolean;
  readonly?: boolean;
  name?: string;
  id?: string;
  value?: string;
  items?: string[];
  item?: string;
  onChange(value: string): void;
  onCycle?(step: number): void;
}

export function TextEditor({
  value,
  disabled,
  readonly,
  name,
  id,
  item,
  onChange: change,
  onCycle,
}: TextEditorOptions) {
  const [growRef, applySize] = useGrowing<HTMLInputElement>({ width: true });
  const [current, setCurrent] = useState(value);

  const itemMatches = item && current && item.includes(current);
  const itemIndex = itemMatches ? item.indexOf(current) : -1;
  const prefix = itemMatches ? item.slice(0, itemIndex) : "";
  const suffix = itemMatches ? item.slice(itemIndex + current.length) : "";

  useEffect(applySize, [value]);
  useEffect(() => setCurrent(value), [value]);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCurrent(event.currentTarget.value);
      change(event.currentTarget.value);
    },
    [change],
  );

  const onKeyDown = useCallback(
    (ev: KeyboardEvent<HTMLInputElement>) => {
      switch (ev.key) {
        case "ArrowUp":
          onCycle?.(-1);
          ev.preventDefault();
          break;
        case "ArrowDown":
          onCycle?.(1);
          ev.preventDefault();
          break;
        case "ArrowRight":
          if (ev.currentTarget.selectionEnd !== value.length) return;
          if (item && current) {
            ev.preventDefault();
            change(item);
          }
          break;
        case " ":
          if (!ev.ctrlKey && !ev.metaKey) return;
          if (item && current) {
            ev.preventDefault();
            change(item);
          }
      }
    },
    [change, item, current],
  );

  return (
    <div
      className={clsx({
        [classes.textEditor]: true,
        disabled,
        readonly,
      })}>
      <span className={classes.prefix}>{prefix}</span>
      <input
        ref={growRef}
        type="text"
        name={name}
        id={id}
        value={current}
        disabled={disabled}
        readOnly={readonly}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={classes.input}
      />
      <span className={classes.suffix}>{suffix}</span>
    </div>
  );
}
