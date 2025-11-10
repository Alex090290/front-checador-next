"use client";

import { createPermission } from "@/app/actions/permissions-actions";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, IPermissionRequest } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  motive: string;
  type: string;
  forHours: boolean;
  forDays: boolean;
  incidence: string;
  dateInit: string;
  dateEnd: string;
  hourInit: string;
  hourEnd: string;
  idEmployee: number | null;
  idLeader: number | null;
  idPersonDoh: number | null;
  modeSelect: string;
  signature: string;
};

function PermissionsFormView({
  id,
  employees,
  permission,
}: {
  id: string;
  permission: IPermissionRequest | null;
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TInputs>();

  const { data: session } = useSession();

  const [watchType, modeSelect, dateInit] = watch([
    "type",
    "modeSelect",
    "dateInit",
  ]);

  const { modalError } = useModals();

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const newData = {
        ...data,
        forDays: data.modeSelect === "forDays" ? true : false,
        forHours: data.modeSelect === "forHours" ? true : false,
      };
      const res = await createPermission({ data: newData });
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
      router.back();
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (dateInit !== "") {
      setValue("dateEnd", dateInit);
    }
  }, [dateInit, setValue]);

  useEffect(() => {
    if (!permission) {
      const values: TInputs = {
        dateEnd: "",
        dateInit: "",
        forDays: false,
        forHours: false,
        hourEnd: "",
        hourInit: "",
        incidence: "PERMISOS",
        motive: "",
        type: "",
        idEmployee: Number(session?.user?.id),
        idLeader:
          employees.find((e) => e.id === Number(session?.user?.id))?.leader
            ?.id || null,
        idPersonDoh: null,
        modeSelect: "",
        signature: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        dateEnd: formatDate(permission.informationDate.dateEnd, "yyyy-MM-dd"),
        dateInit: formatDate(permission.informationDate.dateInit, "yyyy-MM-dd"),
        forDays: permission.forDays,
        forHours: permission.forHours,
        hourEnd: permission.informationDate.hourEnd,
        hourInit: permission.informationDate.hourInit,
        incidence: "PERMISOS",
        motive: permission.motive,
        type: permission.type,
        idEmployee: permission.employee.id || null,
        idLeader: permission.leader.id || null,
        idPersonDoh: permission.personDoh.id || null,
        modeSelect: permission.forDays ? "forDays" : "forHours",
        signature: "",
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, permission]);

  return (
    <FormView
      disabled={isSubmitting || id !== "null"}
      id={Number(id)}
      isDirty={isDirty}
      name={permission?.motive || null}
      reverse={handleReverse}
      onSubmit={handleSubmit(onSubmit)}
      cleanUrl="/app/permissions?view_type=form&id=null"
    >
      <fieldset disabled={id !== "null"}>
        <FieldGroup>
          <RelationField
            register={register("idEmployee")}
            options={employees?.map((e) => ({
              id: e.id ?? 0,
              displayName: e.name?.toUpperCase() || "",
              name: e.name?.toUpperCase(),
            }))}
            label="Empleado:"
            callBackMode="id"
            control={control}
            readonly={session?.user?.role === "EMPLOYEE"}
          />
          <FieldGroup.Stack>
            <RelationField
              register={register("idLeader")}
              options={employees?.map((e) => ({
                id: e.id ?? 0,
                displayName: e.name?.toUpperCase() || "",
                name: e.name?.toUpperCase(),
              }))}
              label="Líder:"
              callBackMode="id"
              control={control}
              readonly={session?.user?.role === "EMPLOYEE"}
            />
            <RelationField
              register={register("idPersonDoh")}
              options={employees?.map((e) => ({
                id: e.id ?? 0,
                displayName: e.name?.toUpperCase() || "",
                name: e.name?.toUpperCase(),
              }))}
              label="D.O.H."
              callBackMode="id"
              control={control}
            />
          </FieldGroup.Stack>
          <Entry
            label="Motivo:"
            register={register("motive", { required: true })}
            invalid={!!errors.motive}
          />
          <FieldSelect
            options={[
              {
                label: "TRÁMITE PERSONAL",
                value: "PERMISO POR TRÁMITE PERSONAL",
              },
              {
                label: "SITUACIÓN VIAL",
                value: "PERMISO POER SITUACIÓN VIAL",
              },
              {
                label: "POR SALUD (PROPIA O DE FAMILIAR)",
                value: "PERMISO POR SALUD",
              },
              {
                label: "ASUNTOS ESCOLARES",
                value: "PERMISO POR ASUSNTOS ESCOLARES",
              },
              {
                label: "PERMISO POR PATERNIDAD",
                value: "PERMISO PATERNIDAD",
              },
              {
                label: "OTROS",
                value: "PERMISO OTROS",
              },
            ]}
            register={register("type", { required: true })}
            label="Tipo:"
            invalid={!!errors.type}
          />
          <FieldGroup.Stack>
            <Form.Check
              {...register("modeSelect")}
              value="forHours"
              type="radio"
              label="Horas"
              id="forHours"
            />
            <Form.Check
              {...register("modeSelect")}
              value="forDays"
              type="radio"
              label="Días"
              id="forDays"
            />
          </FieldGroup.Stack>
          <FieldGroup.Stack>
            <Entry
              label="Fecha inicio:"
              type="date"
              register={register("dateInit")}
              min={formatDate(new Date(), "yyyy-MM-dd")}
            />
            <Entry
              label="Fecha final:"
              type="date"
              register={register("dateEnd")}
              invalid={!!errors.dateEnd}
              readonly={modeSelect === "forHours"}
              min={dateInit}
            />
          </FieldGroup.Stack>
          <FieldGroup.Stack>
            <Entry
              register={register("hourInit")}
              label="Hora inicial:"
              className="text-center"
              type="time"
            />
            <Entry
              label="Hora final:"
              register={register("hourEnd")}
              className="text-center"
              type="time"
            />
          </FieldGroup.Stack>
          {id === "null" && (
            <SignatureInput
              name="signature"
              register={register}
              control={control}
            />
          )}
        </FieldGroup>
      </fieldset>
    </FormView>
  );
}

export default PermissionsFormView;
