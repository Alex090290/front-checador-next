"use client";

import { useModals } from "@/context/ModalContext";
import { Constancy } from "@/lib/constancy/interface";
import { ActionResponse, Employee } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Accordion, Row, Col, Container } from "react-bootstrap";
import ModalBlur from "../ModalBlur";
import UpdateConstancy from "./UpdateConstancy";
import { deleteConstancy, updateConstancy } from "@/app/actions/constancy-actions";
import moment from "moment";
import { EmployeeLite } from "../configSystem/formUpdate";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { FormBook, FormPage } from "../templates/FormView";
import SignaturesViewConstancy from "./SignaturesViewConstancy";
import ConstancySignatureModal from "./ConstancySignatureModal" 
import { id } from "date-fns/locale";

function formatText(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
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
export function ConstancyOne({
    constancy
}: {
    constancy: Constancy | null;
    employees?: EmployeeLite[];
}) {

    const session = useSessionSnapshot();

    console.log("Sesion: ", session)

    const [showUpdateConstancyModal, setShowUpdateConstancyModal] = useState(false);
    const [employeeSignatureModal, setEmployeeSignatureModal] = useState(false);
    const [showCurretUser, setCurrentUser] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();

    const router = useRouter();

    //Funcion para detectar firmas (Quien va a firmar?, por token de sesion)

    const signatures = Array.isArray(constancy?.signatures)
        ? constancy!.signatures
        : [];


    const currentUser = constancy?.signatures?.find (
        (el: any) => Number(el.idSignatory) === Number(session?.uid?.idEmployee)
    );

    useEffect(() => {
        if(currentUser && !currentUser.url) {
            setCurrentUser(true);
        } else {
            setCurrentUser(false);
        }
    }, [currentUser]);
    
    //Mis helpers jiji


    // Usar "capitalize para hacer la primer letra del nombre o apellido mayuscula"
    const capitalize = (text?: string) => {
        if (!text) return "";

        return text
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getEmployeeName = (u: Constancy) => {
        return u.employee
            ? `${capitalize(u.employee.name)} ${capitalize(u.employee.lastName)}`
            : `Empleado #${u.idEmployee}`;
    };

    const hasBackgrounds = Boolean(constancy?.backgrounds?.length);


    if (!constancy) {
        return (
            // Mensaje de error al encontrar constancia (puede reutilizarse)
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">

                                <div className="mb-4">
                                    <i
                                        className="bi bi-file-earmark-x text-danger"
                                        style={{ fontSize: "4rem" }}
                                    />
                                </div>

                                <h2 className="fw-bold mb-3">
                                    Constancia no encontrada
                                </h2>

                                <p className="text-muted mb-4">
                                    La constancia que intentas consultar no existe,
                                    fue eliminada o no se encuentra disponible.
                                </p>

                                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                                    <Button
                                        variant="primary"
                                        onClick={() => router.push("/app/constancy")}
                                    >
                                        <i className="bi bi-arrow-left me-2" />
                                        Volver al listado
                                    </Button>

                                    <Button
                                        variant="outline-primary"
                                        onClick={() => router.push("/app/constancy/create")}
                                    >
                                        <i className="bi bi-plus-lg me-2" />
                                        Nueva constancia
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const handleUpdateConstancy = async (
        data: Constancy
    ): Promise<ActionResponse<boolean | null>> => {
        if (!constancy?.id) {
            return {
                success: false,
                message: "No se encontró la constancia",
                data: null,
            };
        }

        const res = await updateConstancy({
            id: Number(constancy.id),
            constancy: data,
        });

        if (!res.success) {
            modalError(res.message);
            return {
                success: false,
                message: res.message,
                data: null,
            };
        }

        toast.success(res.message);

        return {
            success: true,
            message: res.message,
            data: true,
        };
    };

    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/constancy/create");
    };

    const handleDeleteConstancy = async () => {
        if (!constancy?.id) {
            modalError("No se encontró la constancia");
            return;
        }

        modalConfirm("¿Deseas eliminar esta constancia?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Eliminando constancias...");

                const res = await deleteConstancy({ id: Number(constancy.id) });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/constancy");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    const handleEmployeeSignature = () => setEmployeeSignatureModal(true);

    // Cuando se manda a llamar la fecha y la hora de la constancia hay que mandarla llamar asoi para separarla 
    const getDate = (u: Constancy) =>
        u.dateAndTimeOfTheEvents
            ? moment.utc(u.dateAndTimeOfTheEvents).format("DD/MM/YYYY")
            : u.dateTheEvents ?? "-";

    const getHour = (u: Constancy) =>
        u.dateAndTimeOfTheEvents
            ? moment.utc(u.dateAndTimeOfTheEvents).format("HH:mm")
            : u.hourTheEvents ?? "-";

    console.log("BACKGROUNDS:", constancy.backgrounds);

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Row className="g-3 align-items-center mb-3">

                {/* Botones principales */}
                <Col xs={12} lg={6}>
                    <div className="d-flex flex-wrap gap-2 mt-5">

                        <Button
                            size="sm"
                            variant="primary"
                            className="fw-semibold d-inline-flex align-items-center gap-2"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            <i className="bi bi-plus-lg" />
                            Crear Constancia
                        </Button>

                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setShowUpdateConstancyModal(true)}
                            disabled={loading}
                        >
                            <i className="bi bi-pencil me-2" />
                            Actualizar Constancia
                        </Button>

                        <Button
                            size="sm"
                            variant="danger"
                            onClick={handleDeleteConstancy}
                            disabled={loading}
                        >
                            <i className="bi bi-trash me-2" />
                            Eliminar Constancia
                        </Button>

                    </div>
                </Col>

                {/* ========================================================================= */}
                {/* Botones de firmas */}
                <Col xs={12} lg={6}>
                        <div className="d-flex justify-content-lg-end justify-content-start flex-wrap gap-2">

                            <ConditionalRender cond={showCurretUser}>
                                <Button
                                    size="sm"
                                    variant="warning"
                                    className="fw-bold fs-5 text-white px-3 py-2 shadow-sm rounded-2 mt-5 bg-warning border-0 me-1"
                                    onClick={handleEmployeeSignature}
                                >
                                    Firmar
                                </Button>
                            </ConditionalRender>
                        </div>
                </Col>
                {/* ======================================================================= */}
            </Row>

            {/* Aqui empieza el cuerpo, los datos generales de la constancia  */}
            <div className="mb-4">
                <h1 className="mb-0 text-white">
                    {getEmployeeName(constancy)}
                </h1>
            </div>

            <div className="d-grid gap-4">

                {/* Datos del incidente */}

                <section className="card border-0 shadow-sm">
                    <div className="card-body">
                        <h5 className="mb-3 text-uppercase fw-bold">
                            Datos del incidente
                        </h5>

                        <div className="row g-4">
                            <div className="col-12 col-md-4">
                                <InfoItem
                                    label="Fecha"
                                    value={getDate(constancy)}
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <InfoItem
                                    label="Hora"
                                    value={getHour(constancy)}
                                    uppercase={false}
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <InfoItem
                                    label="Lugar"
                                    value={formatText(constancy.sceneOfTheEvents)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Antecedentes */}
                <section className="card border-0 shadow-sm">
                    <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 text-uppercase fw-bold">
                                Antecedentes
                            </h5>

                            <span
                                className={`badge rounded-pill px-3 py-2 fw-semibold ${constancy.backgrounds?.length
                                    ? "bg-danger-subtle text-danger-emphasis border border-danger-subtle"
                                    : "bg-success-subtle text-success-emphasis border border-success-subtle"
                                    }`}
                            >
                            </span>
                        </div>

                        {constancy.backgrounds?.length ? (

                            <Accordion defaultActiveKey="0" alwaysOpen>

                                {constancy.backgrounds.map((background, index) => (

                                    <Accordion.Item
                                        key={background.id}
                                        eventKey={String(index)}
                                        className="border rounded-3 mb-3 overflow-hidden"
                                    >

                                        <Accordion.Header>
                                            <div className="d-flex flex-column text-start">
                                                <span className="fw-semibold">
                                                    Constancia #{background.id}
                                                </span>

                                                <small className="text-muted">
                                                    {getDate(background)} · {getHour(background)}
                                                </small>
                                            </div>
                                        </Accordion.Header>

                                        <Accordion.Body>

                                            <div className="row g-3">

                                                {/* Fecha */}
                                                <div className="col-12 col-md-4">
                                                    <InfoItem
                                                        label="Fecha"
                                                        value={getDate(background)}
                                                    />
                                                </div>

                                                {/* Hora */}
                                                <div className="col-12 col-md-4">
                                                    <InfoItem
                                                        label="Hora"
                                                        value={getHour(background)}
                                                        uppercase={false}
                                                    />
                                                </div>

                                                {/* Lugar */}
                                                <div className="col-12 col-md-4">
                                                    <InfoItem
                                                        label="Lugar"
                                                        value={formatText(background.sceneOfTheEvents)}
                                                    />
                                                </div>

                                                {/* Penalizaciones */}
                                                <div className="col-12">
                                                    <div className="border rounded-3 p-3">

                                                        <div className="text-secondary-emphasis fw-semibold mb-2">
                                                            Penalización
                                                        </div>

                                                        <div className="d-flex flex-wrap gap-2">

                                                            {background.typeOfPenalty?.length ? (

                                                                background.typeOfPenalty.map((penalty) => (

                                                                    <span
                                                                        key={penalty.id}
                                                                        className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-semibold"
                                                                    >
                                                                        {penalty.name}
                                                                    </span>

                                                                ))

                                                            ) : (
                                                                <span className="text-muted">
                                                                    Sin penalización
                                                                </span>
                                                            )}

                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Firmantes */}
                                                <div className="col-12">
                                                    <div className="border rounded-3 p-3">
                                                        <div className="text-secondary-emphasis fw-semibold mb-2">
                                                            Firmantes
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {background.signatures?.length ? (
                                                                background.signatures.map((witness) => (
                                                                    <span
                                                                        key={witness.id}
                                                                        className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle px-3 py-2 fw-semibold"
                                                                    >
                                                                        {capitalize(witness.name)}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted">
                                                                    Sin testigos
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="alert alert-success mb-0">
                                Este empleado no cuenta con antecedentes registrados.
                            </div>
                        )}
                    </div>
                </section>

                {/* Penalizaciones */}
                <section className="card border-0 shadow-sm">
                    <div className="card-body">
                        <h5 className="mb-3 text-uppercase fw-bold">
                            Tipo de penalización
                        </h5>

                        <div className="d-flex flex-wrap gap-2">
                            {constancy.typeOfPenalty?.length ? (
                                constancy.typeOfPenalty.map((penalty) => (
                                    <span key={penalty.id} className="badge rounded-pill bg-warning-subtle text-warning border border-warning px-5 py-2 fw-semibold fs-5">
                                        {penalty.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-muted">Sin penalización</span>
                            )}
                        </div>
                    </div>
                </section>

                {/* Testigos */}
                <section className="card border-0 shadow-sm">
                    {/* Firmas */}
                    <FormBook dKey="signatures">
                        {signatures.length > 0 && (
                            <FormPage title="Firmantes" eventKey="signatures">
                                <Container>
                                    <Row className="g-2 py-2">
                                        {signatures.map((sign) => (
                                            <SignaturesViewConstancy
                                                key={sign.id}
                                                id={(constancy.id)}
                                                idEmployee={String(sign.idSignatory)}
                                                name={String(sign.name)}
                                            />
                                        ))}
                                    </Row>
                                </Container>
                            </FormPage>
                        )}
                    </FormBook>
                </section>

            </div>
            <ConditionalRender cond={showUpdateConstancyModal}>
                <ModalBlur onClose={() => setShowUpdateConstancyModal(false)}>
                    <UpdateConstancy
                        show={showUpdateConstancyModal}
                        onHide={() => setShowUpdateConstancyModal(false)}
                        sendData={handleUpdateConstancy}
                        constancy={constancy}
                    />
                </ModalBlur>
            </ConditionalRender>

            
            {/* Modal para firmar  */}

            <ConstancySignatureModal
                show={employeeSignatureModal}
                onHide={() => setEmployeeSignatureModal(false)}
                id={String(constancy.id)}
            />
        </>
    );

}


