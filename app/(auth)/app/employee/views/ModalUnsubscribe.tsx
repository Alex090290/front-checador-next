"use client";

import { unsubscribeUser } from "@/app/actions/user-actions";
import { Entry } from "@/components/fields";
import { FieldGroupFluid } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

function ModalUnsubscribe({
  show,
  onHide,
  id,
}: ModalBasicProps & { id: number }) {
  const {
    reset,
    setFocus,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ dischargeReason: string | null }>({
    defaultValues: { dischargeReason: "" },
  });

  const { modalError, modalConfirm } = useModals();

  const onSubmit: SubmitHandler<{
    dischargeReason: string | null;
  }> = async (data) => {
    const res = await unsubscribeUser({
      dischargeReason: data.dischargeReason || "",
      id,
    });

    if (!res.success) {
      modalError(res.message);
      return;
    }

    toast.success("El empleado ha sido dado de baja");
    onHide();
  };

  const handleEntered = () => {
    setFocus("dischargeReason");
  };

  const handleExited = () => {
    reset({ dischargeReason: "" });
  };

  const handleUnsubscribe = () => {
    modalConfirm("Confirma la baja del Empleado", handleSubmit(onSubmit));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      onEntered={handleEntered}
      onExited={handleExited}
    >
      <Modal.Header closeButton>
        <Modal.Title>Baja de Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <fieldset disabled={isSubmitting}>
            <FieldGroupFluid>
              <Entry
                as="textarea"
                register={register("dischargeReason", {
                  required: "Es necesario un motivo de baja",
                })}
                label="Motivo de la baja:"
                invalid={!!errors.dischargeReason}
                feedBack={errors.dischargeReason?.message}
              />
            </FieldGroupFluid>
          </fieldset>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-start">
        <Button type="button" onClick={handleUnsubscribe}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Esperando respuesta</span>
            </>
          ) : (
            <span>Aceptar</span>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalUnsubscribe;
