"use client";

import { createNewDocument } from "@/app/actions/inability-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import React, { useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
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
        <div className="mb-4">
          <h4 className="mb-1">Documento CITT</h4>
          <p className="text-secondary mb-0">
            Agrega un nuevo documento con su rango de fechas y folio.
          </p>
        </div>

        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Entry
                type="date"
                register={register("dateInit", { required: true })}
                label="Fecha inicio"
                invalid={!!errors.dateInit}
              />
            </Col>

            <Col md={6}>
              <Entry
                type="date"
                register={register("dateEnd", { required: true })}
                label="Fecha fin"
                min={onChangeDateInit}
                invalid={!!errors.dateEnd}
              />
            </Col>

            <Col md={12}>
              <Entry
                register={register("folio", { required: true })}
                label="Folio CITT"
                className="text-uppercase"
                invalid={!!errors.folio}
              />
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Documento</Form.Label>
                <Form.Control
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.webp"
                  {...register("document", { required: true })}
                  isInvalid={!!errors.document}
                />
                <Form.Control.Feedback type="invalid">
                  Este campo es requerido
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? "Cargando..." : "Cargar"}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default ModalAddDocuments;