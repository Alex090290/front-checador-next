"use client"

import { useState } from "react";
import { Alert, Badge, Button, Card, Container, Form } from "react-bootstrap";
import moment from "moment-timezone";
import ConditionalRender from "../ConditionalRender";

export type ParticipationAction = "include" | "exclude";

// Hoy en hora de México (YYYY-MM-DD), valor por defecto de "Participan desde"
export function todayMx() {
    return moment.tz("America/Mexico_City").format("YYYY-MM-DD");
}

//Incluir en reportes (con fecha "Participan desde") o excluir de reportes a los empleados seleccionados
export default function ParticipationModal({
    action,
    count,
    employeeName,
    onHide,
    onConfirm,
}: {
    action: ParticipationAction;
    count: number;
    employeeName?: string;
    onHide: () => void;
    onConfirm: (since?: string) => void;
}) {
    const isInclude = action === "include";
    const [since, setSince] = useState(todayMx());
    const [error, setError] = useState("");

    const target = count === 1 && employeeName
        ? employeeName
        : `${count} empleado${count !== 1 ? "s" : ""}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isInclude && !moment(since, "YYYY-MM-DD", true).isValid()) {
            setError("Selecciona la fecha desde la que participan");
            return;
        }

        onConfirm(isInclude ? since : undefined);
    };

    return (
        <Container className="mt-4">
            <div className="p-2">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                    <h4 className="mb-0 fw-bold">
                        {isInclude ? "Incluir en reportes" : "Excluir de reportes"}
                    </h4>

                    <Badge
                        bg={isInclude ? "success-subtle" : "danger-subtle"}
                        text={isInclude ? "success-emphasis" : "danger-emphasis"}
                        className={`rounded-pill px-3 py-2 fw-semibold border ${isInclude ? "border-success-subtle" : "border-danger-subtle"}`}
                    >
                        {count} seleccionado{count !== 1 ? "s" : ""}
                    </Badge>
                </div>

                <p className="text-muted mb-3">
                    Se va a cambiar la participación de <span className="fw-semibold text-uppercase">{target}</span>.
                </p>

                <Alert variant={isInclude ? "info" : "warning"} className="rounded-3 small">
                    <i className={`bi ${isInclude ? "bi-info-circle" : "bi-exclamation-triangle"} me-2`} />
                    {isInclude
                        ? "Desde esa fecha se les generarán faltas si no checan y entrarán a prenómina, vales y bonos. Lo anterior a esa fecha no cuenta."
                        : "Dejarán de generarse sus faltas automáticas y no entrarán a prenómina, vales, bonos ni estadísticas. Siguen pudiendo checar."}
                </Alert>

                <Form onSubmit={handleSubmit}>
                    <ConditionalRender cond={isInclude}>
                        <Card className="rounded-4 shadow-sm">
                            <Card.Body className="p-4">
                                <Form.Group controlId="participation-since">
                                    <Form.Label className="fw-semibold">Participan desde:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="border"
                                        value={since}
                                        isInvalid={!!error}
                                        onChange={(e) => {
                                            setSince(e.target.value);
                                            setError("");
                                        }}
                                    />
                                    <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </ConditionalRender>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={onHide}>
                            Cancelar
                        </Button>

                        <Button variant={isInclude ? "success" : "danger"} type="submit">
                            {isInclude ? "Incluir en reportes" : "Excluir de reportes"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
}
