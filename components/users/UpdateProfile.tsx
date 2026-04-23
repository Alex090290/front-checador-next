"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect } from "@/components/fields";
import { FieldGroup, FieldGroupFluid } from "@/components/templates/FormView";
import { ImageField } from "@/components/fields/ImageField";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps, User } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { loadAvatar } from "@/app/actions/user-actions";

type TInputsProfile = {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  phone: PhoneNumberFormat | string | null;
  imageUrl?: string | null;
};

type ModalAction = {
  sendData: (
    data: TInputsProfile
  ) => Promise<{ success: boolean; message: string; data: boolean | null }>;
  user?: User | null;
};

function getDefaultValues(user?: User | null): TInputsProfile {
  return {
    name: user?.name || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    gender: (user?.gender as "MASCULINO" | "FEMENINO") || null,
    phone: user?.phone?.internationalNumber || null,
    imageUrl: null,
  };
}

export default function FormUpdateProfile({
  onHide,
  sendData,
  user,
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TInputsProfile>({
    defaultValues: getDefaultValues(user),
  });

  const [loading, setLoading] = useState(false);
  const { modalError } = useModals();

  useEffect(() => {
    setLoading(true);

    try {
      reset(getDefaultValues(user));
    } catch {
      modalError("No se pudo cargar la información del perfil");
    } finally {
      setLoading(false);
    }
  }, [user, reset, modalError]);

  useEffect(() => {
    const run = async () => {
      const res = await loadAvatar();

      if (!res.success) {
        return;
      }

      setValue("imageUrl", res.data, { shouldDirty: false });
    };

    run();
  }, [setValue]);

  const onSubmit: SubmitHandler<TInputsProfile> = async (data) => {
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
                required: "Nombre requerido",
              })}
              label="Nombre:"
              invalid={!!errors.name}
              feedBack={errors.name?.message}
              className="text-uppercase"
            />

            <Entry
              register={register("lastName", {
                required: "Apellidos requeridos",
              })}
              label="Apellidos:"
              invalid={!!errors.lastName}
              feedBack={errors.lastName?.message}
              className="text-uppercase"
            />

            <Entry
              register={register("email", {
                required: "Correo requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
              label="Correo:"
              invalid={!!errors.email}
              feedBack={errors.email?.message}
              type="email"
            />

            <Entry
              register={register("phone", {
                required: "Teléfono requerido",
              })}
              label="Teléfono:"
              invalid={!!errors.phone}
              feedBack={errors.phone?.message as string}
            />

            <FieldSelect
              register={register("gender", {
                required: "Este campo es requerido",
              })}
              options={[
                { value: "MASCULINO", label: "Masculino" },
                { value: "FEMENINO", label: "Femenino" },
              ]}
              label="Género:"
              invalid={!!errors.gender}
              feedBack={errors.gender?.message}
            />

            <div className="text-center">
              <ImageField
                {...register("imageUrl")}
                width={150}
                height={150}
                control={control}
                editable={true}
              />
            </div>

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