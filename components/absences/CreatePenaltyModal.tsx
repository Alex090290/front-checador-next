"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { IAbsence } from "@/lib/absences/interface";
import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { formatDate } from "date-fns";
import { createPenalty } from "@/app/actions/penalties-actions";
import { IPenalty } from "@/lib/penalties/interface";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";

const upperCase = (text?: string) => {
    return text?.toUpperCase() || "";
};

function fullName(emp?: IAbsence) {
    if (!emp) return "-";
    return `${upperCase(emp.employee?.lastName ?? "")} ${upperCase(emp.employee?.name ?? "")}`.trim();
}


export default function CreatePenaltyComponent({
    absence,
    onHide,
}: ModalBasicProps & { absence: IAbsence[] }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<IPenalty>();

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();

    const getDate = (date?: string | number | Date) => {
        if (!date) return "-";
        return formatDate(date, "dd/MM/yyyy");
    };

    const onSubmit: SubmitHandler<IPenalty> = async (data) => {
        onHide();

        const payload: IPenalty = {
            idEmployee: absence[0]?.employee?.id ?? 0,
            idsAbsencesAndAttendances: absence.map((row) => row.id),
            dateOfAbsence: absence.map((row) =>
                formatDate(row.createdAt as string | number | Date, "yyyy-MM-dd")
            ),
            PenaltyForOffensesType: String(data.PenaltyForOffensesType),
            motive: String(data.motive),
        };

        modalConfirm("¿Seguro que quieres guardar la penalización?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Guardando Penalización...");

                const res = await createPenalty({ data: payload });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/penalties");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    return (
        <div className="p-2">
            <ConditionalRender cond={loading || isSubmitting}>
                <Loading message={messageLoading || "Guardando..."} />
            </ConditionalRender>

            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="mb-1 fw-bold">Penalización</h4>
                    <p className="text-muted mb-0">
                        Crea una nueva penalización a{" "}
                        <span className="fw-bold text-primary">{fullName(absence[0])}.</span>
                    </p>
                </div>

                <span className="badge rounded-pill px-3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    Nuevo
                </span>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={loading || isSubmitting}>

                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-exclamation-octagon text-danger" />
                                <h6 className="mb-0 fw-bold">Fechas por penalizar</h6>
                            </div>

                            <Row className="g-3">
                                {absence.map((row) => (
                                    <Col key={row.id} md={4}>
                                        <Card className="m-1 p-2 d-flex flex-row align-items-center gap-2">
                                            <i className="bi bi-calendar text-danger" />
                                            {getDate(row.createdAt)}
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-tag text-danger" />
                                <h6 className="mb-0 fw-bold">Tipo y motivo</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Tipo de penalización</Form.Label>
                                        <Form.Select
                                            {...register("PenaltyForOffensesType", {
                                                required: "Selecciona un tipo de penalización",
                                            })}
                                            isInvalid={!!errors.PenaltyForOffensesType}
                                        >
                                            <option value="">Selecciona...</option>
                                            <option value="retardos">Retardos</option>
                                            <option value="faltas_injustificadas">Faltas</option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors.PenaltyForOffensesType?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Motivo</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            {...register("motive")}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onHide}
                            disabled={loading || isSubmitting}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Crear penalización"}
                        </Button>
                    </div>

                </fieldset>
            </Form>
        </div>
    );
}