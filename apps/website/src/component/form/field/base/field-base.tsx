import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { snowflake } from "@vreiheit/util";
import { TextEditor } from "src/component/form/field/editor/text-editor";
import { FieldLabel } from "src/component/form/field/label/field-label";
import classes from "./field-base.module.pcss";

export interface FieldBaseOptions<T> {
  id?: string;
  name?: string;

  label?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: T;
  onChange?(newValue: T, oldValue?: T): void;
}

export function FieldBase<T>(options: FieldBaseOptions<T>) {
  const { name, id, label, required, disabled, readonly, onChange } = options;
  const [generatedId] = useState(id ?? snowflake(name));

  const [value, setValue] = useState(options.value);
  useEffect(() => {
    onChange?.(options.value, value);
  }, [value]);

  return (
    <div
      className={clsx({
        [classes.fieldContainer]: true,
        required,
        disabled,
        readonly,
      })}>
      {label && (
        <FieldLabel text={label} required={required} for={id ?? generatedId} />
      )}
      <div className={classes.fieldBase}>
        <div className={classes.fieldEditor}>
          <TextEditor
            value={value as string}
            disabled={disabled}
            readonly={readonly}
            name={name}
            id={id ?? generatedId}
            item="covfefe"
            onChange={setValue as any}
          />
        </div>
      </div>
    </div>
  );
}
