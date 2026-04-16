"use client";

import { createInability } from "@/app/actions/inability-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSessionSnapshot } from "@/hooks/useSessionStore";

type TInputs = {
  idEmployee: number | null;
  disabilityCategory: string;
  folio: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

const DEFAULT_VALUES: TInputs = {
  idEmployee: null,
  disabilityCategory: "",
  folio: "",
  typeOfDisability: "inicial",
  dateInit: "",
  dateEnd: "",
  firstDoc: null,
};

export default function CreateInabilityComponent({
  employees = [],
}: {
  employees?: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });

  const session = useSessionSnapshot();
  const sessionEmployeeId = Number(session?.uid?.idEmployee);

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onChangeDateInit = watch("dateInit");

  useEffect(() => {
    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee:
        session?.uid?.role === "EMPLOYEE" ? sessionEmployeeId || null : null,
    };

    reset(values);
  }, [reset, session?.uid?.role, sessionEmployeeId]);

  useEffect(() => {
    if (onChangeDateInit) {
      setValue("dateEnd", onChangeDateInit);
    }
  }, [onChangeDateInit, setValue]);

  const handleClean = () => {
    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee:
        session?.uid?.role === "EMPLOYEE" ? sessionEmployeeId || null : null,
    };

    reset(values);
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar esta incapacidad?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando incapacidad...");

        const res = await createInability(data);

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/app/inability?view_type=list&id=null");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando incapacidad..."} />
      </ConditionalRender>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting || loading}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Crear incapacidad</h1>

            <div className="d-flex gap-2">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting || loading || !isDirty}
                onClick={handleClean}
              >
                Limpiar
              </Button>
            </div>
          </div>

          <FieldGroup>
            <RelationField
              callBackMode="id"
              control={control}
              label="Empleado"
              options={employees.map((em) => ({
                id: Number(em.id),
                displayName: `${em.lastName} ${em.name}`.toUpperCase(),
                name: `${em.lastName} ${em.name}`.toUpperCase(),
              }))}
              register={register("idEmployee", { required: true })}
              readonly={session?.uid?.role === "EMPLOYEE"}
            />

            <FieldGroup.Stack>
              <FieldSelect
                label="Categoría:"
                options={[
                  { label: "Enfermedad general", value: "enfermedad general" },
                  { label: "Riesgo de trabajo", value: "riesgo de trabajo" },
                  { label: "Maternidad", value: "maternidad" },
                ]}
                register={register("disabilityCategory", { required: true })}
                readonly={session?.uid?.role === "EMPLOYEE"}
                invalid={!!errors.disabilityCategory}
              />

              <FieldSelect
                label="Tipo:"
                options={[
                  { label: "Inicial", value: "inicial" },
                  { label: "Subsecuente", value: "subsecuente" },
                  { label: "Alta", value: "alta" },
                ]}
                register={register("typeOfDisability", { required: true })}
                readonly={session?.uid?.role === "EMPLOYEE"}
                invalid={!!errors.typeOfDisability}
              />
            </FieldGroup.Stack>

            <FieldGroup.Stack>
              <Entry
                label="Fecha inicio:"
                type="date"
                register={register("dateInit", { required: true })}
                invalid={!!errors.dateInit}
                min={formatDate(new Date(), "yyyy-MM-dd")}
                readonly={session?.uid?.role === "EMPLOYEE"}
              />

              <Entry
                label="Fecha fin:"
                type="date"
                min={onChangeDateInit}
                register={register("dateEnd", { required: true })}
                invalid={!!errors.dateEnd}
                readonly={session?.uid?.role === "EMPLOYEE"}
              />
            </FieldGroup.Stack>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">CITT:</Form.Label>
              <Form.Control
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.webp"
                {...register("firstDoc", { required: true })}
                isInvalid={!!errors.firstDoc}
              />
              <Form.Control.Feedback type="invalid">
                Este campo es requerido
              </Form.Control.Feedback>

              <Entry
                register={register("folio", { required: true })}
                label="Folio CITT:"
                className="text-uppercase"
                invalid={!!errors.folio}
              />
            </Form.Group>
          </FieldGroup>
        </fieldset>
      </Form>
    </>
  );
}