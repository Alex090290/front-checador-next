"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { Badge, Button, Card, Col, Form, ListGroup } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { ModalBasicProps } from "@/lib/definitions";
import { INewSalary, ISalariesEmployees } from "@/lib/salaries/interface";
import { updateSalary } from "@/app/actions/salaries-actions";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";
import { EntryNumber } from "../fields/EntryFieldNumber";

type FeedbackState = "loading" | "success" | "error" | null;


export default function UpdateSalaryModal({
    employees,
    onHide,
}: ModalBasicProps & { employees: ISalariesEmployees[] }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<INewSalary>();

    const { modalConfirm } = useModals();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");


    const onSubmit: SubmitHandler<INewSalary> = async (data) => {

        const sendData: INewSalary = {
            idsEmployees: employees.map((employee) => employee.id),
            salary: data.salary
        }

        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando salario...");

                const res = await updateSalary({ data: sendData });

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
                <Loading message={feedbackMsg || "Actualizando..."} />
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
                        <h4 className="mb-1 fw-bold">Actualizar Salario Diario</h4>
                        <p className="text-muted mb-0">
                            Ajusta el salario del empleado seleccionado.
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Actualizar
                    </span>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Card className="rounded-4 border shadow-sm">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                                <div className="d-flex align-items-center gap-2 text-truncate" style={{ minWidth: 0 }}>
                                    <i className="bi bi-people-fill text-primary flex-shrink-0" />
                                    <span className="fw-semibold text-truncate">
                                        Empleado{employees.length !== 1 ? "s" : ""} seleccionado{employees.length !== 1 ? "s" : ""}
                                    </span>
                                    <Badge bg="secondary" pill className="flex-shrink-0">
                                        {employees.length}
                                    </Badge>
                                </div>

                                <span className="fw-semibold text-muted small text-uppercase flex-shrink-0">
                                    Salario actual
                                </span>
                            </div>

                            <ListGroup variant="flush">
                                {employees.map((employee) => (
                                    <ListGroup.Item
                                        key={employee.id}
                                        className="d-flex align-items-center justify-content-between px-0"
                                    >
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-person-circle text-muted" />
                                            <span className="text-uppercase">
                                                {employee.name} {employee.lastName}
                                            </span>
                                        </div>
                                        <span className="fw-semibold text-success">
                                            ${employee.dailyWage.toLocaleString("es-MX")}
                                        </span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    <Card className="rounded-4 shadow-sm mt-2">
                        <Col md={12}>
                            <Card.Body className="p-4">
                                <Form.Group>
                                    <EntryNumber
                                        register={register("salary", { required: "El nuevo salario es requerido" })}
                                        invalid={!!errors.salary}
                                        label="Nuevo salario Diario"
                                        feedBack={errors.salary?.message}
                                        className="border rounded-3"
                                        prefix="$"
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Col>
                    </Card>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            disabled={isSubmitting || feedback === "loading"}
                            onClick={onHide}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={isSubmitting || feedback === "loading"}
                        >
                            {isSubmitting || feedback === "loading" ? "Guardando..." : "Actualizar"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    );
}