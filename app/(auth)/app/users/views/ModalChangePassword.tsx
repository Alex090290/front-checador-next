"use client";

import { Button, Form, Modal } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import { ModalBasicProps } from "@/lib/definitions";
import { useSearchParams } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import { Entry } from "@/components/fields";
import { updatePasswordUser } from "@/app/actions/user-actions";
import toast from "react-hot-toast";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

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
  show,
  userId,
}: ChangePasswordModalProps) {
  const {
    register,
    setFocus,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: { password: "" },
  });

  const { modalError } = useModals();

  const params = useSearchParams();
  const activeId = params.get("id");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
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
  };

  return (
    <Modal
      size="sm"
      show={show}
      onHide={onHide}
      backdrop="static"
      animation
      onEntered={() => setFocus("password")}
      onExited={() => reset({ password: "", password2: "" })}
    >
      <Modal.Header closeButton>
        <Modal.Title>Cambiar cotraseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ConditionalRender cond={isSubmitting}>
          <Loading message="Cambiando contraseña..." />
        </ConditionalRender>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting}>
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
              className="text-center border"
              feedBack={errors.password?.message}
            />
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
              className="text-center border"
              feedBack={errors.password2?.message}
            />
            <Button type="submit">
              <span>Aceptar</span>
            </Button>
          </fieldset>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ChangePasswordModal;
