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
    suffix?: React.ReactNode;
};

export const EntryNumber = ({
    label,
    type = "number",
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
    suffix,
}: FieldEntryProps) => {
    if (invisible) return null;

    const autoCompleteValue = type === "password" ? "new-password" : "off";
    const isNumber = type === "number";

    return (
        <Form.Group controlId={label} className="mb-2">
            <Form.Label className="fw-semibold">{label}</Form.Label>
            <div className="d-flex align-items-stretch position-relative">
                {prefix && (
                    <span
                        className="d-flex align-items-center px-2 bg-body-secondary border border-end-0 rounded-start text-muted fw-semibold"
                        style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}
                    >
                        {prefix}
                    </span>
                )}
                <Form.Control
                    className={`w-100 ${prefix ? "rounded-start-0" : ""} ${suffix ? "pe-5 no-validation-icon" : ""} ${className}`}
                    size="sm"
                    {...register}
                    type={type}
                    // Fuerza a que este input use "." como separador decimal
                    // sin importar el idioma configurado en el navegador/SO.
                    lang="en"
                    // "any" permite cualquier cantidad de decimales (evita que
                    // el navegador marque el campo como inválido al escribir puntos).
                    step={isNumber ? "any" : undefined}
                    autoComplete={autoCompleteValue}
                    disabled={readonly}
                    required={required}
                    isInvalid={invalid}
                    autoFocus={autoFocus}
                    as={as}
                    cols={cols}
                    rows={rows}
                    min={isNumber ? (min ?? "0") : min}
                    max={max}
                    // Desactiva el scroll para no cambiar el valor sin querer
                    onWheel={(e) => isNumber && e.currentTarget.blur()}
                    // No permite números negativos ni notación científica (e/E),
                    // pero SÍ deja pasar el punto decimal.
                    onKeyDown={(e) => {
                        if (isNumber && (e.key === "-" || e.key === "e" || e.key === "E")) {
                            e.preventDefault();
                        }
                    }}
                />
                {suffix && (
                    <span className="position-absolute top-50 end-0 translate-middle-y me-2" style={{ zIndex: 2 }}>
                        {suffix}
                    </span>
                )}
            </div>
            {feedBack && (
                <Form.Control.Feedback type="invalid" className={invalid ? "d-block" : ""}>
                    {feedBack}
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
};