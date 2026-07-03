"use client"

import { Department } from "@/lib/definitions";
import { ISignatures, OverTime } from "@/lib/overTime/interface";
import { useEffect, useState } from "react";
import { useModals } from "@/context/ModalContext";
import OvertimeOneError from "./overtimeMessageError";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { deleteOverTime } from "@/app/actions/overtime-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import moment from "moment";
import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { FormBook, FormPage } from "../templates/FormView";
import SignaturesViewOvertime from "./signaturesOvertime";
import { IFiltercUrl } from "@/lib/constancy/interface";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import OvertimeSignatureModal from "./OvertimeSignatureModal"
import SignatureLeaderModal from "./SignatureLeaderModal";
import SignatureDohModal from "./SignatureDohModal";
import OverLay from "../templates/OverLay";


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



//En esta funcion colocaremos las sesiones para identificar quien firma 
export function OvertimeOne({
    overtime,
    departments = [],
    connfigSystem,
}: {
    overtime: OverTime | null;
    departments: Department[];
    connfigSystem: IConfigSystem[];
}) {

    // Aqui los const 
    const session = useSessionSnapshot();
    const userSession = session?.uid;
    const [showCurretUser, setCurrentUser] = useState(false);
    const [showCurrentLeader, setCurrentLeader] = useState(false);
    const [showCurrentDoh, setCurrentDoh] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const router = useRouter();
    const [newArray, setNewArray] = useState<ISignatures[]>([]);
    const [overtimeSignatureModal, setOvertimeSignatureModal] = useState(false);
    const [signatureLeaderModal, setSignatureLeaderModal] = useState(false);
    const [signatureDohModal, setSignatureDohModal] = useState(false);

    const handleOvertimeSignature = () => setOvertimeSignatureModal(true);
    const handleSignatureLeader = () => setSignatureLeaderModal(true);
    const handleSignatureDoh = () => setSignatureDohModal(true);


    const signatures: ISignatures[] = overtime?.signatures ?? [];

    const isOwnerEmployee =
        userSession?.role === "EMPLOYEE" &&
        Number(userSession?.idEmployee) === Number(overtime?.employee?.id);

        const isOwnerLeader = 
        userSession?.roles.isLeader &&
        Number(userSession.isLeader) === Number(overtime?.leaderApproval);

    // const currentUser = isOwnerEmployee ? signatures.find((el: IFiltercUrl) => Number(el.idSignatory) === Number(session?.uid?.idEmployee)) : undefined;
    const currentUser = isOwnerEmployee
        ? signatures.find((el: IFiltercUrl) => Number(el.idSignatory))
        : undefined;

    const currentLeader = isOwnerLeader
        ? signatures.find((el: IFiltercUrl) => Number(el.idSignatory)) 
        : undefined;

    const currentDoh = session?.uid?.roles.isDoh
        ? signatures.find((el: IFiltercUrl) => Number(el.idSignatory) === Number(userSession?.idEmployee)) : undefined;

    useEffect(() => {
        if (currentUser && !currentUser.url) {
            setCurrentUser(true);
        } else {
            setCurrentUser(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentLeader && !currentLeader.url) {
            setCurrentLeader(true);
        } else {
            setCurrentLeader(false);
        }
    }, [currentLeader]);

    useEffect(() => {
        if (currentDoh && !currentDoh.url) {
            setCurrentDoh(true);
        } else {
            setCurrentDoh(false);
        }
    }, [currentDoh]);

    //  setNewArray(signatures);


    useEffect(() => {
        if (!overtime?.signatures) return;
        setNewArray(overtime?.signatures);


    }, [overtime]);

    console.log("Sesion:", session);


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

            <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                    {/* Izquierda */}
                    <div className="d-flex gap-2 flex-wrap">
                        <OverLay string="Crear registro">
                            <Button
                                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                variant="primary"
                                onClick={handleCreate}
                                disabled={loading}
                            >
                                <i className="bi bi-plus-lg" />

                                <span className="d-none d-md-inline ms-2">
                                    Crear registro
                                </span>
                            </Button>
                        </OverLay>


                        <OverLay string="Eliminar registro">
                            <Button
                                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                variant="danger"
                                onClick={handleDeleteOvertime}
                                disabled={loading}
                            >
                                <i className="bi bi-trash" />

                                <span className="d-none d-md-inline ms-2">
                                    Eliminar registro
                                </span>
                            </Button>
                        </OverLay>

                        <OverLay string="Firmar">
                            <ConditionalRender cond={showCurretUser}>
                                <Button
                                    className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                    variant="warning"
                                    onClick={handleOvertimeSignature}
                                    disabled={loading}
                                >
                                    <i className="bi bi-pen-fill" />

                                    <span className="d-none d-md-inline ms-2">
                                        Firmar
                                    </span>
                                </Button>
                            </ConditionalRender>
                        </OverLay>

                        <OverLay string="Aprobar">
                            <ConditionalRender cond={showCurrentLeader}>
                                <Button
                                    className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                    variant="success"
                                    onClick={handleSignatureLeader}
                                    disabled={loading}
                                >
                                    <i className="bi bi-check-circle" />

                                    <span className="d-none d-md-inline ms-2">
                                        Aprobar
                                    </span>
                                </Button>
                            </ConditionalRender>
                        </OverLay>

                        <OverLay string="Firmar de enterado">
                            <ConditionalRender cond={showCurrentDoh}>
                                <Button
                                    className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                                    variant="secondary"
                                    onClick={handleSignatureDoh}
                                    disabled={loading}
                                >
                                    <i className="bi bi-card-checklist" />

                                    <span className="d-none d-md-inline ms-2">
                                        Firmar de enterado
                                    </span>
                                </Button>
                            </ConditionalRender>
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
                    <h1 className="mb-1 ms-1">{getEmployeeName(overtime)}</h1>
                    <p className="text-muted mb-0 ms-1">
                        Información de la solicitud de horas extra.
                    </p>
                </div>

                <Card className="border shadow-sm rounded-4 mt-2">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h5 className="mb-1 fw-bold">
                                    Solicitud #{overtime.id}
                                </h5>

                                <p className="text-muted mb-0">
                                    Horas extra
                                </p>
                            </div>

                            {statusLabel(overallStatus)}
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
                                                    <span className="text-muted">Creada</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {createdAt}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-person text-success" />
                                                    <span className="text-muted">Creada por</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {fullName(overtime.createForPerson)}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-person-workspace text-warning" />
                                                    <span className="text-muted">Líder</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {fullName(overtime.leader)}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-person-check text-info" />
                                                    <span className="text-muted">D.O.H.</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {fullName(overtime.personDoh)}
                                                </span>
                                            </div>
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
                                                    Detalles del registro
                                                </h6>

                                                <p className="text-muted mb-0 small">
                                                    Consulta la fecha, horario y motivo registrado.
                                                </p>
                                            </div>

                                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                                                Registro
                                            </span>
                                        </div>

                                        <div className="d-flex flex-column gap-4">
                                            <div className="border rounded-3 p-3">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="bi bi-chat-left-text text-primary" />
                                                    <span className="text-muted fw-semibold">
                                                        Motivo
                                                    </span>
                                                </div>

                                                <div className="text-uppercase">
                                                    {overtime.motive ?? "—"}
                                                </div>
                                            </div>

                                            <Row className="g-3">
                                                <Col xs={12} md={6} xl={3}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-calendar-event text-success fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Fecha
                                                        </div>

                                                        <div className="fw-semibold">
                                                            {getDate(overtime)}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} xl={3}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-clock text-warning fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Hora inicio
                                                        </div>

                                                        <div className="fw-semibold">
                                                            {getHourInit(overtime)}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} xl={3}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-clock-history text-danger fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Hora fin
                                                        </div>

                                                        <div className="fw-semibold">
                                                            {getHourEnd(overtime)}
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col xs={12} md={6} xl={3}>
                                                    <div className="border rounded-3 p-3 text-center h-100">
                                                        <i className="bi bi-hourglass-split text-info fs-5 mb-2 d-block" />

                                                        <div className="text-muted small">
                                                            Total horas
                                                        </div>

                                                        <div className="fw-bold fs-5">
                                                            {overtime.informationDate?.totalHours ?? "—"}
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* FIRMAS */}
                        <Card className="border rounded-4">
                            <Card.Body>
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h6 className="mb-0 fw-bold">
                                        Firmas
                                    </h6>

                                    <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                                        Autorizaciones
                                    </span>
                                </div>

                                <FormBook dKey="newArray">
                                    <FormPage title="" eventKey="newArray">
                                        <Row className="g-3">
                                            {newArray.map((sign) => (
                                                <SignaturesViewOvertime
                                                    key={`${sign.id}-${sign.url}`}
                                                    id={Number(overtime?.id)}
                                                    idEmployee={String(sign.idSignatory)}
                                                    name={sign.name}
                                                    url={sign.url}
                                                    label={sign.label}
                                                    status={overtime.status}
                                                />
                                            ))}
                                        </Row>
                                    </FormPage>
                                </FormBook>
                            </Card.Body>
                        </Card>

                        {/* MODALES ;) */}
                        <OvertimeSignatureModal
                            show={overtimeSignatureModal}
                            onHide={() => setOvertimeSignatureModal(false)}
                            id={String(overtime.id)}
                        />

                        <SignatureLeaderModal
                            show={signatureLeaderModal}
                            onHide={() => setSignatureLeaderModal(false)}
                            id={String(overtime.id)}
                        />

                        <SignatureDohModal
                            show={signatureDohModal}
                            onHide={() => setSignatureDohModal(false)}
                            id={String(overtime.id)}
                        />
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}
