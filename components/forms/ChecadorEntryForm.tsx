"use client";

import { getWelcome } from "@/app/actions/entry-actions";
import { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = {
  code: string;
  password: string;
};

function ChecadorEntryForm() {
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      code: "",
      password: "",
    },
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit: SubmitHandler<TInputs> = async (formData) => {
    const res = await getWelcome();
    console.log(res.data);
    setMessage(res.data?.data?.name as unknown as string);
    reset({ code: "", password: "" });
    setTimeout(() => {
      setFocus("code");
    }, 100);
  };

  return (
    <div className="row align-items-stretch">
      <div className="col-md-5">
        <Form
          className="card bg-body-tertiary"
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
                {...register("code")}
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
                {...register("password")}
                ref={(e) => {
                  register("password").ref(e);
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
      <div className="col-md-7 border border-2 bg-body-tertiary text-center">
        {message && <div className="fw-bold">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
}

export default ChecadorEntryForm;
