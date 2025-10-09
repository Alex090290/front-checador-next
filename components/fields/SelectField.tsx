"use client";

import { Form } from "react-bootstrap";
import { UseFormRegisterReturn } from "react-hook-form";

type FieldSelectProps = {
  label: string;
  register: UseFormRegisterReturn;
  options: { value: string | number; label: string }[];
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  feedBack?: React.ReactNode;
  className?: string;
};

export const FieldSelect = ({
  label,
  register,
  options,
  readonly,
  required,
  invalid,
  feedBack,
  className,
}: FieldSelectProps) => {
  return (
    <Form.Group controlId={label} className="mb-3">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <Form.Select
        size="sm"
        {...register}
        disabled={readonly}
        required={required}
        isInvalid={invalid}
        className={className}
      >
        <option></option>
        {options.map((opt, i) => (
          <option key={`${opt.value}-${i}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Form.Select>
      {feedBack && (
        <Form.Control.Feedback type="invalid">{feedBack}</Form.Control.Feedback>
      )}
    </Form.Group>
  );
};
