"use client";

import { Button, Card, Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import { disableTwoFactor } from "@/app/actions/twoFactor-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useState } from "react";
import ErrorOverlay from "@/components/ErrorOverlay";
import SuccessOverlay from "@/components/SuccessOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  code: string;
};

function TwoFactorDisableModal({ onHide }: ModalBasicProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: { code: "" },
  });

  const router = useRouter();
  const { modalConfirm } = useModals();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres desactivar la verificación en dos pasos?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Desactivando verificación en dos pasos...");

        const res = await disableTwoFactor({ code: data.code.trim() });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo desactivar la verificación en dos pasos");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Verificación en dos pasos desactivada");
        setFeedback("success");
        router.refresh();
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Cargando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onHide();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <div className="p-2 mt-4">

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Desactivar verificación en dos pasos</h4>
            <p className="text-muted mb-0">
              Ingresa el código actual de Google Authenticator para confirmar.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Seguridad
          </span>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting}>

            <Card className="border rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-shield-lock text-primary" />
                  <h6 className="mb-0 fw-bold">Código de 6 dígitos</h6>
                </div>

                <Form.Group controlId="twoFactorDisableCode" className="mb-2">
                  <Form.Label className="fw-semibold">Código:</Form.Label>
                  <Form.Control
                    {...register("code", {
                      required: "El código es un campo obligatorio",
                      pattern: {
                        value: /^\d{3}\s?\d{3}$/,
                        message: "El código debe tener 6 dígitos",
                      },
                    })}
                    size="sm"
                    type="text"
                    inputMode="numeric"
                    maxLength={7}
                    autoComplete="one-time-code"
                    placeholder="000000"
                    autoFocus
                    isInvalid={!!errors.code}
                    className="text-left border"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.code?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onHide}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="danger" disabled={isSubmitting}>
                {isSubmitting ? "Desactivando..." : "Desactivar"}
              </Button>
            </div>

          </fieldset>
        </Form>
      </div>
    </>
  );
}

export default TwoFactorDisableModal;
