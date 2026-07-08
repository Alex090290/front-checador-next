"use client";

import { approvedPermission } from "@/app/actions/permissions-actions";
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
  status: string;
  signature: string;
};

function ApproveLeaderModal({
  show,
  onHide,
  id,
}: ModalBasicProps & { id: string }) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>();

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const handleOnExited = () => {
    reset({ status: "", signature: "" });
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    onHide();

    modalConfirm("¿Seguro que quieres guardar la firma?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Enviando firma...");

        const res = await approvedPermission({
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
            <Form.Group className="mb-2 d-flex gap-3">
              <Form.Check
                {...register("status", { required: true })}
                value="APPROVED"
                type="radio"
                label="Aprobar"
                id="APPROVED"
                isInvalid={!!errors.status}
              />
              <Form.Check
                {...register("status", { required: true })}
                value="REFUSED"
                type="radio"
                label="Rechazar"
                id="REFUSED"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <SignatureInput
                control={control}
                name="signature"
                register={register}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button
              className="bg-success border-success"
              type="submit"
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

export default ApproveLeaderModal;
