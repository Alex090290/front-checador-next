"use client";

import {
  fetchChecadorStatus,
  fetchChecadorTypes,
} from "@/app/actions/eventos-actions";
import { FieldSelect } from "@/components/fields";
import { FieldGroup, FieldGroupFluid } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { useState } from "react";
import {
  Button,
  Col,
  Form,
  Modal,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type TInputs = {
  status: string;
  type: string;
};

type ModalAction = {
  sendData: (
    type: string,
    status: string
  ) => Promise<ActionResponse<boolean | null>>;
  status: string;
  type: string;
};

function ModifyModalForm({
  show,
  onHide,
  sendData,
  status: currentStatus,
  type: currentType,
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TInputs>();

  const { modalError } = useModals();

  const [checadorTypes, setChecadorTypes] = useState<string[]>([]);
  const [checadorStatus, setChecadorStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFetchResources = async () => {
    setLoading(true);
    let types: string[] = [];
    let status: string[] = [];

    [types, status] = await Promise.all([
      fetchChecadorTypes(),
      fetchChecadorStatus(),
    ]);

    setChecadorTypes(types);
    setChecadorStatus(status);

    reset({ status: currentStatus, type: currentType });
    setLoading(false);
  };

  const handleOnEntered = () => {
    handleFetchResources();
  };

  const handleOnExited = () => {
    reset({ status: "", type: "" });
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    const res = await sendData(data.type, data.status);
    if (!res.success) {
      modalError(res.message);
      return;
    }

    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      onEntered={handleOnEntered}
      onExited={handleOnExited}
      size="sm"
    >
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {loading ? (
            <Row style={{ height: "200px" }}>
              <Col md="12" className="text-center h-100 align-content-center">
                <ProgressBar variant="primary" striped now={100} animated />
              </Col>
            </Row>
          ) : (
            <fieldset disabled={isSubmitting || loading}>
              <FieldGroupFluid>
                <FieldSelect
                  register={register("type", { required: true })}
                  options={checadorTypes.map((t) => ({
                    label: t.replace(/_/g, " ").toUpperCase(),
                    value: t,
                  }))}
                  label="Evento:"
                  invalid={!!errors.type}
                />
                <FieldSelect
                  register={register("status", { required: true })}
                  options={checadorStatus.map((ev) => ({
                    label: ev.replace(/_/g, " ").toUpperCase(),
                    value: ev,
                  }))}
                  label="Status:"
                  invalid={!!errors.type}
                />
                <FieldGroup.Stack>
                  <Button type="submit">
                    {isSubmitting ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        <span>Modificando...</span>
                      </>
                    ) : (
                      <span>Modificar</span>
                    )}
                  </Button>
                  <Button type="reset" variant="secondary" onClick={onHide}>
                    Cancelar
                  </Button>
                </FieldGroup.Stack>
              </FieldGroupFluid>
            </fieldset>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ModifyModalForm;
