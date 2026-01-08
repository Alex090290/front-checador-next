import { createNewDocument } from "@/app/actions/inability-actions";
import { Entry } from "@/components/fields";
import { ModalBasicProps } from "@/lib/definitions";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  dateInit: string;
  dateEnd: string;
  document: FileList | null;
};

function ModalAddDocuments({
  idDoc,
  show,
  onHide,
}: ModalBasicProps & { idDoc: string }) {
  const { register, reset, watch, handleSubmit } = useForm<TInputs>({
    defaultValues: {
      dateEnd: "",
      dateInit: "",
      document: null,
    },
  });

  const onChangeDateInit = watch("dateInit");

  const handleOnEntered = () => {
    reset({ dateEnd: "", dateInit: "", document: null });
  };

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading("Creando nuevo documento...");
    const res = await createNewDocument({
      idDoc,
      dateEnd: data.dateEnd,
      dateInit: data.dateInit,
      formData: data.document,
    });

    if (!res.success) {
      toast.error(res.message, { id: toastId });
      return;
    }

    toast.success(res.message, { id: toastId });
    onHide();
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      centered
      onEntered={handleOnEntered}
    >
      <Modal.Header closeButton>
        <Modal.Title>Documento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="d-flex justify-content-between align-items-center mb-3">
            <Entry
              type="date"
              register={register("dateInit", { required: true })}
              label="Fecha inicio"
            />
            <Entry
              type="date"
              register={register("dateEnd", { required: true })}
              label="Fecha fin"
              min={onChangeDateInit}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="fw-semibold">Documento</Form.Label>
            <Form.Control type="file" {...register("document")} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>Cargar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalAddDocuments;
