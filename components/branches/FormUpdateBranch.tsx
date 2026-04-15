"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import { FieldGroup, FieldGroupFluid } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Branch,
  ModalBasicProps,
} from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";

type ModalAction = {
  sendData: (data: Branch) => Promise<ActionResponse<boolean | null>>;
  branch?: Branch | null;
};

function getDefaultValues(branch?: Branch | null): Branch {
  return {
    name: branch?.name || "",
    idManager: branch?.idManager || null,
    street: branch?.address?.street || "",
    numberIn: branch?.address?.numberIn || "",
    numberOut: branch?.address?.numberOut || "",
    state: branch?.address?.state || "",
    country: branch?.address?.country || "México",
    neighborhood: branch?.address?.neighborhood || "",
    municipality: branch?.address?.municipality || "",
    zipCode: branch?.address?.zipCode || 0,
    lng: branch?.address?.coordinates?.lng || 0,
    lat: branch?.address?.coordinates?.lat || 0,
  };
}

export default function FormUpdateBranch({
  onHide,
  sendData,
  branch,
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Branch>({
    defaultValues: getDefaultValues(branch),
  });

  const [loading, setLoading] = useState(false);
  const { modalError } = useModals();

  useEffect(() => {
    setLoading(true);

    try {
      reset(getDefaultValues(branch));
    } catch {
      modalError("No se pudo cargar la información de la sucursal");
    } finally {
      setLoading(false);
    }
  }, [branch, reset, modalError]);

  const onSubmit: SubmitHandler<Branch> = async (data) => {
    const res = await sendData(data);

    if (!res.success) {
      modalError(res.message);
      return;
    }

    onHide();
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
            <Entry
              register={register("name", {
                required: "Este campo es requerido",
              })}
              label="Nombre:"
              invalid={!!errors.name}
              feedBack={errors.name?.message}
            />

            <Entry
              register={register("street", {
                required: "Este campo es requerido",
              })}
              label="Calle:"
              invalid={!!errors.street}
              feedBack={errors.street?.message}
            />

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

            <Entry
              register={register("zipCode")}
              label="C.P.:"
              invalid={!!errors.zipCode}
              feedBack={errors.zipCode?.message}
            />

            <Entry
              register={register("neighborhood", {
                required: "Colonia es requerida",
              })}
              label="Colonia:"
              invalid={!!errors.neighborhood}
              feedBack={errors.neighborhood?.message}
            />

            <Entry
              register={register("municipality", {
                required: "Municipio es requerido",
              })}
              label="Municipio:"
              invalid={!!errors.municipality}
              feedBack={errors.municipality?.message}
            />

            <Entry
              register={register("state", {
                required: "Estado es requerido",
              })}
              label="Estado:"
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

            <Entry
              register={register("lat")}
              label="Latitud:"
              invalid={!!errors.lat}
              feedBack={errors.lat?.message}
            />

            <Entry
              register={register("lng")}
              label="Longitud:"
              invalid={!!errors.lng}
              feedBack={errors.lng?.message}
            />

            <FieldGroup.Stack>
              <Button type="submit">
                Guardar
              </Button>

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