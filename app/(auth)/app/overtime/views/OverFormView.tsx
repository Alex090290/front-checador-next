"use client";

import { createOvertime } from "@/app/actions/overtime-actions";
import { Entry, RelationField } from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { Employee, IOvertime } from "@/lib/definitions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  idEmployee: number | null;
  idLeader: number | null;
  idPersonDoh: number | null;
  motive: string;
  hourInit: string;
  hourEnd: string;
};

function OverFormView({
  id,
  overtime,
  employees,
}: {
  id: string;
  overtime: IOvertime | null;
  employees: Employee[];
}) {
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<TInputs>();

  const { data: session } = useSession();
  const sessionEmployeeId = Number(session?.user?.idEmployee);

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const res = await createOvertime({ data });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.push("/app/overtime?view_type=list&id=null");
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!overtime) {
      const values: TInputs = {
        idEmployee:
          session?.user?.role === "EMPLOYEE" ? sessionEmployeeId : null,
        idLeader: null,
        idPersonDoh: null,
        motive: "",
        hourInit: "",
        hourEnd: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        idEmployee: overtime.employee.id,
        idLeader: overtime.leader.id,
        idPersonDoh: overtime.personDoh.id,
        motive: overtime.motive,
        hourInit: overtime.informationDate.hourInit,
        hourEnd: overtime.informationDate.hourEnd,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, overtime, session, sessionEmployeeId]);

  return (
    <FormView
      id={Number(id)}
      isDirty={isDirty}
      disabled={isSubmitting}
      reverse={handleReverse}
      name={overtime?.motive ?? ""}
      onSubmit={handleSubmit(onSubmit)}
      cleanUrl="/app/overtime?view_type=form&id=null"
    >
      <FieldGroup>
        <RelationField
          callBackMode="id"
          control={control}
          label="Empleado"
          options={employees.map((e) => ({
            id: Number(e.id),
            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
            name: `${e.lastName} ${e.name}`.toUpperCase(),
          }))}
          register={register("idEmployee", { required: true })}
          readonly={id !== "null" || session?.user?.role === "EMPLOYEE"}
        />
        <RelationField
          callBackMode="id"
          control={control}
          label="Leader"
          options={employees.map((e) => ({
            id: Number(e.id),
            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
            name: `${e.lastName} ${e.name}`.toUpperCase(),
          }))}
          register={register("idLeader", { required: true })}
          readonly={id !== "null"}
        />
        <RelationField
          callBackMode="id"
          control={control}
          label="D.O.H."
          options={employees.map((e) => ({
            id: Number(e.id),
            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
            name: `${e.lastName} ${e.name}`.toUpperCase(),
          }))}
          register={register("idPersonDoh", { required: true })}
          readonly={id !== "null"}
        />
        <Entry
          label="Motivo"
          register={register("motive", { required: true })}
          readonly={id !== "null"}
        />
        <FieldGroup.Stack>
          <Entry
            label="Hora Inicio"
            register={register("hourInit", { required: true })}
            className="text-center"
            readonly={id !== "null"}
          />
          <Entry
            label="Hora Fin"
            register={register("hourEnd", { required: true })}
            className="text-center"
            readonly={id !== "null"}
          />
        </FieldGroup.Stack>
      </FieldGroup>
    </FormView>
  );
}

export default OverFormView;
