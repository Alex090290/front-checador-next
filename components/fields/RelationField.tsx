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
  className?: string;
  invalid?: boolean;
  feedBack?: React.ReactNode;
};

export function RelationField({
  control,
  register,
  label,
  options,
  callBackMode,
  readonly,
  className,
  feedBack,
  invalid,
}: FieldMany2oneProps) {
  return (
    <Form.Group className="mb-2">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <div className="position-relative">
        <Many2one
          disabled={readonly}
          options={options}
          {...register}
          control={control}
          callBackMode={callBackMode}
          size="sm"
          className={`${className ?? ""} pe-4`}
          isInvalid={invalid}
        />
        {!readonly && (
          <i
            className="bi bi-chevron-down position-absolute text-muted"
            style={{
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              fontSize: "0.75rem",
            }}
          />
        )}
      </div>
      {feedBack && (
        <Form.Control.Feedback type="invalid" className={invalid ? "d-block" : ""}>
          {feedBack}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}