"use client";

import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import ModalBlur from "../ModalBlur";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import { changePasswordSystem } from "@/app/actions/employeePasswordSystem-actions";

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

// Mismas reglas que el back (utils/employeePassword.ts): aquí solo se muestran para guiar
function getRules(newPassword: string, currentPassword: string, firstTime: boolean, idCheck: number | null) {
    return [
        { label: "Mínimo 8 caracteres", ok: newPassword.length >= 8 && newPassword.length <= 64 },
        { label: "Al menos una letra y un número", ok: /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(newPassword) && /\d/.test(newPassword) },
        { label: "Sin espacios", ok: newPassword.length > 0 && !/\s/.test(newPassword) },
        {
            label: "Distinta de tu NIP y de tu número de empleado",
            ok: newPassword.length > 0 &&
                (!firstTime || newPassword !== currentPassword) &&
                (idCheck === null || newPassword !== String(idCheck)),
        },
    ];
}

//Crear (la primera vez, con el NIP) o cambiar la contraseña del sistema del empleado con sesión.
//Los valores solo viven en el estado de este modal: al cerrarlo se desmonta y se limpian.
export default function PasswordSystemModal({
    firstTime,
    idCheck,
    cancelLabel = "Cancelar",
    onClose,
    onSaved,
}: {
    firstTime: boolean;
    idCheck: number | null;
    cancelLabel?: string;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [values, setValues] = useState<Record<FieldName, string>>({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState<Record<FieldName, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const rules = getRules(values.newPassword, values.currentPassword, firstTime, idCheck);
    const confirmMismatch = values.confirmPassword.length > 0 && values.confirmPassword !== values.newPassword;

    const setField = (name: FieldName, value: string) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!values.currentPassword) return setError(firstTime ? "Escribe tu NIP actual" : "Escribe tu contraseña actual");
        if (rules.some((r) => !r.ok)) return setError("La contraseña nueva no cumple con todas las reglas");
        if (values.newPassword !== values.confirmPassword) return setError("La confirmación no coincide con la contraseña nueva");

        setSaving(true);
        try {
            const res = await changePasswordSystem(values);

            if (!res.success) {
                setError(res.message || "No se pudo guardar la contraseña");
                return;
            }

            setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setSuccessMsg(res.message);
        } catch {
            setError("Error inesperado, intenta de nuevo");
        } finally {
            setSaving(false);
        }
    };

    const renderField = (name: FieldName, label: string, autoComplete: string) => (
        <Form.Group controlId={`password-system-${name}`} className="mb-3">
            <Form.Label className="fw-semibold">{label}</Form.Label>
            <div className="position-relative">
                <Form.Control
                    type={show[name] ? "text" : "password"}
                    className="border rounded-3 pe-5"
                    value={values[name]}
                    maxLength={64}
                    autoComplete={autoComplete}
                    isInvalid={name === "confirmPassword" && confirmMismatch}
                    onChange={(e) => setField(name, e.target.value)}
                />
                <button
                    type="button"
                    className="btn btn-link p-0 position-absolute top-50 end-0 translate-middle-y me-3 text-info"
                    style={{ zIndex: 5 }}
                    onClick={() => setShow((prev) => ({ ...prev, [name]: !prev[name] }))}
                    aria-label={show[name] ? "Ocultar" : "Mostrar"}
                    tabIndex={-1}
                >
                    <i className={`bi ${show[name] ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
            </div>
            <ConditionalRender cond={name === "confirmPassword" && confirmMismatch}>
                <div className="invalid-feedback d-block">La confirmación no coincide con la contraseña nueva</div>
            </ConditionalRender>
        </Form.Group>
    );

    return (
        <>
            {/* Al guardar se quita el modal y queda solo el aviso de éxito */}
            {!successMsg && (
            <ModalBlur onClose={onClose} locked={saving}>
                <div className="p-2 p-md-3 mt-3" style={{ maxWidth: 560, margin: "0 auto" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <h4 className="mb-0 fw-bold">{firstTime ? "Crea tu contraseña" : "Cambiar contraseña"}</h4>

                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                            Seguridad
                        </span>
                    </div>

                    <p className="text-muted mb-3">
                        {firstTime
                            ? "Hoy entras con tu NIP del checador. Crea una contraseña para entrar a Portal Gama; tu NIP seguirá siendo para checar."
                            : "Escribe tu contraseña actual y la nueva. Tu NIP del checador no cambia."}
                    </p>

                    <ConditionalRender cond={!!error}>
                        <Alert variant="danger" className="rounded-3 small py-2">
                            <i className="bi bi-exclamation-circle me-2" />
                            {error}
                        </Alert>
                    </ConditionalRender>

                    <Form onSubmit={handleSubmit}>
                        <Card className="rounded-4 shadow-sm">
                            <Card.Body className="p-3 p-md-4">
                                {renderField("currentPassword", firstTime ? "NIP actual:" : "Contraseña actual:", "current-password")}
                                {renderField("newPassword", "Contraseña nueva:", "new-password")}

                                <ul className="list-unstyled small mb-3">
                                    {rules.map((rule) => (
                                        <li key={rule.label} className={rule.ok ? "text-success" : "text-muted"}>
                                            <i className={`bi ${rule.ok ? "bi-check-circle-fill" : "bi-circle"} me-2`} />
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>

                                {renderField("confirmPassword", "Confirmar contraseña:", "new-password")}
                            </Card.Body>
                        </Card>

                        <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                                {cancelLabel}
                            </Button>

                            <Button type="submit" variant="success" disabled={saving}>
                                Guardar
                            </Button>
                        </div>
                    </Form>
                </div>
            </ModalBlur>
            )}

            {/* Después del modal en el DOM para quedar encima (mismo zIndex) */}
            <ConditionalRender cond={saving}>
                <Loading message="Guardando..." />
            </ConditionalRender>

            <ConditionalRender cond={!!successMsg}>
                <SuccessOverlay message={successMsg} onDone={onSaved} />
            </ConditionalRender>
        </>
    );
}
