"use client";

import { createBranch } from "@/app/actions/branches-actionst";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Branch } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const DEFAULT_VALUES: Branch = {
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

export default function CreateBranchComponent() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Branch>({
    defaultValues: DEFAULT_VALUES,
  });

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onSubmit: SubmitHandler<Branch> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar esta sucursal?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando sucursal...");

        const res = await createBranch({ branch: data });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.back();
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando sucursal..."} />
      </ConditionalRender>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting || loading}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="mb-0">Crear sucursal</h1>

            <div className="d-flex gap-2">
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting || loading || !isDirty}
                onClick={() => reset(DEFAULT_VALUES)}
              >
                Limpiar
              </Button>
            </div>
          </div>

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

              <Entry
                register={register("zipCode", {
                  valueAsNumber: true,
                })}
                label="C.P."
                invalid={!!errors.zipCode}
                feedBack={errors.zipCode?.message}
              />
            </FieldGroup.Stack>
          </FieldGroup>

          <FieldGroup>
            <FieldGroup.Stack>
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
            </FieldGroup.Stack>

            <FieldGroup.Stack>
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
            </FieldGroup.Stack>

            <FieldGroup.Stack>
              <Entry
                register={register("lat", {
                  valueAsNumber: true,
                })}
                label="Latitud:"
                invalid={!!errors.lat}
                feedBack={errors.lat?.message}
              />

              <Entry
                register={register("lng", {
                  valueAsNumber: true,
                })}
                label="Longitud:"
                invalid={!!errors.lng}
                feedBack={errors.lng?.message}
              />
            </FieldGroup.Stack>
          </FieldGroup>
        </fieldset>
      </Form>
    </>
  );
}