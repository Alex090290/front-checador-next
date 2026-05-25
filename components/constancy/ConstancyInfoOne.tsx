"use client";

import { useModals } from "@/context/ModalContext";
import { Constancy } from "@/lib/constancy/interface";
import { ActionResponse } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button } from "react-bootstrap";
import ModalBlur from "../ModalBlur";
import UpdateConstancy from "./UpdateConstancy";
import { deleteConstancy, updateConstancy } from "@/app/actions/constancy-actions";
import moment from "moment";
import { EmployeeLite } from "../configSystem/formUpdate";

function formatText(value?: string | number | null) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function InfoItem({
    label,
    value,
    className = "",
    uppercase = true,
    employees = [],
}: {
    label: string;
    value?: React.ReactNode;
    className?: string;
    uppercase?: boolean;
    employees?: EmployeeLite[];
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

export function ConstancyOne({
    constancy,
    employees = [],
}: {
    constancy: Constancy | null;
    employees?: EmployeeLite[];
}) {
    const [showUpdateConstancyModal, setShowUpdateConstancyModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();

    const router = useRouter();

    // Usar "capitalize para hacer la primer letra del nombre o apellido mayuscula"
    const capitalize = (text?: string) => {
    if (!text) return "";

    return text
        .toLowerCase()
        .split(" ")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

    const getEmployeeName = (u: Constancy) => {
        const employee = employees.find(
            (e) => Number(e.id) === Number(u.idEmployee)
        );

        return employee
        // Convertimos a MAYUSCULA 
        ? `${capitalize(employee.name)} ${capitalize(employee.lastName)}`
            : `Empleado #${u.idEmployee}`;
    };

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

// Cuando se manda a llamar la fecha y la hora de la constancia hay que mandarla llamar asoi para separarla 
const getDate = (u: Constancy) =>
    u.dateAndTimeOfTheEvents
        ? moment.utc(u.dateAndTimeOfTheEvents).format("DD/MM/YYYY")
        : u.dateTheEvents ?? "-";

const getHour = (u: Constancy) =>
    u.dateAndTimeOfTheEvents
        ? moment.utc(u.dateAndTimeOfTheEvents).format("HH:mm")
        : u.hourTheEvents ?? "-";

return (
    <>
        <ConditionalRender cond={loading}>
            <Loading message={messageLoading} />
        </ConditionalRender>

        {/* Botones principales */}
        <div className="d-flex flex-wrap align-items-center gap-2 my-2">
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
                    <h5 className="mb-3 text-uppercase fw-bold">
                        Antecedentes
                    </h5>

                    <div className="d-flex flex-wrap gap-2">
                        {constancy.backgroundIds?.length ? (
                            constancy.backgroundIds.map((backgroundIds) => (
                                <span key={backgroundIds} className="badge text-bg-secondary">
                                    Antecedente #{backgroundIds}
                                </span>
                            ))
                        ) : (
                            <span className="text-muted">Sin antecedentes</span>
                        )}
                    </div>
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

            {/* Firmas */}
            <section className="card border-0 shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3 text-uppercase fw-bold">
                        Firmas
                    </h5>

                    <div className="row g-3">
                        {constancy.signatures?.length ? (
                            constancy.signatures.map((signature) => (
                                <div key={signature.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="border rounded-3 p-3 h-100">
                                        <div className="fw-semibold text-uppercase fs-5">
                                            {signature.name}
                                        </div>

                                        <div className="small text-muted">
                                            Firmante #{signature.idSignatory}
                                        </div>

                                        <div className="mt-2">
                                            <span
                                                className={`badge ${signature.sendNotify
                                                    ? "text-bg-success"
                                                    : "text-bg-secondary"
                                                    }`}
                                            >
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12">
                                <span className="text-muted">Sin firmas</span>
                            </div>
                        )}
                    </div>
                </div>
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

    </>
);

}


