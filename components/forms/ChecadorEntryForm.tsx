"use client";

import { TCheckData } from "@/app/(auth)/app/checador/views/ChecadorFormView";
import { useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = {
  idCheck: string;
  passwordCheck: string;
};

function ChecadorEntryForm({
  receiveCheckData,
}: {
  receiveCheckData: (data: TCheckData) => void;
}) {
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      idCheck: "",
      passwordCheck: "",
    },
  });

  const onSubmit: SubmitHandler<TInputs> = (formData) => {
    receiveCheckData(formData);
    reset({ idCheck: "", passwordCheck: "" });
    setTimeout(() => {
      setFocus("idCheck");
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        setFocus("idCheck");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setFocus]);

  return (
    <div className="col-md-5">
      <Form
        className="card bg-body-tertiary border-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="card-body" disabled={isSubmitting}>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Código"
              className="text-center fw-bold"
              size="lg"
              autoComplete="off"
              autoFocus
              {...register("idCheck")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
            />
          </Form.Group>

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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(onSubmit)();
                }
              }}
            />
          </Form.Group>
        </fieldset>
      </Form>
    </div>
  );
}

export default ChecadorEntryForm;
