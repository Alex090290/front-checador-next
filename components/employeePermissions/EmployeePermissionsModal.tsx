"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Button } from "react-bootstrap";
import { useModals } from "@/context/ModalContext";
import ModalBlur from "../ModalBlur";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import PermissionGroupsSelector from "./PermissionGroupsSelector";
import { getBasePermissions, getEmployeePermissions, updateEmployeePermissions } from "@/app/actions/employeePermissions-actions";
import { IEmployeePermissionsData, PermissionCatalogItem } from "@/lib/employeePermissions/interface";

//Permisos individuales de un empleado (módulo Empleados). Los que también son base llevan la etiqueta "base"
export default function EmployeePermissionsModal({
    idEmployee,
    canUpdate,
    onClose,
    onResult,
}: {
    idEmployee: number;
    canUpdate: boolean;
    onClose: () => void;
    onResult: (success: boolean, message: string) => void;
}) {
    const { modalConfirm } = useModals();

    const [data, setData] = useState<IEmployeePermissionsData | null>(null);
    const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unknown, setUnknown] = useState<string[]>([]);
    // El error de guardar se muestra dentro del modal (sigue abierto para corregir)
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        let active = true;

        // El catálogo viene con los permisos base (mismo permiso: listar_permisos_empleados)
        Promise.all([getEmployeePermissions(idEmployee), getBasePermissions()])
            .then(([emp, base]) => {
                if (!active) return;

                if (!emp.success || !emp.data) {
                    onResult(false, emp.message || "No se pudieron cargar los permisos del empleado");
                    onClose();
                    return;
                }

                setData(emp.data);
                setSelected(new Set(emp.data.permissions));
                setCatalog(base.data?.catalog ?? emp.data.permissions.map((text, i) => ({ id: i, text })));
            })
            .catch(() => {
                if (!active) return;
                onResult(false, "No se pudieron cargar los permisos del empleado");
                onClose();
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEmployee]);

    const saved = data?.permissions ?? [];
    const base = data?.base ?? [];
    const added = [...selected].filter((p) => !saved.includes(p)).length;
    const removed = saved.filter((p) => !selected.has(p)).length;
    const hasChanges = added > 0 || removed > 0;
    const missingBase = base.filter((p) => !selected.has(p));

    const handleSave = () => {
        const name = data ? `${data.lastName} ${data.name}`.trim() : "el empleado";

        modalConfirm(`¿Guardar los permisos de ${name}? Aplica desde su siguiente petición.`, async () => {
            setSaving(true);
            setSaveError("");
            try {
                const res = await updateEmployeePermissions(idEmployee, [...selected]);

                if (!res.success) {
                    setUnknown(res.unknown);
                    setSaveError(res.message || "No se pudieron guardar los permisos del empleado");
                    return;
                }

                onResult(true, res.message);
                onClose();
            } catch {
                setSaveError("Error inesperado, intenta de nuevo");
            } finally {
                setSaving(false);
            }
        });
    };

    if (loading || !data) {
        return <Loading message="Cargando permisos..." />;
    }

    return (
        <>
            <ModalBlur onClose={onClose} locked={saving}>
                <div className="d-flex flex-column p-2 p-md-3 mt-3" style={{ maxHeight: "calc(90vh - 2rem)" }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                        <div>
                            <h4 className="mb-1 fw-bold">Permisos del empleado</h4>
                            <p className="text-muted mb-0 small text-uppercase">
                                {`${data.lastName} ${data.name} · #${data.idCheck}`}
                            </p>
                        </div>

                        <Badge bg="primary-subtle" text="primary-emphasis" className="rounded-pill px-3 py-2 fw-semibold border border-primary-subtle">
                            {selected.size} permiso{selected.size !== 1 ? "s" : ""}
                        </Badge>
                    </div>

                    {data && (
                        <>
                            <ConditionalRender cond={!canUpdate}>
                                <Alert variant="warning" className="rounded-3 small py-2">
                                    <i className="bi bi-lock me-2" />
                                    Solo lectura: no cuentas con el permiso para cambiar los permisos de empleados.
                                </Alert>
                            </ConditionalRender>

                            <ConditionalRender cond={missingBase.length > 0}>
                                <Alert variant="warning" className="rounded-3 small py-2 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                                    <span>
                                        <i className="bi bi-exclamation-triangle me-2" />
                                        Le faltan permisos base ({missingBase.length}).
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline-warning"
                                        disabled={!canUpdate}
                                        onClick={() => setSelected(new Set([...selected, ...missingBase]))}
                                    >
                                        Agregar los base
                                    </Button>
                                </Alert>
                            </ConditionalRender>

                            <ConditionalRender cond={!!saveError}>
                                <Alert variant="danger" className="rounded-3 small py-2">
                                    <i className="bi bi-exclamation-circle me-2" />
                                    {saveError}
                                </Alert>
                            </ConditionalRender>

                            <ConditionalRender cond={unknown.length > 0}>
                                <Alert variant="danger" className="rounded-3 small py-2">
                                    <i className="bi bi-exclamation-circle me-2" />
                                    Estos permisos no existen en el catálogo: {unknown.join(", ")}
                                </Alert>
                            </ConditionalRender>

                            <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
                                <PermissionGroupsSelector
                                    idPrefix={`employee-permissions-${idEmployee}`}
                                    catalog={catalog}
                                    selected={selected}
                                    onChange={setSelected}
                                    readOnly={!canUpdate}
                                    tagged={new Set(base)}
                                />
                            </div>
                        </>
                    )}

                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-between align-items-sm-center gap-2 pt-3 border-top">
                        <small className="text-muted">Cambios sin guardar: +{added}, −{removed}</small>

                        <div className="d-flex flex-column-reverse flex-sm-row gap-2">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button type="button" variant="success" disabled={!canUpdate || !hasChanges || saving} onClick={handleSave}>
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            </ModalBlur>

            {/* Después del modal en el DOM para quedar encima (mismo zIndex) */}
            <ConditionalRender cond={saving}>
                <Loading message="Guardando..." />
            </ConditionalRender>
        </>
    );
}
