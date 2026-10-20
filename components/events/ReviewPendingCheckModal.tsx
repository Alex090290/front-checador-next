"use client"

import { Alert, Badge, Button, Card, Container, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import { Entry } from "../fields";
import ConditionalRender from "../ConditionalRender";
import { IPendingCheck } from "@/lib/pendingChecks/interface";
import { formatDateHours } from "@/lib/helpers";

type ReviewAction = "VALIDADA" | "RECHAZADA";

type TReviewInputs = {
    notes: string;
};

//Validar o rechazar una checada sin conexión que llegó tarde. Rechazar exige motivo (mín. 5 caracteres)
export default function ReviewPendingCheckModal({
    pendingCheck,
    action,
    onHide,
    onConfirm,
}: {
    pendingCheck: IPendingCheck;
    action: ReviewAction;
    onHide: () => void;
    onConfirm: (notes: string) => void;
}) {
    const isReject = action === "RECHAZADA";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TReviewInputs>({
        defaultValues: { notes: "" },
    });

    const { modalConfirm } = useModals();

    const employeeName = pendingCheck.employee
        ? `${pendingCheck.employee.lastName} ${pendingCheck.employee.name}`
        : `#${pendingCheck.idCheck}`;

    const onSubmit: SubmitHandler<TReviewInputs> = (data) => {
        modalConfirm(
            isReject
                ? `¿Seguro que quieres rechazar la checada de ${employeeName}?`
                : `¿Seguro que quieres validar la checada de ${employeeName}?`,
            () => onConfirm(data.notes)
        );
    };

    return (
        <Container className="mt-4">
            <div className="p-2">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                    <h4 className="mb-0 fw-bold">
                        {isReject ? "Rechazar checada" : "Validar checada"}
                    </h4>

                    <Badge
                        bg={isReject ? "danger-subtle" : "success-subtle"}
                        text={isReject ? "danger-emphasis" : "success-emphasis"}
                        className={`rounded-pill px-3 py-2 fw-semibold border ${isReject ? "border-danger-subtle" : "border-success-subtle"}`}
                    >
                        {isReject ? "Rechazar" : "Validar"}
                    </Badge>
                </div>

                <p className="text-muted mb-2 text-uppercase">
                    {employeeName} · Checó {formatDateHours(pendingCheck.eventTime)}
                </p>

                <ConditionalRender cond={!isReject}>
                    <Alert variant="info" className="rounded-3 small mb-0">
                        <i className="bi bi-info-circle me-2" />
                        Validar confirma que el empleado sí checó a esa hora. Si ese día tiene falta o retardo, justifícalo desde Faltas y Asistencias.
                    </Alert>
                </ConditionalRender>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Card className="rounded-4 shadow-sm mt-3">
                        <Card.Body className="p-4">
                            <Entry
                                register={register("notes", {
                                    validate: (value) =>
                                        !isReject ||
                                        value.trim().length >= 5 ||
                                        "El motivo es requerido (mínimo 5 caracteres)",
                                })}
                                invalid={!!errors.notes}
                                label={isReject ? "Motivo del rechazo:" : "Notas (opcional):"}
                                feedBack={errors.notes?.message}
                                className="border rounded-3"
                                as={"textarea"}
                                rows={3}
                            />
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={onHide}>
                            Cancelar
                        </Button>

                        <Button variant={isReject ? "danger" : "success"} type="submit">
                            {isReject ? "Rechazar" : "Validar"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}
