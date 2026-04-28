"use client";

import { createNewDocumentEmployee } from "@/app/actions/employee-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
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
    <div className="p-4">
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={messageLoading || "Guardando..."} />
      </ConditionalRender>

      <div className="mb-3 pe-4">
        <h4 className="mb-1">Nueva plantilla</h4>
        <div className="text-secondary">
          Crea un nuevo apartado de documento para todos los empleados y períodos.
        </div>
      </div>

      <Alert variant="info">
        Captura el nombre visible de la nueva plantilla. El sistema generará el
        nuevo documento para todos los empleados.
      </Alert>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading || isSubmitting}>
          <div className="d-grid gap-3">
            <Entry
              register={register("nameDocument", {
                required: "El nombre del documento es requerido",
              })}
              label="Nombre del documento:"
              invalid={!!errors.nameDocument}
              feedBack={errors.nameDocument?.message}
              className="text-uppercase"
            />

            <div className="d-flex justify-content-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || isSubmitting}
              >
                Crear plantilla
              </Button>
            </div>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}