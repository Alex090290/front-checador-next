"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, RelationField } from "@/components/fields";
import { FieldGroupFluid } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Department,
  Employee,
  ModalBasicProps,
} from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";

type ModalAction = {
  sendData: (data: Department) => Promise<ActionResponse<boolean | null>>;
  department?: Department | null;
  employees?: Employee[];
};

function getDefaultValues(department?: Department | null): Department {
  return {
    nameDepartment: department?.nameDepartment || "",
    description: department?.description || "",
    idLeader: department?.idLeader || null,
    positions: department?.positions || [],
  };
}

export default function FormUpdateDepartment({
  onHide,
  sendData,
  department,
  employees = [],
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Department>({
    defaultValues: getDefaultValues(department),
  });

  const [loading, setLoading] = useState(false);
  const { modalError, modalConfirm } = useModals();

  useEffect(() => {
    setLoading(true);
    try {
      reset(getDefaultValues(department));
    } catch {
      modalError("No se pudo cargar la información del departamento");
    } finally {
      setLoading(false);
    }
  }, [department, reset, modalError]);

  const onSubmit: SubmitHandler<Department> = async (data) => {
    modalConfirm("¿Deseas guardar los cambios de este departamento?", async () => {
      const res = await sendData(data);

      if (!res.success) {
        modalError(res.message);
        return;
      }

      onHide();
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message="Cargando..." />
      </ConditionalRender>

      <ConditionalRender cond={isSubmitting}>
        <Loading message="Guardando..." />
      </ConditionalRender>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={loading || isSubmitting}>
          <div className="p-2">
            <FieldGroupFluid>
              <div className="mb-3">
                <Entry
                  register={register("nameDepartment", {
                    required: "Este campo es requerido",
                  })}
                  label="Nombre:"
                  invalid={!!errors.nameDepartment}
                  feedBack={errors.nameDepartment?.message}
                  className="text-uppercase"
                />
              </div>

              <div className="mb-3">
                <Entry
                  register={register("description")}
                  label="Descripción:"
                  invalid={!!errors.description}
                  feedBack={errors.description?.message}
                />
              </div>

              <div className="mb-4">
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
              </div>

              <div className="d-flex justify-content-between align-items-center pt-2">
                <Button type="submit" disabled={loading || isSubmitting}>
                  Guardar
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={onHide}
                  disabled={loading || isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </FieldGroupFluid>
          </div>
        </fieldset>
      </Form>
    </>
  );
}