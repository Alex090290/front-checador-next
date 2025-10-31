"use client";

import { updateExpirationDocument } from "@/app/actions/documents-actions";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = {
  date: string | null;
};

function ModalExpirationDate({
  show,
  onHide,
  idEmpleado,
  idDocument,
  idPeriod,
  title,
}: ModalBasicProps & {
  idEmpleado: number;
  idDocument: number;
  idPeriod: number;
  title: string;
}) {
  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: {
      date: null,
    },
  });

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await updateExpirationDocument({
      date: data.date || "",
      idDocument,
      idEmpleado,
      idPeriod,
    });

    if (!res.success) return modalError(res.message);
    reset({ date: null });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-uppercase">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting}>
            <Form.Group className="mb-2">
              <Form.Label>Fecha de expiración:</Form.Label>
              <Form.Control
                {...register("date", { required: true })}
                type="date"
                autoComplete="off"
                placeholder="Fecha"
                isInvalid={!!errors.date}
              />
            </Form.Group>
            <Button type="submit">
              {/* <i className="bi bi-arrow-up-square-fill"></i> */}
              {isSubmitting ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <span>Establecer</span>
              )}
            </Button>
          </fieldset>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ModalExpirationDate;
