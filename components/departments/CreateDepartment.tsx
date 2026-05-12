"use client";

import { createDepartment } from "@/app/actions/departments-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, RelationField } from "@/components/fields";
import { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Department, Employee } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const DEFAULT_VALUES: Department = {
  nameDepartment: "",
  description: "",
  idLeader: null,
  positions: [],
};

export default function CreateDepartmentComponent({
  employees = [],
}: {
  employees?: Employee[];
}) {
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Department>({
    defaultValues: DEFAULT_VALUES,
  });

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onSubmit: SubmitHandler<Department> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar este departamento?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando departamento...");

        const res = await createDepartment({ data });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.back();
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando departamento..."} />
      </ConditionalRender>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting || loading}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Crear departamento</h1>

            <div className="d-flex gap-2">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting || loading || !isDirty}
                onClick={() => reset(DEFAULT_VALUES)}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <FieldGroup>
            <Entry
              register={register("nameDepartment", {
                required: "Este campo es requerido",
              })}
              label="Nombre:"
              invalid={!!errors.nameDepartment}
              feedBack={errors.nameDepartment?.message}
              className="text-uppercase"
            />

            <Entry
              register={register("description")}
              label="Descripción:"
              invalid={!!errors.description}
              feedBack={errors.description?.message}
            />
          </FieldGroup>

          <FieldGroup>
            <RelationField
              register={register("idLeader")}
              label="Líder:"
              control={control}
              callBackMode="id"
              className="text-uppercase"
              options={employees.map((emp) => ({
                id: emp.id ?? 0,
                displayName: `${emp.name} ${emp.lastName}`,
                name: `${emp.name} ${emp.lastName}`,
              }))}
            />
          </FieldGroup>
        </fieldset>
      </Form>
    </>
  );
}