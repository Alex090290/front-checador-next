"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect } from "@/components/fields";
import { ImageField } from "@/components/fields/ImageField";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps, User } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { loadAvatar, updateUser } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputsProfile = {
  name: string;
  lastName: string;
  email: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  phone: PhoneNumberFormat | string | null;
  imageUrl?: string | null;
};

type ModalAction = {
  user?: User | null;
  id: number;
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
  user,
  id
}: ModalBasicProps & ModalAction) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TInputsProfile>({
    defaultValues: getDefaultValues(user),
  });

  const [loading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const { modalConfirm } = useModals();
  const router = useRouter();


  useEffect(() => {
    const run = async () => {
      const res = await loadAvatar();
      if (!res.success) return;
      setValue("imageUrl", res.data, { shouldDirty: false });
    };
    run();
  }, [setValue]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const res = await loadAvatar();
      if (!active || !res.success) return;
      setValue("imageUrl", res.data, { shouldDirty: false });
    };
    run();
    return () => { active = false; };
  }, [setValue]);

  const onSubmit: SubmitHandler<TInputsProfile> = async (data) => {
    if (!user) {
      setFeedbackMsg("No se encontró la información del usuario");
      setFeedback("error");
      return;
    }

    modalConfirm("¿Seguro que quieres guardar el usuario?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Actualizando usuario...");

        const res = await updateUser({
          ...data,
          id: id,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
          idEmployee: user.idEmployee || null,
        });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo actualizar el usuario");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Usuario actualizado correctamente");
        setFeedback("success");
        router.refresh();
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Guardando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onHide();
            router.refresh();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Mi perfil</h4>
            <p className="text-muted mb-0">
              Actualiza tu información personal y foto de perfil.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Editar
          </span>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={loading || isSubmitting}>

            <Card className="border rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-person-circle text-primary" />
                  <h6 className="mb-0 fw-bold">Foto de perfil</h6>
                </div>

                <div className="text-center">
                  <ImageField
                    {...register("imageUrl")}
                    width={150}
                    height={150}
                    control={control}
                    editable={true}
                  />
                </div>
              </Card.Body>
            </Card>

            <Card className="border rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-person text-warning" />
                  <h6 className="mb-0 fw-bold">Datos personales</h6>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Entry
                      register={register("name", { required: "Nombre requerido" })}
                      label="Nombre:"
                      invalid={!!errors.name}
                      feedBack={errors.name?.message}
                      className="text-uppercase border"
                    />
                  </Col>

                  <Col md={6}>
                    <Entry
                      register={register("lastName", { required: "Apellidos requeridos" })}
                      label="Apellidos:"
                      invalid={!!errors.lastName}
                      feedBack={errors.lastName?.message}
                      className="text-uppercase border"
                    />
                  </Col>

                  <Col md={6}>
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
                      className="border text-uppercase"
                    />
                  </Col>

                  <Col md={6}>
                    <Entry
                      register={register("phone", { required: "Teléfono requerido" })}
                      label="Teléfono:"
                      invalid={!!errors.phone}
                      feedBack={errors.phone?.message as string}
                      className="border"
                    />
                  </Col>

                  <Col md={6}>
                    <FieldSelect
                      register={register("gender", { required: "Este campo es requerido" })}
                      options={[
                        { value: "MASCULINO", label: "Masculino" },
                        { value: "FEMENINO", label: "Femenino" },
                      ]}
                      label="Género:"
                      invalid={!!errors.gender}
                      feedBack={errors.gender?.message}
                      className="border text-uppercase"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onHide}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>

          </fieldset>
        </Form>
      </div>
    </>
  );
}