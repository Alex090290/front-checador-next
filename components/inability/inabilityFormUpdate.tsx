"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import { FieldGroup, FieldGroupFluid } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Employee,
  IInability,
  ModalBasicProps,
} from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSessionSnapshot } from "@/hooks/useSessionStore";

export type TInputsInability = {
  idEmployee: number | null;
  disabilityCategory: string;
  folio: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

type ModalAction = {
  sendData: (
    data: TInputsInability
  ) => Promise<ActionResponse<boolean | null>>;
  inhability?: IInability | null;
  employees?: Employee[];
};

function getDefaultValues(
  inhability?: IInability | null,
  sessionRole?: string,
  sessionEmployeeId?: number
): TInputsInability {
  if (!inhability) {
    return {
      idEmployee: sessionRole === "EMPLOYEE" ? sessionEmployeeId || null : null,
      disabilityCategory: "",
      typeOfDisability: "inicial",
      dateInit: "",
      dateEnd: "",
      firstDoc: null,
      folio: "",
    };
  }

  const firstDocument = inhability.documentsInability?.[0];

  return {
    idEmployee: inhability.idEmployee,
    disabilityCategory: inhability.disabilityCategory,
    typeOfDisability: inhability.typeOfDisability,
    firstDoc: null,
    folio: inhability.folio || firstDocument?.folio || "",
    dateInit: firstDocument?.dateInit
      ? formatDate(firstDocument.dateInit, "yyyy-MM-dd")
      : "",
    dateEnd: firstDocument?.dateEnd
      ? formatDate(firstDocument.dateEnd, "yyyy-MM-dd")
      : "",
  };
}

export default function FormUpdateInability({
  onHide,
  sendData,
  inhability,
  employees = [],
}: ModalBasicProps & ModalAction) {
  const session = useSessionSnapshot();
  const sessionEmployeeId = Number(session?.uid?.idEmployee);

  const {
    reset,
    register,
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting, errors },
  } = useForm<TInputsInability>({
    defaultValues: getDefaultValues(
      inhability,
      session?.uid?.role,
      sessionEmployeeId
    ),
  });

  const onChangeDateInit = watch("dateInit");

  const [loading, setLoading] = useState(false);

  const { modalError, modalConfirm } = useModals();

  useEffect(() => {
    setLoading(true);

    try {
      reset(
        getDefaultValues(inhability, session?.uid?.role, sessionEmployeeId)
      );
    } catch {
      modalError("No se pudo cargar la información de la incapacidad");
    } finally {
      setLoading(false);
    }
  }, [inhability, reset, modalError, session?.uid?.role, sessionEmployeeId]);

  const onSubmit: SubmitHandler<TInputsInability> = async (data) => {
    modalConfirm("¿Deseas guardar los cambios de esta incapacidad?", async () => {
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
          <FieldGroupFluid>
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
                readonly={session?.uid?.role === "EMPLOYEE"}
                invalid={!!errors.dateInit}
              />
              <Entry
                label="Fecha fin:"
                type="date"
                min={onChangeDateInit}
                register={register("dateEnd", { required: true })}
                readonly={session?.uid?.role === "EMPLOYEE"}
                invalid={!!errors.dateEnd}
              />
            </FieldGroup.Stack>

            <Entry
              register={register("folio")}
              label="Folio CITT:"
              className="text-uppercase"
            />

            <FieldGroup.Stack>
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
            </FieldGroup.Stack>
          </FieldGroupFluid>
        </fieldset>
      </Form>
    </>
  );
}