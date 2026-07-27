"use client";

import { updateAbsence } from "@/app/actions/absences-actions";
import { IAbsence } from "@/lib/absences/interface";
import { ModalBasicProps } from "@/lib/definitions";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Entry, FieldSelect } from "../fields";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputsAbsence = {
    category: string;
    motiveJustify: string;
};

type ModalAction = {
    absence?: IAbsence | null;
    id: number;
};

// Cada slot de archivo tiene su propio File y su ref
type FileSlot = {
    id: number;
    file: File | null;
};

export default function FormUpdateAbsence({
    id,
    onHide,
    absence,
}: ModalBasicProps & ModalAction) {
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    // Slots de archivos — inicia con uno vacío
    const [fileSlots, setFileSlots] = useState<FileSlot[]>([{ id: 1, file: null }]);
    const fileRefs = useRef<Map<number, HTMLInputElement | null>>(new Map());

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TInputsAbsence>({
        defaultValues: {
            category: absence?.category ?? "",
            motiveJustify: absence?.motiveJustify ?? "",
        },
    });

    // Asignar archivo a un slot
    const handleFileChange = (slotId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFileSlots((prev) =>
            prev.map((s) => (s.id === slotId ? { ...s, file } : s))
        );
    };

    // Agregar nuevo slot vacío
    const handleAddSlot = () => {
        const newId = Date.now();
        setFileSlots((prev) => [...prev, { id: newId, file: null }]);
    };

    // Quitar un slot
    const handleRemoveSlot = (slotId: number) => {
        setFileSlots((prev) => prev.filter((s) => s.id !== slotId));
        fileRefs.current.delete(slotId);
    };

    const onSubmit: SubmitHandler<TInputsAbsence> = async (data) => {
        if (!id) return;

        try {
            setFeedback("loading");
            setFeedbackMsg("Actualizando ausencia...");

            // Construir un FormData por cada archivo seleccionado
            const documents: FormData[] = fileSlots
                .filter((s) => s.file !== null)
                .map((s) => {
                    const fd = new FormData();
                    fd.append("document", s.file!);
                    return fd;
                });

            const res = await updateAbsence({
                id,
                documents: documents.length > 0 ? documents : undefined,
                data: {
                    ...absence,
                    category: data.category,
                    motiveJustify: data.motiveJustify,
                } as IAbsence,
            });

            if (!res.success) {
                setFeedbackMsg(res.message || "No se pudo actualizar");
                setFeedback("error");
                return;
            }

            setFeedbackMsg(res.message || "Actualizado correctamente");
            setFeedback("success");
        } catch {
            setFeedbackMsg("Error inesperado, intenta de nuevo");
            setFeedback("error");
        }
    };

    return (
        <>
            <ConditionalRender cond={feedback === "loading" || isSubmitting}>
                <Loading message={feedbackMsg || "Actualizando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => {
                        setFeedback(null);
                        onHide();
                    }}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-2">

                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h4 className="mb-1 fw-bold">Actualizar ausencia</h4>
                            <p className="text-muted mb-0">
                                Modifica la categoría, motivo y documentos de la ausencia.
                            </p>
                        </div>
                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                            Actualizar
                        </span>
                    </div>

                    {/* Campos del formulario */}
                    <Row className="g-3 mb-4">
                        <Col xs={12}>
                            <FieldSelect
                                register={register("category", { required: "La categoría es requerida" })}
                                label="Categoría:"
                                invalid={!!errors.category}
                                options={[
                                    { label: "Justificada", value: "justificada" },
                                    { label: "Injustificada", value: "injustificada" },
                                ]}
                                className="border"
                            />
                        </Col>

                        <Col xs={12}>
                            <Entry
                                register={register("motiveJustify", { required: "El motivo es requerido" })}
                                label="Motivo:"
                                invalid={!!errors.motiveJustify}
                                feedBack={errors.motiveJustify?.message}
                                className="border"
                            />
                        </Col>
                    </Row>

                    {/* Documentos */}
                    <div className="mb-4">
                        <label className="fw-semibold mb-2 d-block">
                            Documentos (opcional):
                        </label>

                        <div className="d-flex flex-column gap-2">
                            {fileSlots.map((slot, index) => (
                                <div
                                    key={slot.id}
                                    className="border rounded-3 p-3 d-flex align-items-center gap-2"
                                >
                                    <span className="text-muted small" style={{ minWidth: 24 }}>
                                        {index + 1}.
                                    </span>

                                    <input
                                        type="file"
                                        ref={(el) => { fileRefs.current.set(slot.id, el); }}
                                        onChange={(e) => handleFileChange(slot.id, e)}
                                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                                        style={{ display: "none" }}
                                    />

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        type="button"
                                        onClick={() => fileRefs.current.get(slot.id)?.click()}
                                    >
                                        <i className="bi bi-upload me-1" />
                                        {slot.file ? "Cambiar" : "Seleccionar"}
                                    </Button>

                                    <ConditionalRender cond={!!slot.file}>
                                        <span className="small text-truncate text-secondary flex-grow-1">
                                            <i className="bi bi-file-earmark me-1" />
                                            {slot.file?.name}
                                        </span>
                                    </ConditionalRender>

                                    <ConditionalRender cond={!slot.file}>
                                        <span className="small text-muted flex-grow-1">
                                            Sin archivo seleccionado
                                        </span>
                                    </ConditionalRender>

                                    {/* Solo muestra quitar si hay más de un slot */}
                                    <ConditionalRender cond={fileSlots.length > 1}>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            type="button"
                                            onClick={() => handleRemoveSlot(slot.id)}
                                        >
                                            <i className="bi bi-x" />
                                        </Button>
                                    </ConditionalRender>
                                </div>
                            ))}
                        </div>

                        {/* Botón agregar otro — solo si el último slot ya tiene archivo */}
                        <ConditionalRender cond={!!fileSlots[fileSlots.length - 1]?.file}>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                type="button"
                                className="mt-2"
                                onClick={handleAddSlot}
                            >
                                <i className="bi bi-plus me-1" />
                                Agregar otro documento
                            </Button>
                        </ConditionalRender>
                    </div>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            disabled={isSubmitting || feedback === "loading"}
                            onClick={onHide}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={isSubmitting || feedback === "loading"}
                        >
                            {isSubmitting || feedback === "loading" ? "Guardando..." : "Actualizar"}
                        </Button>
                    </div>
                </div>
            </Form>
        </>
    );
}