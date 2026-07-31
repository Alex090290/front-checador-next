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
  cols?: number;
  rows?: number;
  prefix?: React.ReactNode;
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
  cols,
  rows,
  prefix,
}: FieldEntryProps) => {
  if (invisible) return null;
  return (
    <Form.Group controlId={label} className="mb-2">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <div className="position-relative">
        {prefix && (
          <span
            className="position-absolute text-muted"
            style={{
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            {prefix}
          </span>
        )}
        <Form.Control
          className={`text-uppercase w-100 ${prefix ? "ps-4" : ""} ${className}`}
          size="sm"
          {...register}
          type={type}
          autoComplete="off"
          disabled={readonly}
          required={required}
          isInvalid={invalid}
          autoFocus={autoFocus}
          as={as}
          cols={cols}
          rows={rows}
          min={min}
          max={max}
        />
      </div>
      {feedBack && (
        <Form.Control.Feedback type="invalid">{feedBack}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
};
