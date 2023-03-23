import clsx from "clsx";
import React from "react";
import classes from "./field-label.module.pcss";
export interface FieldLabelOptions {
  text: string;
  required?: boolean;
  for?: string;
}

export function FieldLabel({
  text,
  required,
  for: htmlFor,
}: FieldLabelOptions) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx({
        [classes.fieldLabel]: true,
        required,
      })}>
      {text}
    </label>
  );
}
