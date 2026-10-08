"use client";

import { verifyTwoFactor } from "@/app/actions/twoFactor-actions";
import ConditionalRender from "@/components/ConditionalRender";
import ErrorOverlay from "@/components/ErrorOverlay";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import { signOut } from "next-auth/react";
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
  code: string;
};

type FeedbackState = "loading" | "success" | "error" | null;

function FormVerifyTwoFactor() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      code: "",
    },
  });
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [requireLogin, setRequireLogin] = useState(false);

  const singOutHanddle = () => {
    localStorage.removeItem("menu-data");
    signOut();
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    setFeedback("loading");
    setFeedbackMsg("Verificando código...");

    const res = await verifyTwoFactor({ code: data.code.trim() });

    if (!res.success) {
      setRequireLogin(res.data?.requireLogin === true);
      setFeedbackMsg(res.message || "No se pudo verificar el código");
      setFeedback("error");
      return;
    }

    setFeedbackMsg("Inicio de sesión exitoso");
    setFeedback("success");
    router.replace("/");
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading" || isSubmitting}>
        <Loading message={feedbackMsg || "Verificando..."} />
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
          onDone={() => {
            setFeedback(null);
            // La sesión temporal ya no sirve, hay que volver a iniciar sesión
            if (requireLogin) singOutHanddle();
          }}
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
              <h4 className="fw-bold mb-0">Verificación en dos pasos</h4>
              <p className="text-muted small mb-0">
                Ingresa el código de 6 dígitos de Google Authenticator
              </p>
            </div>

            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="card shadow-lg border-0 rounded-4"
            >
              <fieldset className="card-body p-4" disabled={isSubmitting}>
                <Form.FloatingLabel label="Código" className="mb-3">
                  <Form.Control
                    {...register("code", {
                      required: "El código es un campo obligatorio",
                      pattern: {
                        value: /^\d{3}\s?\d{3}$/,
                        message: "El código debe tener 6 dígitos",
                      },
                    })}
                    placeholder="Código"
                    type="text"
                    inputMode="numeric"
                    maxLength={7}
                    autoComplete="one-time-code"
                    autoFocus
                    isInvalid={!!errors.code}
                    className="rounded-3"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.code?.message}
                  </Form.Control.Feedback>
                </Form.FloatingLabel>

                <Button
                  variant="outline-danger"
                  type="submit"
                  className="w-100 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 fw-3"
                  disabled={isSubmitting || feedback === "loading"}
                >
                  {isSubmitting || feedback === "loading" ? "Cargando..." : "VERIFICAR"}
                </Button>

                <Button
                  variant="link"
                  type="button"
                  className="w-100 mt-2 text-muted small"
                  onClick={singOutHanddle}
                  disabled={isSubmitting || feedback === "loading"}
                >
                  Volver al inicio de sesión
                </Button>
              </fieldset>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default FormVerifyTwoFactor;
