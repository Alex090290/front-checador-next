"use client";

import { createPosition } from "@/app/actions/positions-actions";
import { Entry } from "@/components/fields";
import { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  namePosition: string;
};

function PositionFormCreate({
  show,
  onHide,
  idDepartment,
}: {
  show: boolean;
  onHide: () => void;
  idDepartment: number;
}) {
  const {
    reset,
    register,
    setFocus,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: {
      namePosition: "",
    },
  });

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await createPosition({
      idDepartment,
      namePosition: data.namePosition,
    });

    if (!res.success) {
      setErrorMessage(res.message);
      return;
    }

    toast.success(res.message);
    handleClose();
  };

  const handleClose = () => {
    reset({ namePosition: "" });
    onHide();
  };

  const handleEntered = () => {
    setFocus("namePosition");
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      onEntered={handleEntered}
    >
      <Modal.Header closeButton>
        <Modal.Title>Nuevo puesto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting}>
            <Form.Group className="mb-3">
              <Entry
                register={register("namePosition", {
                  required: "Nombre es requerido",
                })}
                label="Nombre:"
                invalid={!!errors.namePosition}
                feedBack={errors.namePosition?.message}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Button type="submit">
                {isSubmitting ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Crear"
                )}
              </Button>
            </Form.Group>
          </fieldset>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PositionFormCreate;
