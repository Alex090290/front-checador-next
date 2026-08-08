"use client";

import { approvedPermissionDoh } from "@/app/actions/permissions-actions";
import ConditionalRender from "@/components/ConditionalRender";
import ErrorOverlay from "@/components/ErrorOverlay";
import { SignatureInput } from "@/components/fields";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type FeedbackState = "loading" | "success" | "error" | null;

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

  const { modalConfirm } = useModals();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const handleOnExited = () => {
    reset({ signature: "" });
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar la firma?", async () => {
      try {

        setFeedback("loading");
        setFeedbackMsg("Enviando firma...");

        const res = await approvedPermissionDoh({
          data: { id, signature: data.signature, status: data.status },
        });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo mandar la firma");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Firma enviada correctamente");
        setFeedback("success");
        router.refresh();
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      } finally {

        setLoading(false);
        setMessageLoading("");

      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Guardando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onHide();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
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
