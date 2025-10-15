"use client";

import { Form } from "react-bootstrap";
import { UseFormRegisterReturn } from "react-hook-form";

type FieldEntryProps = {
  label: string;
  type?: React.HTMLInputTypeAttribute; // "text" | "password" | "email" | ...
  register: UseFormRegisterReturn;
  readonly?: boolean;
  invisible?: boolean;
  required?: boolean;
  invalid?: boolean;
  feedBack?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
};

export const Entry = ({
  label,
  type = "text",
  register,
  readonly,
  required,
  feedBack,
  className,
  invalid,
  autoFocus,
}: FieldEntryProps) => {
  return (
    <Form.Group controlId={label} className="mb-2">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <Form.Control
        className={className}
        size="sm"
        {...register}
        type={type}
        autoComplete="off"
        disabled={readonly}
        required={required}
        isInvalid={invalid}
        autoFocus={autoFocus}
      />
      {feedBack && (
        <Form.Control.Feedback type="invalid">{feedBack}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
};
