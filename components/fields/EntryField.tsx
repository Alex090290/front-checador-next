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
  as?: React.ElementType;
  min?: string;
  max?: string;
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
  invisible,
  as,
  min,
  max,
}: FieldEntryProps) => {
  if (invisible) return null;
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
        as={as}
        min={min}
        max={max}
      />
      {feedBack && (
        <Form.Control.Feedback type="invalid">{feedBack}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
};
