"use client";

import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useState } from "react";
import { createPosition } from "@/app/actions/positions-actions";
import { useRouter } from "next/navigation";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

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
};

function CreatePositionModal({
    onHide,
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

    const [loading, setLoading] = useState(false);
    const { modalConfirm } = useModals();
    const router = useRouter();
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [, setMessageLoading] = useState("");


    const handleClose = () => {
        reset({ namePosition: "" });
        onHide();
    };


    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        modalConfirm("¿Seguro que quieres guardar este puesto?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Guardando puesto...");

                const res = await createPosition({
                    namePosition: data.namePosition,
                    idDepartment: idDepartment
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo crear el puesto");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Puesto creado correctamente");
                setFeedback("success");
                router.refresh
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
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Actualizando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => {
                        setFeedback(null);
                        handleClose();
                    }}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
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
                                                    value: 100,
                                                    message: "El nombre del puesto no puede exceder los 100 caracteres",
                                                },
                                            })}
                                            label="Nombre:"
                                            invalid={!!errors.namePosition}
                                            feedBack={errors.namePosition?.message}
                                            className="border text-uppercase"
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