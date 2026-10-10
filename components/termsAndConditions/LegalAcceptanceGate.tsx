"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { signOut, useSession } from "next-auth/react";
import ModalBlur from "../ModalBlur";
import ConditionalRender from "../ConditionalRender";
import ErrorOverlay from "../ErrorOverlay";
import Loading from "../LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { acceptLegalDocument, getLegalAcceptanceStatus } from "@/app/actions/termsAndConditions-actions";
import { ILegalAcceptanceStatus, TLegalDocumentType } from "@/lib/termsAndConditions/interface";

type FeedbackState = "error" | null;

const LEGAL_TYPES: TLegalDocumentType[] = ["TERMINOS", "PRIVACIDAD"];

const PUBLIC_PAGES: Record<TLegalDocumentType, string> = {
  TERMINOS: "/legal/terminos",
  PRIVACIDAD: "/legal/privacidad",
};

const CHECK_LABELS: Record<TLegalDocumentType, string> = {
  TERMINOS: "He leído y acepto los Términos y condiciones.",
  PRIVACIDAD: "He leído el Aviso de privacidad y otorgo mi consentimiento para el tratamiento de mis datos personales, incluidos mis datos biométricos (reconocimiento facial).",
};

// Revisa una vez por carga del layout de /app si hay documentos legales por aceptar
export default function LegalAcceptanceGate() {
  const { data: session, status: sessionStatus } = useSession();
  const { modalConfirm } = useModals();

  const [status, setStatus] = useState<ILegalAcceptanceStatus | null>(null);
  const [checked, setChecked] = useState<Record<TLegalDocumentType, boolean>>({ TERMINOS: false, PRIVACIDAD: false });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const requested = useRef(false);

  const loadStatus = useCallback(async () => {
    // Si falla (red, 500, server action interrumpida…) no se bloquea al usuario:
    // solo se registra en consola y se vuelve a intentar en la siguiente carga
    try {
      const res = await getLegalAcceptanceStatus();

      if (!res.success || !res.data) {
        console.log("No se pudo consultar la aceptación de documentos legales:", res.message);
        return;
      }

      setStatus(res.data.mustAccept ? res.data : null);
      setChecked({ TERMINOS: false, PRIVACIDAD: false });
    } catch (error) {
      console.log("No se pudo consultar la aceptación de documentos legales:", error);
    }
  }, []);

  useEffect(() => {
    if (requested.current || sessionStatus !== "authenticated") return;

    // Solo con la sesión completa (después del 2FA) y nunca para la cuenta del checador
    if (session?.user?.role === "CHECADOR" || session?.user?.twoFactorPending) return;

    requested.current = true;
    loadStatus();
  }, [sessionStatus, session, loadStatus]);

  if (!status?.mustAccept) return null;

  const pending = LEGAL_TYPES.filter((type) => status.documents[type]?.mustAccept && status.documents[type]?.active);
  if (!pending.length) return null;

  const isUpdate = pending.some((type) => status.documents[type].accepted !== null);
  const allChecked = pending.every((type) => checked[type]);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      for (const type of pending) {
        const version = Number(status.documents[type].active?.version);
        const res = await acceptLegalDocument(type, version);

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo registrar la aceptación");
          setFeedback("error");

          // 409: hay una versión más reciente → se vuelve a consultar y se desmarcan las casillas
          if (res.data?.conflict) await loadStatus();
          return;
        }
      }

      setStatus(null);
    } catch {
      setFeedbackMsg("Error inesperado, intenta de nuevo");
      setFeedback("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = () => {
    modalConfirm("Si no aceptas, se cerrará tu sesión. ¿Deseas continuar?", () => {
      localStorage.removeItem("menu-data");
      signOut();
    });
  };

  return (
    <>
      <ModalBlur locked closeOnEsc={false} showCloseButton={false} zIndex={1990}>
        <div className="d-flex flex-column p-2 p-md-3" style={{ maxHeight: "calc(90vh - 1rem)" }}>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h4 className="mb-1 fw-bold">
                {isUpdate ? "Actualizamos nuestros documentos" : "Antes de continuar"}
              </h4>
              <p className="text-muted mb-0">
                Para usar la plataforma necesitas leer y aceptar los siguientes documentos.
              </p>
            </div>

            <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
              Legal
            </span>
          </div>

          <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
            {pending.map((type) => {
              const active = status.documents[type].active;

              return (
                <Card key={type} className="border rounded-4 mb-3">
                  <Card.Body className="p-3 p-md-4">
                    <a
                      href={PUBLIC_PAGES[type]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-inline-flex align-items-center gap-2 fw-semibold mb-3 text-break"
                    >
                      <i className="bi bi-box-arrow-up-right" />
                      Leer {active?.title} (versión {active?.version})
                    </a>

                    <Form.Check
                      type="checkbox"
                      id={`legal-accept-${type}`}
                      label={CHECK_LABELS[type]}
                      checked={checked[type]}
                      disabled={submitting}
                      onChange={(e) => setChecked((prev) => ({ ...prev, [type]: e.target.checked }))}
                    />
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 pt-3 border-top">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={handleReject}
              disabled={submitting}
            >
              Rechazar
            </Button>

            <Button
              type="button"
              variant="success"
              onClick={handleAccept}
              disabled={!allChecked || submitting}
            >
              Aceptar
            </Button>
          </div>
        </div>
      </ModalBlur>

      <ConditionalRender cond={submitting}>
        <Loading message="Guardando..." />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>
    </>
  );
}
