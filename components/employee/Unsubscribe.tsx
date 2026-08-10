"use client";

import { unsubscribeUser } from "@/app/actions/user-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect } from "@/components/fields";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Alert, Card, Row, Col } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useModals } from "@/context/ModalContext";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  dischargeReason: string;
  typeOfDischarge: string;
  dischargeDate: string;
};

export default function UnsubscribeEmployeeComponent({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: number;
  employeeName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      dischargeReason: "",
      typeOfDischarge: "",
      dischargeDate: "",
    },
  });
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");
  const router = useRouter();
  const { modalConfirm } = useModals();


  const upperCase = (text?: string) => {
    return text?.toUpperCase() || "";
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres dar de baja al empleado?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Dando de baja al empleado...");

        const res = await unsubscribeUser({
          id: employeeId,
          dischargeReason: data.dischargeReason,
          typeOfDischarge: data.typeOfDischarge,
          dischargeDate: data.dischargeDate,
        });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo dar de baja el empleado");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Empleado dado de baja correctamente");
        setFeedback("success");
        router.refresh();
        // onSuccess?.();
        // onClose();
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Guardando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onClose();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <div className="p-2">

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Dar de baja empleado</h4>
            <p className="text-muted mb-0">
              {employeeName ? `Empleado: ${upperCase(employeeName)}` : `Empleado #${employeeId}`}
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
            Baja
          </span>
        </div>

        <Alert variant="warning" className="rounded-4">
          Esta acción marcará al empleado como dado de baja. Captura la razón,
          el tipo de baja y la fecha efectiva.
        </Alert>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={loading || isSubmitting}>

            <Card className="border rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-clipboard-x text-danger" />
                  <h6 className="mb-0 fw-bold">Detalle de la baja</h6>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <FieldSelect
                      register={register("typeOfDischarge", {
                        required: "El tipo de baja es requerido",
                      })}
                      label="Tipo de baja:"
                      invalid={!!errors.typeOfDischarge}
                      feedBack={errors.typeOfDischarge?.message}
                      options={[
                        { value: "VOLUNTARIA", label: "VOLUNTARIA" },
                        { value: "INVOLUNTARIA", label: "INVOLUNTARIA" },
                        { value: "ABANDONO", label: "ABANDONO" },
                        { value: "TERMINO_DE_CONTRATO", label: "TÉRMINO DE CONTRATO" },
                        { value: "OTRA", label: "OTRA" },
                      ]}
                      className="border text-uppercase"
                    />
                  </Col>

                  <Col md={6}>
                    <Entry
                      register={register("dischargeDate", {
                        required: "La fecha de baja es requerida",
                      })}
                      label="Fecha de baja:"
                      type="date"
                      invalid={!!errors.dischargeDate}
                      feedBack={errors.dischargeDate?.message}
                      className="border text-uppercase"
                    />
                  </Col>

                  <Col md={12}>
                    <Entry
                      register={register("dischargeReason", {
                        required: "La razón de baja es requerida",
                      })}
                      label="Razón de baja:"
                      invalid={!!errors.dischargeReason}
                      feedBack={errors.dischargeReason?.message}
                      className="border text-uppercase"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="danger" disabled={loading || isSubmitting}>
                {isSubmitting ? "Dando de baja..." : "Dar de baja"}
              </Button>
            </div>

          </fieldset>
        </Form>
      </div>
    </>
  );
}