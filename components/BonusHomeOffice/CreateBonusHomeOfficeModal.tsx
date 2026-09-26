"use client"

import { Employee, ModalBasicProps } from "@/lib/definitions";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IBonusHomeOffice } from "@/lib/Bonus/interface";
import { Button, Card, Col, Form } from "react-bootstrap";
import { RelationField } from "../fields";
import { EntryNumber } from "../fields/EntryFieldNumber";
import { createBonusHomeOffice } from "@/app/actions/bonusHO-actions";

type FeedbackState = "loading" | "success" | "error" | null;

type ModalProps = {
    employees: Employee[];
}

export default function CreateBonusHomeOfficeModal({
    onHide,
    employees
}: ModalBasicProps & ModalProps) {

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<IBonusHomeOffice>();

    const { modalConfirm } = useModals();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const onSubmit: SubmitHandler<IBonusHomeOffice> = async (data) => {
    
    
            modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
                try {
                    setFeedback("loading");
                    setFeedbackMsg("Creando bono...");
    
                    const res = await createBonusHomeOffice({
                        data: {
                            idEmployee: data.idEmployee,
                            amount: Number(data.amount)
                        }
                    });
    
                    if (!res.success) {
                        setFeedbackMsg(res.message || "No se pudo crear");
                        setFeedback("error");
                        return;
                    }
    
                    setFeedbackMsg(res.message || "Creado correctamente");
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
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-1 fw-bold">Crear nuevo bono</h4>
                        <p className="text-muted mb-0">
                            Ingresa el nombre del empleado beneficiado y la cantidad del bono.
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Crear
                    </span>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Card className="border-0">
                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body className="p-4">
                                    <Form.Group>
                                        <label className="d-flex align-items-center fw-bold">
                                            <i className="bi bi-person text-primary me-1" />
                                            Empleado relacionado:
                                        </label>

                                        <RelationField
                                            options={employees.map((e) => ({
                                                id: Number(e.id) || 0,
                                                displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                                name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                            }))}
                                            register={register("idEmployee")}
                                            control={control}
                                            callBackMode="id"
                                            label=""
                                        />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

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
                            {isSubmitting || feedback === "loading" ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    )
}