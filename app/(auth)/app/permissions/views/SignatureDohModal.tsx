"use client";

import { approvedPermissionDoh } from "@/app/actions/permissions-actions";
import ConditionalRender from "@/components/ConditionalRender";
import { SignatureInput } from "@/components/fields";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
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
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    onHide();

    modalConfirm("¿Seguro que quieres guardar la firma?", async () => {
      try {

        setLoading(true);
        setMessageLoading("Enviando firma...");

        const res = await approvedPermissionDoh({
          data: { id, signature: data.signature, status: data.status },
        });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        onHide();
        router.refresh();

      } finally {

        setLoading(false);
        setMessageLoading("");

      }
    });
  };

  const handleOnExited = () => {
    reset({ signature: "" });
  };


  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Enviando firma..."} />
      </ConditionalRender>

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
            <Button
              type="submit"
              className="bg-success border-success"
              disabled={isSubmitting}
            >
              Enviar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default SignatureDohModal;
