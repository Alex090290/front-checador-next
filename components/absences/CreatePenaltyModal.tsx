"use client";

import { createNewDocumentEmployee } from "@/app/actions/employee-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { IAbsence } from "@/lib/absences/interface";
import { useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { formatDate } from "date-fns";

type TInputs = {
    nameDocument: string;
};

const upperCase = (text?: string) => {
    return text?.toUpperCase() || "";
};

function fullName(emp?: IAbsence) {
    if (!emp) return "-";
    return `${upperCase(emp.employee?.lastName ?? "")} ${upperCase(emp.employee?.name ?? "")}`.trim();
}


export default function CreatePenaltyComponent({
    onClose,
    onSuccess,
    absence
}: {
    onClose: () => void;
    onSuccess?: () => void;
    absence: IAbsence[];
}) {
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<TInputs>({
        defaultValues: {
            nameDocument: "",
        },
    });


    const { modalError } = useModals();

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");

    const getDate = (date?: string | number | Date) => {
        if (!date) return "-";
        return formatDate(date, "dd/MM/yyyy");
    };


    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        try {
            setLoading(true);
            setMessageLoading("Creando nueva plantilla...");

            const res = await createNewDocumentEmployee({
                nameDocument: data.nameDocument,
            });

            if (!res.success) {
                modalError(res.message);
                return;
            }

            toast.success(res.message || "Nueva plantilla creada correctamente");
            onSuccess?.();
            onClose();
        } finally {
            setLoading(false);
            setMessageLoading("");
        }
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
                        Crea una nueva penalización a <span className="fw-bold text-primary"> {fullName(absence[0])}. </span>
                    </p>
                </div>

                <span className="badge rounded-pill px-3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    Nuevo
                </span>
            </div>

            {/* <Alert variant="info" className="rounded-4">
                Las faltas de las cuales crearas penalización son las siguientes: {absence.map((row) => (
                    <li className="ms-4" key={row.id}>{getDate(row.createdAt)}</li>
                ))}
            </Alert> */}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={loading || isSubmitting}>

                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <i className="bi bi-exclamation-octagon text-danger" />
                                <h6 className="mb-0 fw-bold">Detalles de la penalización</h6>
                            </div>

                            <Row className="g-3">
                                {absence.map((row) => (
                                    <Col key={row.id} md={4} >
                                        <Card className="m-1 p-2 d-flex flex-row align-items-center gap-2">
                                            <i className="bi bi-calendar text-danger" />
                                            {getDate(row.createdAt)}
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading || isSubmitting}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                            {isSubmitting ? "Guardando..." : "Crear plantilla"}
                        </Button>
                    </div>

                </fieldset>
            </Form>
        </div>
    );
}