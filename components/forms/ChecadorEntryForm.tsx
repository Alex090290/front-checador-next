"use client";

import { TCheckData } from "@/app/(auth)/app/checador/views/ChecadorFormView";
import { ActionResponse } from "@/lib/definitions";
import { useEffect, useRef } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = {
  idCheck: string;
  passwordCheck: string;
};

type Props = {
  receiveCheckData: (data: TCheckData) => Promise<ActionResponse<string>>;
  disabled?: boolean;
};

function ChecadorEntryForm({
  receiveCheckData,
  disabled = false,
}: Props) {
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setError,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<TInputs>({
    defaultValues: {
      idCheck: "",
      passwordCheck: "",
    },
  });

  const onSubmit: SubmitHandler<TInputs> = async (formData) => {
    if (disabled) return;

    const res = await receiveCheckData(formData);

    if (!res.success) {
      setError("passwordCheck", { type: "custom", message: res.message });
      setTimeout(() => setFocus("passwordCheck"), 100);
      return;
    }

    reset({ idCheck: "", passwordCheck: "" });
    setTimeout(() => setFocus("idCheck"), 100);
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !disabled) {
        e.preventDefault();
        setFocus("idCheck");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setFocus, disabled]);

  return (
    <>
      <Row className="m-0" style={{ minWidth: '40%' }}>
        <Col md="12" className="px-0">
          <Form className="card bg-body-tertiary border-0 mt-2 w-100" onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="card-body" disabled={isSubmitting || disabled}>

              {/* Apartao de codido */}
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  placeholder="Código"
                  className="text-center fw-bold"
                  size="lg"
                  autoComplete="off"
                  autoFocus={!disabled}
                  {...register("idCheck")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                />
              </Form.Group>

              {/* Apartado de contrasena */}
              <Form.Group>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  className="text-center fw-bold"
                  size="lg"
                  autoComplete="off"
                  {...register("passwordCheck")}
                  ref={(e) => {
                    register("passwordCheck").ref(e);
                    passwordRef.current = e;
                  }}
                  isInvalid={!!errors.passwordCheck}
                />
              </Form.Group>

              <div>
                <Button
                  type="submit"
                  size="sm"
                  variant="info"
                  disabled={isSubmitting || disabled || !isDirty}>
                  {isSubmitting ? "Registrando..." : "Completar registro"}
                </Button>
              </div>
            </fieldset>
          </Form>
        </Col>
      </Row>

      <Row className="my-6">
        <Col lg="12">
          <Form.Control.Feedback type="invalid">
            {errors.passwordCheck?.message}
          </Form.Control.Feedback>
        </Col>
      </Row>
    </>
  );
}

export default ChecadorEntryForm;