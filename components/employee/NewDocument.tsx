"use client";

import { createNewDocumentEmployee } from "@/app/actions/employee-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  nameDocument: string;
};

export default function NewDocumentEmployeeComponent({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      nameDocument: "",
    },
  });

  const { modalError } = useModals();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    try {
      setLoading(true);
      setMessageLoading("Creando nueva plantilla...");

      const res = await createNewDocumentEmployee({
        nameDocument: data.nameDocument,
      });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message || "Nueva plantilla creada correctamente");
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
      setMessageLoading("");
    }
  };

  return (
    <div className="p-2">
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={messageLoading || "Guardando..."} />
      </ConditionalRender>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Nueva plantilla</h4>
          <p className="text-muted mb-0">
            Crea un nuevo apartado de documento para todos los empleados y períodos.
          </p>
        </div>

        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
          Nuevo
        </span>
      </div>

      <Alert variant="info" className="rounded-4">
        Captura el nombre visible de la nueva plantilla. El sistema generará el
        nuevo documento para todos los empleados.
      </Alert>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading || isSubmitting}>

          <Card className="border rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-file-earmark-text text-primary" />
                <h6 className="mb-0 fw-bold">Datos de la plantilla</h6>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <Entry
                    register={register("nameDocument", {
                      required: "El nombre del documento es requerido",
                    })}
                    label="Nombre del documento:"
                    invalid={!!errors.nameDocument}
                    feedBack={errors.nameDocument?.message}
                    className="text-uppercase border"
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

            <Button type="submit" variant="success" disabled={loading || isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear plantilla"}
            </Button>
          </div>

        </fieldset>
      </Form>
    </div>
  );
}