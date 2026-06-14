"use client"

import { Department, Employee } from "@/lib/definitions";
import { OverTime } from "@/lib/overTime/interface";
import { EmployeeLite } from "../configSystem/formUpdate";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useCallback, useEffect, useState } from "react";
import { useModals } from "@/context/ModalContext";
import OvertimeOneError from "./overtimeMessageError";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import { deleteOverTime } from "@/app/actions/overtime-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import moment from "moment";
import { FormBook, FormPage } from "../templates/FormView";
import SignaturesViewOvertime from "./signaturesOvertime";
import { IFiltercUrl } from "@/lib/constancy/interface";
import DepartmentInfoOnePage from "@/app/(auth)/app/departments/views/DepartmentInfoOne";


function fullName(p?: { name?: string; lastName?: string } | null) {
    if (!p) return "—";
    return `${p.lastName ?? ""} ${p.name ?? ""}`.trim().toUpperCase();
}

function statusLabel(status?: string | null) {
    switch ((status ?? "").toUpperCase()) {
        case "APPROVED":
            return (
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                    APROBADO
                </span>
            );
        case "PENDING":
            return (
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                    PENDIENTE
                </span>
            );
        case "REFUSED":
            return (
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    RECHAZADO
                </span>
            );
        default:
            return status ? status.toUpperCase() : "—";
    }
}
function safeDate(date?: string | Date | null, fmt = "dd/MM/yyyy") {
    if (!date) return "—";
    try {
        return formatDate(new Date(date), fmt);
    } catch {
        return "—";
    }
}

function InfoItem({
    label,
    value,
    className = "",
    uppercase = true,
}: {
    label: string;
    value?: React.ReactNode;
    className?: string;
    uppercase?: boolean;
    employee?: Employee[];

}) {
    return (
        <div className={className}>
            <div className="text-secondary-emphasis fw-semibold mb-1">{label}</div>
            <div className={uppercase ? "fw-medium text-uppercase" : "fw-medium"}>
                {value ?? "-"}
            </div>
        </div>
    );
}

//En esta funcion colocaremos las sesiones para identificar quien firma 
export function OvertimeOne({
    overtime,
    departments = []
}: {
    overtime: OverTime | null;
    departments: Department[];
}) {

    // Aqui los const 
    const session = useSessionSnapshot();
    const [showUpdateConstancyModal, setShowUpdateConstancyModal] = useState(false);
    const [employeeSignatureModal, setEmployeeSignatureModal] = useState(false);
    const [showCurretUser, setCurrentUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const [involvedShow, setInvolvedShow] = useState(false);
    const router = useRouter();
    const [newArray, setNewArray] = useState<any[]>([]);



    useEffect(() => {
        if (!overtime) return;

        const signatures = Array.isArray(overtime.signatures)
            ? overtime.signatures
            : [];

        const employeeId = Number(overtime.idEmployee ?? overtime.employee?.id);

        const isLeader = departments.some(
            (dep) => Number(dep.idLeader) === employeeId
        );

        const tempArray: any[] = [];

        if (!isLeader) {
            for (const el of signatures) {
                if (Number(overtime.employee?.id) === Number(el.idSignatory)) {
                    tempArray.push({ ...el, label: "Empleado" });
                } else if (Number(overtime.leader?.id) === Number(el.idSignatory)) {
                    tempArray.push({ ...el, label: "Jefe Inmediato" });
                } else if (Number(overtime.personDoh?.id) === Number(el.idSignatory)) {
                    tempArray.push({ ...el, label: "Director DOH" });
                }
            }
        }

        setNewArray(tempArray);
    }, [overtime, departments]);



    const overallStatus = overtime?.status ?? "PENDING";
    const createdAt = safeDate(overtime?.createdAt ?? "dd/MM/yyyy HH:mm");


    // ============ Aqui los helpers ===============

    //crear
    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/overtime/create");
    };

    //Borrar
    const handleDeleteOvertime = async () => {
        if (!overtime?.id) {
            modalError("No se encontró el registro");
            return;
        }

        modalConfirm("¿Deseas eliminar este registro?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Eliminando registro...");

                const res = await deleteOverTime({ id: Number(overtime.id) });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/overtime");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    //Firma
    const handleEmployeeSignature = () => setEmployeeSignatureModal(true);

    //Regresar a pagina principal
    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");

        setTimeout(() => {
            router.push("/app/overtime");
        }, 100);
    }

    const upperCase = (text?: string) => {
        return text?.toUpperCase() || "";
    };

    const getEmployeeName = (u: OverTime) => {
        return u.employee
            ? `${upperCase(u.employee.lastName)} ${upperCase(u.employee.name)} `
            : `EMPLEADO #${u.idEmployee}`;
    };

    const getDate = (e: OverTime) => {
        return e.informationDate
            ? moment.utc(e.informationDate.dateInit).format("DD/MM/YYYY")
            : `${e.idEmployee}`
    }

    const getHourInit = (e: OverTime) => {
        return e.informationDate
            ? moment.utc(e.informationDate.hourInit, "HH:mm").format("HH:mm")
            : `${e.idEmployee}`
    }

    const getHourEnd = (e: OverTime) => {
        return e.informationDate
            ? moment.utc(e.informationDate.hourEnd, "HH:mm").format("HH:mm")
            : `${e.idEmployee}`
    }

    //Mensaje de error al encontrar
    if (!overtime) {
        return (
            <OvertimeOneError />
        )
    }



    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                    {/* Izquierda */}
                    <div className="d-flex gap-2 flex-wrap">

                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            disabled={loading}
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                        >
                            <i className="bi bi-plus-lg" />
                            Crear registro
                        </Button>

                        <Button
                            variant="danger"
                            onClick={handleDeleteOvertime}
                            disabled={loading}
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                        >
                            <i className="bi bi-trash" />
                            Eliminar registro
                        </Button>

                        <ConditionalRender cond={showCurretUser}>
                            <Button
                                variant="secondary"
                                onClick={handleEmployeeSignature}
                            >
                                Firmar
                            </Button>
                        </ConditionalRender>

                    </div>

                    {/* Derecha */}
                    <Button
                        variant="outline-secondary"
                        onClick={handleBack}
                        disabled={loading}
                        className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    >
                        <i className="bi bi-arrow-left" />
                        Regresar
                    </Button>

                </div>

                <div>
                    <h1 className="mb-1 ms-1">{getEmployeeName(overtime)}</h1>
                    <p className="text-muted mb-0 ms-1">
                        Información de la solicitud de horas extra.
                    </p>
                </div>

                <Card className="rounded-4 shadow-sm border mt-2">
                    <Card.Body className="p-4 p-md-5">
                        {/* Resumen */}
                        <div className="mb-4">
                            <div className="d-flex align-items-start flex-wrap gap-3">
                                <div>
                                    <h5 className="fw-semibold mb-1">
                                        Solicitud #{overtime.id}
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Horas extra
                                    </p>
                                </div>
                                <div className="mt-1 ms-2">
                                    {statusLabel(overallStatus)}
                                </div>
                            </div>
                        </div>

                        <Row className="g-4 mb-4">
                            <Col xs={12} md={4}>
                                <div className="fw-bold small text-uppercase">
                                    Creada
                                </div>
                                <div>
                                    {createdAt}
                                </div>
                            </Col>

                            <Col xs={12} md={4}>
                                <div className="fw-bold small text-uppercase">
                                    Creada por
                                </div>
                                <div>
                                    {fullName(overtime.createForPerson)}
                                </div>
                            </Col>

                            <Col xs={12} md={4}>
                                <div className="fw-bold small text-uppercase">
                                    Líder
                                </div>
                                <div>
                                    {fullName(overtime.leader)}
                                </div>
                            </Col>

                            <Col xs={12} md={4}>
                                <div className="fw-bold small text-uppercase">
                                    D.O.H
                                </div>
                                <div>
                                    {fullName(overtime.personDoh)}
                                </div>
                            </Col>
                        </Row>

                        <hr className="my-4" />

                        {/* Detalles */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-1">
                                Detalles del registro
                            </h5>
                            <p className="text-muted mb-3">
                                Consulta la fecha, horario y motivo registrado.
                            </p>

                            <Row className="g-4">
                                <Col xs={12}>
                                    <div className="fw-bold small text-uppercase">
                                        Motivo
                                    </div>
                                    <div>
                                        {overtime.motive ?? "—"}
                                    </div>
                                </Col>

                                <Col xs={12} md={3}>
                                    <div className="fw-bold small text-uppercase">
                                        Fecha
                                    </div>
                                    <div>
                                        {getDate(overtime)}
                                    </div>
                                </Col>

                                <Col xs={12} md={3}>
                                    <div className="fw-bold small text-uppercase">
                                        Hora inicio
                                    </div>
                                    <div>
                                        {getHourInit(overtime)}
                                    </div>
                                </Col>

                                <Col xs={12} md={3}>
                                    <div className="fw-bold small text-uppercase">
                                        Hora fin
                                    </div>
                                    <div>
                                        {getHourEnd(overtime)}
                                    </div>
                                </Col>

                                <Col xs={12} md={3}>
                                    <div className="fw-bold small text-uppercase">
                                        Total de horas
                                    </div>
                                    <div>
                                        {overtime.informationDate?.totalHours ?? "—"}
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Firmas */}
                        <FormBook dKey="newArray">
                            <FormPage title="" eventKey="newArray">
                                <Row className="g-3">
                                    {newArray.map((sign: any) => (
                                        <SignaturesViewOvertime
                                            id={Number(overtime?.id)}
                                            idEmployee={String(sign.idSignatory)}
                                            name={sign.name}
                                            url={sign.url}
                                            label={sign.label}

                                        />
                                    ))}
                                </Row>
                            </FormPage>
                        </FormBook>

                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}
