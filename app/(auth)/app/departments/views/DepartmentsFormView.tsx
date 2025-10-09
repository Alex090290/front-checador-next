"use client";

import { Entry, FieldSelect, RelationField } from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Department, User } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";

function DepartmentsFormView({
  department,
  id,
  usersRelation,
}: {
  department: Department | null;
  id: number;
  usersRelation: User[];
}) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Department>();

  const { modalError } = useModals();

  const originalValuesRef = useRef<Department | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<Department> = async (data) => {
    if (isNaN(id)) {
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!department) {
      const values: Department = {
        nameDepartment: "",
        description: "",
        idLeader: null,
        positions: [],
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: Department = {
        nameDepartment: department.nameDepartment,
        description: department.description,
        idLeader: department.idLeader,
        positions: department.positions,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [department, reset]);

  return (
    <FormView
      disabled={isSubmitting}
      reverse={handleReverse}
      cleanUrl="/app/departments?view_type=form&id=null"
      name={department?.nameDepartment || null}
      id={id}
      isDirty={isDirty}
      onSubmit={handleSubmit(onSubmit)}
      title="Departamentos"
    >
      <FieldGroup>
        <Entry
          register={register("nameDepartment", {
            required: "Este campo es requerido",
          })}
          label="Nombre:"
          invalid={!!errors.nameDepartment}
          feedBack={errors.nameDepartment?.message}
        />
        <Entry register={register("description")} label="Descripción:" />
      </FieldGroup>
      <FieldGroup>
        <RelationField
          register={register("idLeader")}
          label="Líder:"
          control={control}
          callBackMode="id"
          options={usersRelation
            .filter((user) => user.role === "LEADER")
            .map((user) => ({
              id: user.id,
              displayName: user.name,
              name: user.name,
            }))}
        />
      </FieldGroup>
    </FormView>
  );
}

export default DepartmentsFormView;
