"use client";

import { createEmployee } from "@/app/actions/employee-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Branch, Department, Employee, Position } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  name: string;
  lastName: string;
  phonePersonal: string | null;
  emailPersonal: string | null;
  idCheck: number | null;
  passwordCheck: string | null;
  entryOffice: string | null;
  entrySaturdayOffice: string | null;
  exitOffice: string | null;
  exitSaturdayOffice: string | null;
  entryLunch: string | null;
  exitLunch: string | null;
  idDepartment: number | null;
  idPosition: number | null;
  branch: number | null;
  gender: "HOMBRE" | "MUJER";
};

function EmployeeFormView({
  employee,
  id,
  departments,
  branches,
}: {
  employee: Employee | null;
  id: number;
  departments: Department[];
  branches: Branch[];
}) {
  const {
    watch,
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputs>();

  const [deps] = watch(["idDepartment"]);

  const { modalError } = useModals();

  const originalValuesRef = useRef<TInputs | null>(null);
  const router = useRouter();

  const [puestos, setPuestos] = useState<Position[]>([]);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (isNaN(id)) {
      const res = await createEmployee({ data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

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
    if (!employee) {
      const values: TInputs = {
        name: "",
        lastName: "",
        emailPersonal: null,
        phonePersonal: null,
        idCheck: null,
        passwordCheck: null,
        entryOffice: null,
        entrySaturdayOffice: "08:30",
        exitSaturdayOffice: "14:00",
        exitLunch: null,
        entryLunch: null,
        exitOffice: null,
        idDepartment: null,
        branch: null,
        idPosition: null,
        gender: "HOMBRE",
      };
      setPuestos([]);
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        name: employee.name || "",
        lastName: employee.lastName || "",
        emailPersonal: employee.emailPersonal,
        phonePersonal: employee.phonePersonal?.internationalNumber || null,
        idCheck: employee.idCheck || null,
        passwordCheck: employee.passwordCheck,
        entryOffice: employee.scheduleOffice?.entry || null,
        entrySaturdayOffice:
          employee.scheduleSaturday?.entrySaturdayOffice || null,
        exitOffice: employee.scheduleOffice?.exit || null,
        exitSaturdayOffice: employee.exitSaturdayOffice || null,
        exitLunch: employee.scheduleLunch?.entry || null,
        entryLunch: employee.scheduleLunch?.exit || null,
        idDepartment: employee.department?.id || 0,
        branch: employee.branch?.id || null,
        idPosition: employee.position?.id || null,
        gender: "HOMBRE",
      };
      reset(values);
      originalValuesRef.current = values;
      setPuestos(employee.department?.positions || []);
    }
  }, [employee, reset]);

  useEffect(() => {
    if (deps) {
      const positions: Position[] =
        departments.find((dep) => dep.id === deps)?.positions || [];
      setPuestos(positions);
    } else {
      setPuestos([]);
    }
  }, [deps, watch]);

  return (
    <FormView
      title="Empleado"
      reverse={handleReverse}
      onSubmit={handleSubmit(onSubmit)}
      name={employee?.name || null}
      isDirty={isDirty}
      id={id}
      disabled={isSubmitting}
      cleanUrl="/app/employee?view_type=form&id=null"
    >
      <FieldGroup>
        <Entry
          register={register("name", { required: "Este campo es requerido" })}
          invalid={!!errors.name}
          feedBack={errors.name?.message}
          label="Nombre:"
        />
        <Entry
          register={register("lastName", {
            required: "Este campo es requerido",
          })}
          invalid={!!errors.lastName}
          feedBack={errors.lastName?.message}
          label="Apellidos:"
        />
        <Entry register={register("emailPersonal")} label="Correo:" />
        <Entry
          register={register("phonePersonal", {
            required: "Este campo es requerido",
          })}
          invalid={!!errors.phonePersonal}
          feedBack={errors.phonePersonal?.message}
          label="Teléfono:"
        />
        <FieldSelect
          options={[
            { value: "MUJER", label: "MUJER" },
            { value: "HOMBRE", label: "HOMBRE" },
          ]}
          label="Género:"
          register={register("gender", { required: "Este campo es requerido" })}
          invalid={!!errors.gender}
          feedBack={errors.gender?.message}
        />
      </FieldGroup>
      <FieldGroup>
        <FieldGroup.Stack>
          <Entry
            register={register("idCheck", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.idCheck}
            feedBack={errors.idCheck?.message}
            label="Código:"
          />
          <Entry
            register={register("passwordCheck", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.passwordCheck}
            feedBack={errors.passwordCheck?.message}
            label="Clave:"
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry
            register={register("entryOffice", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.entryOffice}
            feedBack={errors.entryOffice?.message}
            label="Entrada:"
          />
          <Entry
            register={register("exitOffice", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.exitOffice}
            feedBack={errors.exitOffice?.message}
            label="Salida:"
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry
            register={register("entryLunch", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.entryLunch}
            feedBack={errors.entryLunch?.message}
            label="Entrada comedor:"
          />
          <Entry
            register={register("exitLunch", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.exitLunch}
            feedBack={errors.exitLunch?.message}
            label="Salida comedor:"
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry
            register={register("entrySaturdayOffice", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.entryLunch}
            feedBack={errors.entryLunch?.message}
            label="Entrada sabatina:"
          />
          <Entry
            register={register("exitSaturdayOffice", {
              required: "Este campo es requerido",
            })}
            invalid={!!errors.exitLunch}
            feedBack={errors.exitLunch?.message}
            label="Salida sabatina:"
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <RelationField
            register={register("idDepartment", {
              required: "Este campo es requerido",
            })}
            control={control}
            options={departments.map((dep) => ({
              id: dep.id ?? 0,
              displayName: dep.nameDepartment,
            }))}
            callBackMode="id"
            label="Departamento:"
          />
          <RelationField
            register={register("idPosition", {
              required: "Este campo es requerido",
            })}
            control={control}
            options={puestos.map((pos) => ({
              id: pos.id ?? 0,
              displayName: pos.namePosition,
              name: pos.namePosition,
            }))}
            callBackMode="id"
            label="Puesto:"
          />
        </FieldGroup.Stack>
        <RelationField
          register={register("branch", { required: true })}
          options={branches.map((br) => ({
            id: br.id || 0,
            displayName: br.name,
            name: br.name,
          }))}
          control={control}
          callBackMode="id"
          label="Sucursal:"
        />
      </FieldGroup>
    </FormView>
  );
}
1;

export default EmployeeFormView;
