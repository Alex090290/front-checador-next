import React from "react";
import { Control, UseFormRegisterReturn } from "react-hook-form";

import { Form } from "react-bootstrap";
import { Many2one, Many2OneOption } from "./Many2one";

type FieldMany2oneProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  register: UseFormRegisterReturn;
  options: Many2OneOption[];
  label: string;
  readonly?: boolean;
  callBackMode: "object" | "id";
};

export function RelationField({
  control,
  register,
  label,
  options,
  callBackMode,
  readonly,
}: FieldMany2oneProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <Many2one
        disabled={readonly}
        options={options}
        {...register}
        control={control}
        callBackMode={callBackMode}
        size="sm"
      />
    </Form.Group>
  );
}
