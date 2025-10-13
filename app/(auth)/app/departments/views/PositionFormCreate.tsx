"use client";

import {
  createPosition,
  updatePosition,
} from "@/app/actions/positions-actions";
import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
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
  positionData,
}: {
  show: boolean;
  onHide: () => void;
  idDepartment: number;
  positionData: {
    activeId: number | null;
    namePosition: string;
  };
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

  const { modalError } = useModals();

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (!positionData.activeId) {
      const res = await createPosition({
        idDepartment,
        namePosition: data.namePosition,
      });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      handleClose();
    } else {
      const res = await updatePosition({
        id: positionData.activeId,
        namePosition: data.namePosition,
      });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      handleClose();
    }
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
      onEntering={() => reset({ namePosition: positionData.namePosition })}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {positionData.activeId ? "Editar Puesto" : "Crear puesto"}
        </Modal.Title>
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
                  <>{positionData.activeId ? "Editar" : "Crear"}</>
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
