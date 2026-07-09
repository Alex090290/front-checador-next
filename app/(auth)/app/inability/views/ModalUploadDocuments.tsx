"use client";

import { createNewDocument } from "@/app/actions/inability-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import React, { useState } from "react";
import { Button, Form, Row, Col, Card } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  dateInit: string;
  folio: string;
  dateEnd: string;
  document: FileList | null;
};

type Props = {
  idDoc: string;
  onHide: () => void;
};

function ModalAddDocuments({ idDoc, onHide }: Props) {
  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      dateEnd: "",
      dateInit: "",
      folio: "",
      document: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const onChangeDateInit = watch("dateInit");

  const handleClose = () => {
    reset({
      dateEnd: "",
      dateInit: "",
      folio: "",
      document: null,
    });
    onHide();
  };

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading("Creando nuevo documento...");

    try {
      setLoading(true);

      const res = await createNewDocument({
        idDoc,
        folio: data.folio,
        dateEnd: data.dateEnd,
        dateInit: data.dateInit,
        formData: data.document,
      });

      if (!res.success) {
        toast.error(res.message, { id: toastId });
        return;
      }

      toast.success(res.message, { id: toastId });
      handleClose();
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message="Cargando documento..." />
      </ConditionalRender>

      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Documento CITT</h4>
            <p className="text-muted mb-0">
              Agrega un nuevo documento con su rango de fechas y folio.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Nuevo
          </span>
        </div>

        <Form onSubmit={onSubmit}>
          <Card className="border rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-calendar-range text-primary" />
                <h6 className="mb-0 fw-bold">Vigencia</h6>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Entry
                    type="date"
                    register={register("dateInit", { required: true })}
                    label="Fecha inicio"
                    invalid={!!errors.dateInit}
                    className="border"
                  />
                </Col>

                <Col md={6}>
                  <Entry
                    type="date"
                    register={register("dateEnd", { required: true })}
                    label="Fecha fin"
                    min={onChangeDateInit}
                    invalid={!!errors.dateEnd}
                    className="border"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-upc-scan text-warning" />
                <h6 className="mb-0 fw-bold">Folio</h6>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <Entry
                    register={register("folio", { required: true })}
                    label="Folio CITT"
                    className="text-uppercase border"
                    invalid={!!errors.folio}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border rounded-4">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-file-earmark-arrow-up text-info" />
                <h6 className="mb-0 fw-bold">Documento</h6>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Archivo
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.webp"
                      className="border"
                      {...register("document", { required: true })}
                      isInvalid={!!errors.document}
                    />
                    <Form.Control.Feedback type="invalid">
                      Este campo es requerido
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="success" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? "Cargando..." : "Cargar"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default ModalAddDocuments;