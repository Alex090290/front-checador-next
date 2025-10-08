"use client";

import { Form } from "react-bootstrap";
import { FormCheckType } from "react-bootstrap/esm/FormCheck";
import { UseFormRegisterReturn } from "react-hook-form";

type FieldCheckboxProps = {
  label: string;
  type?: FormCheckType;
  register: UseFormRegisterReturn;
  readonly?: boolean;
};

export const BooleanField = ({
  label,
  type = "switch",
  register,
  readonly,
}: FieldCheckboxProps) => {
  return (
    <Form.Group className="mb-3" controlId={label}>
      <Form.Check type={type} label={label} {...register} disabled={readonly} />
    </Form.Group>
  );
};
