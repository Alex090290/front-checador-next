"use client"

import { IDevices } from "@/lib/devices/interface"
import { Button, Card, Col, Collapse, Container, Row } from "react-bootstrap"
import OverLay from "../templates/OverLay"
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { formatCreatedAt, formatCreatedAtOnlyHours } from "@/lib/helpers";

function statusVariant(status: string) {
    switch ((status ?? "")) {
        case "activo":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                    ACTIVO
                </span>
            )
        case "inactivo":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    INACTIVO
                </span>
            )
    }
}

type Props = {
    device: IDevices
}

export function DeviceOne({
    device
}: Props) {

    //AUI LOS CONST
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
    const activeCheck = device?.networkInfo.find((c) => String(c.id) === activeCheckId); //CAMBIAR A ID

    //HELPERS
    const upperCase = (text?: string) => {
        return text?.toUpperCase() || "";
    };

    const getEmployeeName = (u: IDevices | null | undefined) => {
        if (!u?.employee) return "SIN EMPLEADO ASIGNADO";

        return u.employee.id
            ? `${upperCase(u.employee?.lastName)} ${upperCase(u.employee?.name)}`
            : `EMPLEADO #${u.employee.id}`;
    };

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando datos...");

        setTimeout(() => {
            router.push("/app/devices");
        }, 100);
    }

    if(!device){
        return(
            <div> NO HAY REGISTROS</div>
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
                                // onClick={}
                                disabled={loading}
                            >
                                <i className="bi bi-trash" />

                                <span className="d-none d-md-inline ms-2">
                                    Actualizar
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
                    <h1 className="mb-1 ms-1">{getEmployeeName(device)}</h1>
                    <p className="text-muted mb-0 ms-1">
                        Información de la asignación de dispositivo.
                    </p>
                </div>

                <Card className="border shadow-sm rounded-4 mt-2">
                    <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h5 className="mb-1 fw-bold">
                                    Registro #{device?.id}
                                </h5>

                                <p className="text-muted mb-0">
                                    DISPOSITIVO VINCULADO
                                </p>
                            </div>

                            {statusVariant(device?.status)}
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
                                                    {formatCreatedAt(device.createdAt)}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-clock" />
                                                    <span className="text-muted">Hora de creación</span>
                                                </div>

                                                <span className="fw-semibold text-end">
                                                    {formatCreatedAtOnlyHours(device.createdAt)}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-columns-gap text-info" />
                                                    <span className="text-muted">Departamento</span>
                                                </div>

                                                <span className="fw-semibold text-end text-uppercase">
                                                    {device.department?.nameDepartment}
                                                </span>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-building text-warning" />
                                                    <span className="text-muted">Sucursal</span>
                                                </div>

                                                <span className="fw-semibold text-end text-uppercase">
                                                    {device.branch?.name}
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
                                                    Consulta la .
                                                </p>
                                            </div>

                                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                                                Dispositivo
                                            </span>
                                        </div>

                                        <div className="d-flex flex-column gap-4">
                                            <div className="border rounded-3 p-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-journal-text text-primary" />
                                                    <span className="text-muted fw-semibold">Notas adicionales</span>
                                                </div>
                                                <div className="text-uppercase">
                                                    {device.notes}
                                                </div>
                                            </div>

                                            <Row className="justify-content-between">
                                                <Row className="g-1">
                                                    {device.networkInfo.map((n) => {
                                                        const key = String(n.id) //CAMBIAR A ID
                                                        const isActive = activeCheckId === key;

                                                        return (
                                                            <Col key={key} xs={12} sm={12} md={6} lg={6} xl={4}>
                                                                <div
                                                                    role="button"
                                                                    onClick={() => setActiveCheckId(isActive ? null : key)}
                                                                    className={`border rounded-3 p-3 h-100 ms-2 ${isActive ? "border-primary" : ""
                                                                        }`}
                                                                >
                                                                    <div className="d-flex align-items-between gap-2 fw-bold">
                                                                        NetworkInfo
                                                                        <i
                                                                            className={`bi ms-auto ${isActive ? " bi-chevron-up" : "bi-chevron-down"
                                                                                }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        )
                                                    })}
                                                </Row>

                                                <Collapse in={!!activeCheck}>
                                                    <div>
                                                        <div
                                                            key={activeCheck?.mac}
                                                            className="border rounded-3 p-3 me-2 ms-1 collapse-detail-enter"
                                                        >
                                                            <Row className="g-3">
                                                                {/* Columna de estadísticas */}
                                                                <Col xs={12} lg={12}>
                                                                    <div className="d-flex flex-column gap-2 h-100">
                                                                        <div className="border rounded-3 p-1 d-flex align-items-center gap-3">
                                                                            <i className="bi bi-hash text-primary fs-5" />
                                                                            <div>
                                                                                <div className="small fw-bold">Mac:
                                                                                    <span className="fw-bold text-capitalize text-muted ms-1">
                                                                                        {activeCheck?.mac}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="border rounded-3 p-1 d-flex align-items-center gap-3">
                                                                            <i className="bi bi-clock text-primary fs-5" />
                                                                            <div>
                                                                                <div className="small fw-bold">IP:
                                                                                    <span className="fw-semibold text-muted ms-1">
                                                                                        {activeCheck?.ip}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="border rounded-3 p-1 d-flex align-items-center gap-3">
                                                                            <i className="bi bi-patch-check text-primary fs-5" />
                                                                            <div>
                                                                                <div className="small fw-bold">Descripción:
                                                                                    <span className="fw-semibold text-capitalize text-muted ms-1">
                                                                                        {activeCheck?.description || "NO HAY DESCRIPCION"}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="border rounded-3 p-1 d-flex align-items-center gap-3">
                                                                            <i className="bi bi-file-earmark-check text-primary fs-5" />
                                                                            <div>
                                                                                <div className="small fw-bold">Hostname:
                                                                                    <span className="fw-semibold text-capitalize text-muted ms-1">
                                                                                        {activeCheck?.hostname || "--"}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>


                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </div>

                                                    </div>
                                                </Collapse>
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

                                {/* <FormBook dKey="newArray">
                                    <FormPage title="" eventKey="newArray">
                                        <Row className="g-3">
                                            {signatures.map((sign) => (
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
                                </FormBook> */}
                            </Card.Body>
                        </Card>


                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}
