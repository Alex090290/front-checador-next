"use client";

import { useState } from "react";
import { Alert, Button, Card, Container } from "react-bootstrap";
import { useModals } from "@/context/ModalContext";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import PermissionGroupsSelector from "./PermissionGroupsSelector";
import { applyBasePermissions, getBasePermissions, updateBasePermissions } from "@/app/actions/employeePermissions-actions";
import { IBasePermissionsData } from "@/lib/employeePermissions/interface";
import { formatDateHours } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;

function formatAuthor(value: unknown) {
    if (!value) return "";
    if (typeof value === "string") return value;
    const v = value as { name?: string; email?: string };
    return v.name || v.email || "";
}

//Permisos base de empleados: se copian a cada empleado nuevo y con "Aplicar a todos" a los actuales
export default function BasePermissionsClient({
    initialData,
    errorMessage,
    canUpdate,
}: {
    initialData: IBasePermissionsData | null;
    errorMessage?: string;
    canUpdate: boolean;
}) {
    const { modalConfirm } = useModals();

    const [data, setData] = useState<IBasePermissionsData | null>(initialData);
    const [selected, setSelected] = useState<Set<string>>(new Set(initialData?.permissions ?? []));
    const [unknown, setUnknown] = useState<string[]>([]);
    const [feedback, setFeedback] = useState<FeedbackState>(errorMessage ? "error" : null);
    const [feedbackMsg, setFeedbackMsg] = useState(errorMessage ?? "");

    const saved = data?.permissions ?? [];
    const added = [...selected].filter((p) => !saved.includes(p)).length;
    const removed = saved.filter((p) => !selected.has(p)).length;
    const hasChanges = added > 0 || removed > 0;

    const showResult = (success: boolean, message: string) => {
        setFeedback(success ? "success" : "error");
        setFeedbackMsg(message);
    };

    const reload = async () => {
        const res = await getBasePermissions();
        if (res.success && res.data) {
            setData(res.data);
            setSelected(new Set(res.data.permissions));
        }
    };

    const handleSave = () => {
        modalConfirm("¿Guardar los permisos base?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Guardando...");

                const res = await updateBasePermissions([...selected]);

                if (!res.success) {
                    setUnknown(res.unknown);
                    showResult(false, res.message || "No se pudieron guardar los permisos base");
                    return;
                }

                setUnknown([]);
                await reload();
                showResult(true, res.message);
            } catch {
                showResult(false, "Error inesperado, intenta de nuevo");
            }
        });
    };

    const handleApply = () => {
        modalConfirm("Se agregarán los permisos base que le falten a cada empleado. No se le quita ningún permiso a nadie.", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Aplicando permisos base...");

                const res = await applyBasePermissions();

                if (!res.success) {
                    showResult(false, res.message || "No se pudieron aplicar los permisos base");
                    return;
                }

                await reload();
                showResult(true, res.message);
            } catch {
                showResult(false, "Error inesperado, intenta de nuevo");
            }
        });
    };

    const missing = data?.employeesMissingBase ?? 0;
    const author = formatAuthor(data?.updatedBy);

    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Cargando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay message={feedbackMsg} onDone={() => setFeedback(null)} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay message={feedbackMsg} onDone={() => setFeedback(null)} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>
                <div className="mb-4">
                    <h1 className="mb-0">Permisos de empleados</h1>
                    <span className="text-muted">
                        Estos son los permisos base: se asignan a cada empleado nuevo al crearlo. Para los empleados actuales usa «Aplicar a todos».
                    </span>
                    <ConditionalRender cond={!!data?.updatedAt}>
                        <div className="text-muted small mt-1">
                            Última modificación: {formatDateHours(data?.updatedAt ?? undefined)}{author ? ` · ${author}` : ""}
                        </div>
                    </ConditionalRender>
                </div>

                <ConditionalRender cond={!data}>
                    <Alert variant="warning" className="rounded-4">
                        <i className="bi bi-exclamation-triangle me-2" />
                        {errorMessage || "No se pudieron cargar los permisos base"}
                    </Alert>
                </ConditionalRender>

                {data && (
                    <>
                        <ConditionalRender cond={!canUpdate}>
                            <Alert variant="warning" className="rounded-4 small">
                                <i className="bi bi-lock me-2" />
                                No cuentas con el permiso para cambiar los permisos de empleados; solo puedes consultarlos.
                            </Alert>
                        </ConditionalRender>

                        {/* APLICAR A TODOS */}
                        <Card className="rounded-4 shadow-sm border mb-3">
                            <Card.Body className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <div className="fw-semibold d-flex align-items-center gap-2">
                                        <i className={`bi ${missing > 0 ? "bi-people text-warning" : "bi-check-circle text-success"}`} />
                                        {missing > 0
                                            ? `${missing} empleado${missing !== 1 ? "s" : ""} activo${missing !== 1 ? "s" : ""} no tiene${missing !== 1 ? "n" : ""} todos los permisos base.`
                                            : "Todos los empleados tienen los permisos base."}
                                    </div>
                                    <ConditionalRender cond={hasChanges}>
                                        <small className="text-muted">Guarda los cambios antes de aplicar a todos.</small>
                                    </ConditionalRender>
                                </div>

                                <Button
                                    variant="primary"
                                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3 flex-shrink-0"
                                    disabled={!canUpdate || hasChanges}
                                    onClick={handleApply}
                                >
                                    <i className="bi bi-people" />
                                    Aplicar a todos
                                </Button>
                            </Card.Body>
                        </Card>

                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-3 p-md-4">
                                <ConditionalRender cond={unknown.length > 0}>
                                    <Alert variant="danger" className="rounded-3 small py-2">
                                        <i className="bi bi-exclamation-circle me-2" />
                                        Estos permisos no existen en el catálogo: {unknown.join(", ")}
                                    </Alert>
                                </ConditionalRender>

                                <PermissionGroupsSelector
                                    idPrefix="base-permissions"
                                    catalog={data.catalog}
                                    selected={selected}
                                    onChange={setSelected}
                                    readOnly={!canUpdate}
                                />

                                <div className="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-sm-center gap-2 pt-3 border-top">
                                    <small className="text-muted">
                                        Cambios sin guardar: +{added}, −{removed} · {selected.size} permiso{selected.size !== 1 ? "s" : ""} base
                                    </small>

                                    <div className="d-flex flex-column-reverse flex-sm-row gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={!hasChanges}
                                            onClick={() => {
                                                setSelected(new Set(saved));
                                                setUnknown([]);
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="button" variant="success" disabled={!canUpdate || !hasChanges} onClick={handleSave}>
                                            Guardar
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Container>
        </>
    );
}
