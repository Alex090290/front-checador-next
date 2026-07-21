"use client"

import { IAbsence } from "@/lib/absences/interface";
import { Button, Card, Col, Collapse, Container, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import OverLay from "../templates/OverLay";
import Loading from "../LoadingSpinner";
import { useState } from "react";
import { useModals } from "@/context/ModalContext";
import { deleteAbsence } from "@/app/actions/absences-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import React from "react";
import CheckLocationMap from "./AbsenceMap";
import { formatCreatedAt, formatCreatedAtOnlyHours, formatScheduleTime } from "@/lib/helpers";

function formatText(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function statusVariant(type: string | null) {
    switch ((type ?? "").toLowerCase()) {
        case "asistencia":
            return (
                <span className="badge rounded-pill px2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                    ASISTENCIA
                </span>
            )

        case "falta":
            return (
                <span className="badge rounded-pill px2 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    FALTA
                </span>
            )
        default:
            return (
                <span className="badge rounded-pill px2 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle" />
            )
    }
}

function checksVariant(type: string | null) {
    switch ((type ?? "").toLowerCase()) {
        case "entrada_oficina":
            return (
                <div>
                    <i className="bi bi-box-arrow-in-right text-success me-2" />
                    <span>
                        Entrada Oficina
                    </span>
                </div>
            )

        case "sale_a_comer":
            return (
                <div>
                    <i className="bi bi-cup-hot text-success me-2" />
                    <span>
                        Entrada Comedor
                    </span>
                </div>
            )
        case "regresa_de_comer":
            return (
                <div>
                    <i className="bi bi-cup-straw text-danger me-2" />
                    <span>
                        Salida Comedor
                    </span>
                </div>
            )
        case "salida_oficina":
            return (
                <div>
                    <i className="bi bi-box-arrow-right text-danger me-2" />
                    <span>
                        Salida Oficina
                    </span>
                </div>
            )
        case "entrada_sabado":
            return (
                <div>
                    <i className="bi bi-box-arrow-in-right text-danger me-2" />
                    <span>
                        Entrada Sábado
                    </span>
                </div>
            )
        case "salida_sabado":
            return (
                <div>
                    <i className="bi bi-box-arrow-right text-danger me-2" />
                    <span>
                        Salida Sábado
                    </span>
                </div>
            )
    }
}

type Props = {
    absence: IAbsence;
}

export function AbsenceOne({
    absence,
}: Props
) {
    //Aqui los const
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const overallStatus = absence?.type ?? "";
    const hasChecks = absence?.checks.length > 0;
    const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
    const activeCheck = absence.checks.find((c) => String(c.id) === activeCheckId);

    //========== Helpers =============

    const upperCase = (text?: string) => {
        return text?.toUpperCase() || "";
    };

    const getEmployeeName = (u: IAbsence) => {
        return u.employee
            ? `${upperCase(u.employee.lastName)} ${upperCase(u.employee.name)} `
            : `EMPLEADO #${u.idEmployee}`;
    };

    //Borrar
    const handleDeleteOvertime = async () => {
        if (!absence?.id) {
            modalError("No se encontró el registro");
            return;
        }

        modalConfirm("¿Deseas eliminar la falta?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Eliminando falta...");

                const res = await deleteAbsence({ id: Number(absence.id) });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/absences");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    //Regresar a pagina principal
    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");
        router.push("/app/absences");
    }

    if (!absence) {
        return (
            null
        )
    }

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                    {/* Izquierda */}
                    <div className="d-flex gap-2 flex-wrap">


                        <OverLay string="Eliminar registro">
                            <Button
                                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                variant="danger"
                                onClick={handleDeleteOvertime}
                                disabled={loading}
                            >
                                <i className="bi bi-trash" />

                                <span className="d-none d-md-inline ms-2">
                                    Eliminar falta
                                </span>
                            </Button>
                        </OverLay>
                    </div>

                    {/* Derecha */}
                    <div className=" d-md-flex flex-wrap">
                        <Button
                            variant="outline-secondary"
                            onClick={handleBack}
                            disabled={loading}
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-2 px-md-3"
                        >
                            <i className="bi bi-arrow-left" />
                            Regresar
                        </Button>
                    </div>
                </div>

                <div>
                    <h1 className="mb-1 ms-1">{getEmployeeName(absence)}</h1>
                    <p className="text-muted mb-1 ms-1"> Informacion de la {absence.type}.</p>
                </div>

                <Card className="border shadow-sm rounded-4 mt-2">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h5 className="mb-1 fw-bold text-capitalize">
                                    {absence.type} #{absence.id}
                                </h5>

                            </div>
                        </div>

                        <Row className="g-4 mb-4">
                            {/* RESUMEN */}
                            <Col xs={12} lg={4}>
                                <Card className="border rounded-4 h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <h6 className="mb-0 fw-bold">
                                                Resumen
                                            </h6>

                                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                                                General
                                            </span>
                                        </div>

                                        <div className="d-flex flex-column gap-3">
                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-calendar-plus text-primary" />
                                                    <span className="text-muted">Fecha de Registro</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {formatCreatedAt(absence.createdAt)}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-clock" />
                                                    <span className="text-muted">Hora de Registro</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {formatCreatedAtOnlyHours(absence.createdAt)}
                                                </span>
                                            </div>

                                            {/* <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-person text-success" />
                                                    <span className="text-muted">Creada por</span>
                                                </div>

                                                <span className="fw-semibold text-end">

                                                </span>
                                            </div> */}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* DETALLES */}
                            <Col xs={12} lg={8}>
                                <Card className="border rounded-4 h-100">
                                    <Card.Body>
                                        <div className="d-flex align-items-center justify-content-between mb-4">
                                            <div>
                                                <h6 className="mb-1 fw-bold">
                                                    Detalles de la {absence.type}
                                                </h6>

                                                <p className="text-muted mb-0 small">
                                                    Consulta los detalles de la {absence.type}.
                                                </p>
                                            </div>

                                            {statusVariant(overallStatus)}
                                        </div>

                                        <div className="d-flex flex-column gap-4">

                                            <Row className="g-3">
                                                <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-patch-check text-info fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Categoría
                                                        </div>

                                                        <div className="fw-semibold text-capitalize">
                                                            {formatText(absence.category)}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-file-earmark-check text-warning fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Subcategoría
                                                        </div>

                                                        <div className="fw-semibold">
                                                            {formatText(absence.subCategory)}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-funnel text-danger fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Tipo
                                                        </div>

                                                        <div className="fw-semibold text-capitalize">
                                                            {formatText(absence.type)}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Card className="border p-3 shadow-sm rounded-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <h6 className="mb-0 fw-bold">Checadas del día</h6>

                                <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                                    Historial
                                </span>
                            </div>
                            <Row>

                                <ConditionalRender cond={hasChecks}>
                                    <Row className="g-3">
                                        {absence.checks.map((c) => {
                                            const key = String(c.id);
                                            const isActive = activeCheckId === key;

                                            return (
                                                <Col key={key} xs={12} sm={12} md={6} lg={6} xl={3}>
                                                    <div
                                                        role="button"
                                                        onClick={() => setActiveCheckId(isActive ? null : key)}
                                                        className={`border rounded-3 p-3 h-100 ms-2 ${isActive ? "border-primary" : ""
                                                            }`}
                                                    >
                                                        <div className="d-flex align-items-between gap-2">
                                                            {checksVariant(c.type)}
                                                            <i
                                                                className={`bi ms-auto ${isActive ? "bi-chevron-up" : "bi-chevron-down"
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    <Collapse in={!!activeCheck}>
                                        <div>
                                            {activeCheck && (

                                                <div className="border rounded-3 p-3 mt-3 me-2 ms-1">
                                                    <Row className="g-3">
                                                        {/* Columna de estadísticas */}
                                                        <Col xs={12} lg={4}>
                                                            <div className="d-flex flex-column gap-2 h-100">
                                                                <div className="border rounded-3 p-3 d-flex align-items-center gap-3">
                                                                    <i className="bi bi-geo-alt text-primary fs-5" />
                                                                    <div>
                                                                        <div className="text-muted small">Usuario Checador</div>
                                                                        <div className="fw-bold text-capitalize">{activeCheck.user.name} {activeCheck.user.lastName}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="border rounded-3 p-3 d-flex align-items-center gap-3">
                                                                    <i className="bi bi-clock text-primary fs-5" />
                                                                    <div>
                                                                        <div className="text-muted small">Hora de registro</div>
                                                                        <div className="fw-semibold">
                                                                            {formatCreatedAtOnlyHours(activeCheck.createdAt)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="border rounded-3 p-3 d-flex align-items-center gap-3">
                                                                    <i className="bi bi-signpost-split text-primary fs-5" />
                                                                    <div>
                                                                        <div className="text-muted small">Horario preestablecido del Empleado</div>
                                                                        <div className="fw-semibold text-capitalize">
                                                                            Entrada: <span className="text-muted">{formatScheduleTime(activeCheck?.schedule?.entry)} </span>
                                                                        </div>
                                                                        <div className="fw-semibold text-capitalize">
                                                                            Salida: <span className="text-muted"> {formatScheduleTime(activeCheck?.schedule?.exit)} </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="border rounded-3 p-3 d-flex align-items-center gap-3">
                                                                    <i className="bi bi-hourglass-split text-primary fs-5" />
                                                                    <div>
                                                                        <div className="text-muted small">Minutos de diferencia</div>
                                                                        <div className="fw-semibold">
                                                                            {activeCheck.minutesDifference || "-"}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        {/* Columna de comentarios */}
                                                        <Col xs={12} lg={4}>
                                                            <div className="border rounded-3 p-3 h-100 d-flex flex-column">
                                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                                    <i className="bi bi-chat-left-text text-primary fs-5" />
                                                                    <span className="text-muted small">Comentarios registrados</span>
                                                                </div>

                                                                <div
                                                                    className="flex-grow-1 p-3 rounded-3 border"
                                                                    style={{ whiteSpace: "pre-wrap", minHeight: "180px" }}
                                                                >
                                                                    {activeCheck.message || "Sin comentarios"}
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        {/* Columna de mapa (placeholder) */}
                                                        <Col xs={12} lg={4}>
                                                            <div className="border rounded-3 h-100 d-flex flex-column">
                                                                <div className="d-flex align-items-center gap-2 p-3 pb-2">
                                                                    <i className="bi bi-map text-primary fs-5" />
                                                                    <span className="text-muted small">Ubicación del registro</span>
                                                                </div>

                                                                <div className="m-2 h-100">
                                                                    <CheckLocationMap lat={activeCheck.coordinates.lat} lng={activeCheck.coordinates.lng} />
                                                                </div>

                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            )}
                                        </div>
                                    </Collapse>
                                </ConditionalRender>

                                <ConditionalRender cond={!hasChecks}>
                                    <p> No tiene checadas</p>
                                </ConditionalRender>

                            </Row>

                        </Card>
                    </Card.Body>


                </Card >
            </Container >
        </>
    )
}
