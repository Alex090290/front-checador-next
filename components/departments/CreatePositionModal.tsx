"use client";

import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useState } from "react";

type TInputs = {
    namePosition: string;
};

type PositionFormCreateProps = {
    show: boolean;
    onHide: () => void;
    idDepartment: number;
    positionData: {
        activeId: number | null;
        namePosition: string;
    };
    sendData: (idDepartment: number, namePosition: string) => Promise<void>;
};

function CreatePositionModal({
    onHide,
    sendData,
    idDepartment,
    positionData,
}: PositionFormCreateProps) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TInputs>({
        defaultValues: {
            namePosition: positionData.namePosition || "",
        },
    });

    const [loading] = useState(false);
    const { modalConfirm } = useModals();

    const handleClose = () => {
        reset({ namePosition: "" });
        onHide();
    };


    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        onHide();

        modalConfirm("¿Deseas guardar los cambios de este puesto?", async () => {
            await sendData(idDepartment, data.namePosition);
        });
    };

    return (
        <>
            <ConditionalRender cond={loading || isSubmitting}>
                <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
            </ConditionalRender>

            <div className="p-2">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-1 fw-bold">Puesto</h4>
                        <p className="text-muted mb-0">
                            {positionData.activeId
                                ? "Edita el nombre del puesto."
                                : "Registra un nuevo puesto."}
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        {positionData.activeId ? "Editar" : "Nuevo"}
                    </span>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset disabled={loading || isSubmitting}>

                        <Card className="border rounded-4 mb-3">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-briefcase text-primary" />
                                    <h6 className="mb-0 fw-bold">Datos del puesto</h6>
                                </div>

                                <Row className="g-3">
                                    <Col md={12}>
                                        <Entry
                                            register={register("namePosition", {
                                                required: "Nombre es requerido",
                                                maxLength: {
                                                    value: 50,
                                                    message: "El nombre del puesto no puede exceder los 50 caracteres",
                                                },
                                            })}
                                            label="Nombre:"
                                            invalid={!!errors.namePosition}
                                            feedBack={errors.namePosition?.message}
                                            className="border"
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={loading || isSubmitting}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>

                    </fieldset>
                </Form>
            </div>
        </>
    );
}

export default CreatePositionModal;