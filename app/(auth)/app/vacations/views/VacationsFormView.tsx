"use client";

import { Entry, RelationField } from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, Vacations } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { id } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = Pick<
  Vacations,
  | "idEmployee"
  | "idLeader"
  | "idPersonDoh"
  | "idPeriod"
  | "periodDescription"
  | "dateInit"
  | "dateEnd"
> & {
  incidence: string;
};

function VacationsFormView({
  vacation,
  id,
  employees,
}: {
  vacation: Vacations | null;
  id: string;
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TInputs>();

  const { data: session } = useSession();

  const { modalError } = useModals();

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {};

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!vacation) {
      const values: TInputs = {
        idEmployee: null,
        idLeader: null,
        idPersonDoh: null,
        idPeriod: null,
        dateEnd: "",
        dateInit: "",
        incidence: "VACACIONES",
        periodDescription: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        idEmployee: vacation.idEmployee,
        idLeader: vacation.idLeader,
        idPersonDoh: vacation.idPersonDoh,
        idPeriod: vacation.idPeriod,
        dateEnd: formatDate(vacation.dateEnd, "yyyy-MM-dd") ?? "",
        dateInit: formatDate(vacation.dateInit, "yyyy-MM-dd") ?? "",
        incidence: vacation.holidayName,
        periodDescription: vacation.period.periodDescription,
      };
      console.log(values);
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, vacation]);

  return (
    <FormView
      cleanUrl="/app/vacations?view_type=form&id=null"
      disabled={isSubmitting}
      id={Number(id)}
      isDirty={isDirty}
      name={getValues().incidence}
      onSubmit={handleSubmit(onSubmit)}
      reverse={handleReverse}
    >
      <FieldGroup>
        <RelationField
          register={register("idEmployee")}
          options={employees.map((e) => ({
            id: Number(e.id),
            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
            name: `${e.lastName} ${e.name}`.toUpperCase(),
          }))}
          label="Empleado"
          callBackMode="id"
          control={control}
        />
        <FieldGroup.Stack>
          <RelationField
            register={register("idLeader")}
            options={employees.map((e) => ({
              id: Number(e.id),
              displayName: `${e.lastName} ${e.name}`.toUpperCase(),
              name: `${e.lastName} ${e.name}`.toUpperCase(),
            }))}
            label="Líder"
            callBackMode="id"
            control={control}
          />
          <RelationField
            register={register("idPersonDoh")}
            options={employees.map((e) => ({
              id: Number(e.id),
              displayName: `${e.lastName} ${e.name}`.toUpperCase(),
              name: `${e.lastName} ${e.name}`.toUpperCase(),
            }))}
            label="D.O.H."
            callBackMode="id"
            control={control}
          />
        </FieldGroup.Stack>
        <Entry label="Descripción" register={register("periodDescription")} />
        <FieldGroup.Stack>
          <Entry label="Inicio" type="date" register={register("dateInit")} />
          <Entry label="Final" type="date" register={register("dateEnd")} />
        </FieldGroup.Stack>
      </FieldGroup>
    </FormView>
  );
}

export default VacationsFormView;
