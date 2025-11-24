"use client";

import { approvedPermissionDoh } from "@/app/actions/permissions-actions";
import { SignatureInput } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  signature: string;
  status: string;
};

function SignatureDohModal({
  show,
  onHide,
  id,
}: ModalBasicProps & { id: string }) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>();

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await approvedPermissionDoh({
      data: { id, signature: data.signature, status: data.status },
    });

    if (!res.success) return modalError(res.message);

    toast.success(res.message);
    onHide();
    router.back();
  };

  const handleOnExited = () => {
    reset({ signature: "" });
  };

  const handleConfirm = () => modalConfirm("Confirmar", handleSubmit(onSubmit));

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      onExited={handleOnExited}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Aprobación de permiso</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Check
            {...register("status", { required: true })}
            value="APPROVED"
            type="radio"
            label="Enterado"
            id="APPROVED"
            isInvalid={!!errors.status}
          />
          {/* <Form.Check
            {...register("status", { required: true })}
            value="REFUSED"
            type="radio"
            label="No Enterado"
            id="REFUSED"
          /> */}
          <SignatureInput
            control={control}
            name="signature"
            register={register}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {isSubmitting ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <span>Enviar</span>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default SignatureDohModal;
