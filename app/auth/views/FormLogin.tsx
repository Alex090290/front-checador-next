"use client";

import { userLogin } from "@/app/actions/user-actions";
import ConditionalRender from "@/components/ConditionalRender";
import ErrorOverlay from "@/components/ErrorOverlay";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import Image from "next/image";


type TInputs = {
  email: string;
  password: string;
};

type FeedbackState = "loading" | "success" | "error" | null;

function FormLogin() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");


  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");

    const res = await userLogin(data);

    if (!res.success) {
      setFeedbackMsg(res.message || "No se pudo iniciar sesión");
      setFeedback("error");
      return;
    }
    setFeedbackMsg(res.message || "Inicio de sesión exitoso");
    setFeedback("success");
    // router.replace("/app/checador?view_type=form");
    router.replace("/");
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading" || isSubmitting}>
        <Loading message={feedbackMsg || "Actualizando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, var(--bs-danger-bg-subtle), var(--bs-body-bg))",
        }}
      >
        <Row className="w-100 justify-content-center">
          <Col xs="11" sm="8" md="5" lg="4" xl="4" xxl="3">
            <div className="text-center mb-4">

              {/* LOGO */}
              <Image
                src="/image/icon.svg"
                alt="GAMA"
                width={68}
                height={68}
                style={{ objectFit: "contain" }}
              />
              {/* <i className="bi bi-shield-lock-fill fs-3" /> */}
              <h4 className="fw-bold mb-0">Checador Digital</h4>
              <p className="text-muted small mb-0">Inicia sesión para continuar</p>
            </div>

            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="card shadow-lg border-0 rounded-4"
            >
              <fieldset className="card-body p-4" disabled={isSubmitting}>
                <Form.FloatingLabel label="Usuario" className="mb-3">
                  <Form.Control
                    {...register("email", { required: "Este campo es requerido" })}
                    placeholder="Usuario"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    isInvalid={!!errors.email}
                    className="rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.FloatingLabel>

                <div className="position-relative mb-3">
                  <Form.FloatingLabel label="Contraseña">
                    <Form.Control
                      {...register("password", { required: "Este campo es requerido" })}
                      placeholder="Contraseña"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      isInvalid={!!errors.password}
                      className="rounded-3 pe-5 no-validation-icon"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`btn btn-link p-0 position-absolute top-50 end-0 translate-middle-y me-3 ${errors.password ? "text-danger" : "text-info"
                        }`}
                      style={{ zIndex: 5 }}
                      tabIndex={10}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: "1.3rem" }} />
                    </button>
                    <Form.Control.Feedback type="invalid" className={errors.password ? "d-block" : ""}>
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.FloatingLabel>

                </div>

                {/* <Button
                  type="submit"
                  variant="outline-secondary"
                  className="w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 fw-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting || loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      Espere un momento...
                    </>
                  ) : (
                    "ENTRAR"
                  )}
                </Button> */}

                <Button
                  variant="outline-danger"
                  type="submit"
                  className="w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 fw-3"
                  disabled={isSubmitting || feedback === "loading"}
                >
                  {isSubmitting || feedback === "loading" ? "Cargando..." : "ENTRAR"}
                </Button>
              </fieldset>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default FormLogin;
