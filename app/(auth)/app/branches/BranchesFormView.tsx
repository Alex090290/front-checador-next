"use client";

import { createBranch } from "@/app/actions/branches-actionst";
import { Entry } from "@/components/fields";
import FormView, { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Branch } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

function BranchesFormView({
  id,
  branch,
}: {
  id: number;
  branch: Branch | null;
}) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Branch>();

  const { modalError } = useModals();

  const originalValuesRef = useRef<Branch | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<Branch> = async (data) => {
    if (isNaN(id)) {
      const res = await createBranch({ branch: data });
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
    if (!branch) {
      const values: Branch = {
        name: "",
        idManager: null,
        street: "",
        numberIn: "",
        numberOut: "",
        state: "",
        country: "México",
        neighborhood: "",
        municipality: "",
        zipCode: 0,
        lng: 0,
        lat: 0,
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: Branch = {
        name: branch.name,
        idManager: branch.idManager,
        street: branch.address?.street,
        numberIn: branch.address?.numberIn,
        numberOut: branch.address?.numberOut,
        state: branch.address?.state,
        country: branch.address?.country || "México",
        neighborhood: branch.address?.neighborhood,
        municipality: branch.address?.municipality,
        zipCode: branch.address?.zipCode,
        lng: branch.address?.coordinates?.lng,
        lat: branch.address?.coordinates?.lat,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [branch, reset]);

  return (
    <FormView
      disabled={isSubmitting}
      cleanUrl="/app/branches?view_type=form&id=null"
      isDirty={isDirty}
      id={id}
      name={branch?.name || null}
      onSubmit={handleSubmit(onSubmit)}
      reverse={handleReverse}
      title="Sucursal"
    >
      <FieldGroup>
        <Entry
          register={register("name", { required: "Este campo es requerido" })}
          label="Nombre:"
          invalid={!!errors.name}
          feedBack={errors.name?.message}
        />
        <Entry
          register={register("street", { required: "Este campo es requerido" })}
          label="Calle:"
          invalid={!!errors.street}
          feedBack={errors.street?.message}
        />
        <FieldGroup.Stack>
          <Entry
            register={register("numberOut", {
              required: "Número exterior es requerido",
            })}
            label="Ext:"
            invalid={!!errors.numberOut}
            feedBack={errors.numberOut?.message}
          />
          <Entry
            register={register("numberIn")}
            label="Int:"
            invalid={!!errors.numberIn}
            feedBack={errors.numberIn?.message}
          />
          <Entry register={register("zipCode")} label="C.P." />
        </FieldGroup.Stack>
      </FieldGroup>
      <FieldGroup>
        <FieldGroup.Stack>
          <Entry
            register={register("neighborhood", {
              required: "Colonia es requerido",
            })}
            label="Colonia:"
            invalid={!!errors.neighborhood}
            feedBack={errors.neighborhood?.message}
          />
          <Entry
            register={register("municipality", {
              required: "Municicpio es requerido",
            })}
            label="Municipio:"
            invalid={!!errors.municipality}
            feedBack={errors.municipality?.message}
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry
            register={register("state", {
              required: "Estado es requerido",
            })}
            label="Estado"
            invalid={!!errors.state}
            feedBack={errors.state?.message}
          />
          <Entry
            register={register("country", {
              required: "País es requerido",
            })}
            label="País:"
            invalid={!!errors.country}
            feedBack={errors.country?.message}
          />
        </FieldGroup.Stack>
        <FieldGroup.Stack>
          <Entry register={register("lat")} label="Latitud:" />
          <Entry register={register("lng")} label="Longitud:" />
        </FieldGroup.Stack>
      </FieldGroup>
    </FormView>
  );
}

export default BranchesFormView;
