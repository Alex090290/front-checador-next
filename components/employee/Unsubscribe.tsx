"use client";

import { unsubscribeUser } from "@/app/actions/user-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  dischargeReason: string;
  typeOfDischarge: string;
  dischargeDate: string;
};

export default function UnsubscribeEmployeeComponent({
  employeeId,
  employeeName,
  onClose,
  onSuccess,
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

  const { modalError } = useModals();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    try {
      setLoading(true);
      setMessageLoading("Dando de baja al empleado...");

      const res = await unsubscribeUser({
        id: employeeId,
        dischargeReason: data.dischargeReason,
        typeOfDischarge: data.typeOfDischarge,
        dischargeDate: data.dischargeDate,
      });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message || "Empleado dado de baja correctamente");
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
        <h4 className="mb-1">Dar de baja empleado</h4>
        <div className="text-secondary">
          {employeeName
            ? `Empleado: ${employeeName}`
            : `Empleado #${employeeId}`}
        </div>
      </div>

      <Alert variant="warning">
        Esta acción marcará al empleado como dado de baja. Captura la razón,
        el tipo de baja y la fecha efectiva.
      </Alert>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading || isSubmitting}>
          <div className="d-grid gap-3">
            <FieldSelect
              register={register("typeOfDischarge", {
                required: "El tipo de baja es requerido",
              })}
              label="Tipo de baja:"
              invalid={!!errors.typeOfDischarge}
              feedBack={errors.typeOfDischarge?.message}
              options={[
                { value: "VOLUNTARIA", label: "Voluntaria" },
                { value: "INVOLUNTARIA", label: "Involuntaria" },
                { value: "ABANDONO", label: "Abandono" },
                { value: "TERMINO_DE_CONTRATO", label: "Término de contrato" },
                { value: "OTRA", label: "Otra" },
              ]}
            />

            <Entry
              register={register("dischargeDate", {
                required: "La fecha de baja es requerida",
              })}
              label="Fecha de baja:"
              type="date"
              invalid={!!errors.dischargeDate}
              feedBack={errors.dischargeDate?.message}
            />

            <Entry
              register={register("dischargeReason", {
                required: "La razón de baja es requerida",
              })}
              label="Razón de baja:"
              invalid={!!errors.dischargeReason}
              feedBack={errors.dischargeReason?.message}
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
                variant="danger"
                disabled={loading || isSubmitting}
              >
                Confirmar baja
              </Button>
            </div>
          </div>
        </fieldset>
      </Form>
    </div>
  );
}