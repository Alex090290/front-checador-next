"use client";

import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import { Entry } from "@/components/fields";
import { updatePasswordUser } from "@/app/actions/user-actions";
import toast from "react-hot-toast";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useState } from "react";

type TInputs = {
  password: string;
  password2: string;
};

type ChangePasswordModalProps = ModalBasicProps & {
  /** Si viene (p. ej. desde la tabla), se usa en lugar del `id` de la URL. */
  userId?: number | null;
};

function ChangePasswordModal({
  onHide,
  userId,
}: ChangePasswordModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: { password: "" },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { modalError, modalConfirm } = useModals();
  const [, setMessageLoading] = useState("");

  const params = useSearchParams();
  const activeId = params.get("id");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    onHide();

    modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {

      try {
        if (data.password !== data.password2) {
          setError("password2", {
            type: "custom",
            message: "Las contraseñas no coinciden",
          });
          return;
        }

        const fromUrl = activeId != null ? Number(activeId) : NaN;
        const targetId =
          userId != null && Number.isFinite(userId) && userId > 0
            ? userId
            : fromUrl;

        if (!Number.isFinite(targetId) || targetId <= 0) {
          modalError("No se pudo identificar al usuario");
          return;
        }

        const res = await updatePasswordUser({
          password: data.password,
          id: targetId,
        });

        if (!res) {
          modalError("Error al cambiar contraseña");
          return;
        }

        toast.success("Contraseña actualizada");
        onHide();
        router.refresh();

      } finally {

        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <div className="p-2">
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message="Cambiando contraseña..." />
      </ConditionalRender>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1 fw-bold">Cambiar contraseña</h4>
          <p className="text-muted mb-0">
            Ingresa y confirma la nueva contraseña.
          </p>
        </div>

        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
          Seguridad
        </span>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting}>

          <Card className="border rounded-4 mb-3">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-shield-lock text-primary" />
                <h6 className="mb-0 fw-bold">Nueva contraseña</h6>
              </div>

              <Row className="g-3">
                <Col xs={12}>
                  <Entry
                    register={register("password", {
                      required: true,
                      minLength: {
                        value: 8,
                        message: "La contraseña debe tener al menos 8 caracteres",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message:
                          "Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                      },
                    })}
                    label="Nueva contraseña:"
                    invalid={!!errors.password}
                    type="password"
                    className="text-left border"
                    feedBack={errors.password?.message}
                  />
                </Col>

                <Col xs={12}>
                  <Entry
                    register={register("password2", {
                      required: true,
                      minLength: {
                        value: 8,
                        message: "La contraseña debe tener al menos 8 caracteres",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message:
                          "Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
                      },
                    })}
                    label="Confirma la contraseña:"
                    invalid={!!errors.password2}
                    type="password"
                    className="text-left border"
                    feedBack={errors.password2?.message}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onHide}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Aceptar"}
            </Button>
          </div>

        </fieldset>
      </Form>
    </div>
  );
}

export default ChangePasswordModal;
