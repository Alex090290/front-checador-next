"use client";

import { Button, Card, Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { ITwoFactorSetup, ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { enableTwoFactor, setupTwoFactor } from "@/app/actions/twoFactor-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useEffect, useRef, useState } from "react";
import ErrorOverlay from "@/components/ErrorOverlay";
import SuccessOverlay from "@/components/SuccessOverlay";
import { QRCodeSVG } from "qrcode.react";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  code: string;
};

function TwoFactorSetupModal({ onHide }: ModalBasicProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: { code: "" },
  });

  const router = useRouter();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [setupData, setSetupData] = useState<ITwoFactorSetup | null>(null);
  const setupRequested = useRef(false);

  useEffect(() => {
    // Evita generar dos QR distintos (StrictMode monta dos veces en desarrollo)
    if (setupRequested.current) return;
    setupRequested.current = true;

    const loadSetup = async () => {
      setFeedback("loading");
      setFeedbackMsg("Generando código QR...");

      const res = await setupTwoFactor();

      if (!res.success || !res.data) {
        setFeedbackMsg(res.message || "No se pudo generar el código QR");
        setFeedback("error");
        return;
      }

      setSetupData(res.data);
      setFeedback(null);
    };

    loadSetup();
  }, []);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    try {
      setFeedback("loading");
      setFeedbackMsg("Activando verificación en dos pasos...");

      const res = await enableTwoFactor({ code: data.code.trim() });

      if (!res.success) {
        setFeedbackMsg(res.message || "No se pudo activar la verificación en dos pasos");
        setFeedback("error");
        return;
      }

      setFeedbackMsg(res.message || "Verificación en dos pasos activada");
      setFeedback("success");
      router.refresh();
    } catch {
      setFeedbackMsg("Error inesperado, intenta de nuevo");
      setFeedback("error");
    }
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
          onDone={() => {
            setFeedback(null);
            // Si no se pudo generar el QR no hay nada que capturar
            if (!setupData) onHide();
          }}
        />
      </ConditionalRender>

      <div className="p-2 mt-4">

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Activar verificación en dos pasos</h4>
            <p className="text-muted mb-0">
              Protege tu cuenta con un código de Google Authenticator.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Seguridad
          </span>
        </div>

        <ConditionalRender cond={!!setupData}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting}>

              <Card className="border rounded-4 mb-3">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-qr-code text-primary" />
                    <h6 className="mb-0 fw-bold">1. Escanea el código QR</h6>
                  </div>

                  <p className="text-muted small mb-3">
                    Abre Google Authenticator → <strong>+</strong> → <strong>Escanear código QR</strong>.
                  </p>

                  <div className="d-flex justify-content-center mb-3">
                    <div className="bg-white p-3 rounded-3 border">
                      <QRCodeSVG value={setupData?.otpauthUrl ?? ""} size={180} />
                    </div>
                  </div>

                  <p className="text-muted small mb-1">
                    ¿No puedes escanearlo? Captura esta clave manualmente:
                  </p>
                  <div className="bg-body-secondary rounded-3 px-3 py-2 font-monospace fw-semibold text-break text-center">
                    {setupData?.secret}
                  </div>
                </Card.Body>
              </Card>

              <Card className="border rounded-4 mb-3">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-shield-lock text-primary" />
                    <h6 className="mb-0 fw-bold">2. Ingresa el código de 6 dígitos</h6>
                  </div>

                  <Form.Group controlId="twoFactorCode" className="mb-2">
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

                <Button type="submit" variant="success" disabled={isSubmitting}>
                  {isSubmitting ? "Activando..." : "Activar"}
                </Button>
              </div>

            </fieldset>
          </Form>
        </ConditionalRender>
      </div>
    </>
  );
}

export default TwoFactorSetupModal;
