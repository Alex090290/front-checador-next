"use client"

import { ModalBasicProps } from "@/lib/definitions"
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IBonusHomeOffice, IUpdateBonusHO } from "@/lib/Bonus/interface";
import { Button, Card, Col, Form } from "react-bootstrap";
import { EntryNumber } from "../fields/EntryFieldNumber";
import { useModals } from "@/context/ModalContext";
import { updateBonusHO } from "@/app/actions/bonusHO-actions";

type FeedbackState = "loading" | "success" | "error" | null;

type ModalProps = {
    idRegister: number | null;
    Register: IBonusHomeOffice | null;
}

function getDefaultValues(register?: IUpdateBonusHO | null): IUpdateBonusHO {
    return {
        amount: register?.amount ?? null
    }
}

export default function UpdateBonusKeys({
    idRegister,
    Register,
    onHide
}: ModalBasicProps & ModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IUpdateBonusHO>({
        defaultValues: getDefaultValues(Register)
    });

    const { modalConfirm } = useModals();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const onSubmit: SubmitHandler<IUpdateBonusHO> = async (data) => {


        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando bono...");

                const res = await updateBonusHO({
                    idBonus: String(idRegister),
                    data: {
                        amount: Number(data.amount)
                    }
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo actualizar");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Actualizado correctamente");
                setFeedback("success");
            } catch {
                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        })
    };

    return (
        <>
            <ConditionalRender cond={feedback === "loading" || isSubmitting}>
                <Loading message={feedbackMsg || "Cargando..."} />
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

            <div className="p-2 mt-4">
                <div className="d-flex align-items-start justify-content-between gap-3 mt-2">
                    <div>
                        <h4 className="mb-1 fw-bold">Actualizar bono</h4>
                        <p className="text-muted mb-0 mt-2">
                            Se actualizará la información del bono del empleado: <br />
                            <strong className="text-capitalize text-primary"> {Register?.employee?.name} {Register?.employee?.lastName}.</strong>
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle flex-shrink-0">
                        Actualizar
                    </span>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Card className="border-0">
                        <Col md={12}>
                            <Card className="border rounded-4 mt-3">
                                <Card.Body className="p-4">
                                    <Form.Group>
                                        <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                            <i className="bi bi-currency-dollar text-success" />
                                            Cantidad del bono:
                                        </label>
                                        <EntryNumber
                                            register={register("amount", { required: "La cantidad del bono es requerida", valueAsNumber: true },)}
                                            invalid={!!errors.amount}
                                            label=""
                                            feedBack={errors.amount?.message}
                                            className="border rounded-3"
                                            prefix="$"
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Card>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={onHide}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={isSubmitting || feedback === "loading"}
                        >
                            {isSubmitting || feedback === "loading" ? "Actualizando..." : "Actualizar"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    )
}