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
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Entry, FieldSelect } from "../fields";
import { useModals } from "@/context/ModalContext";

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
    const { modalConfirm } = useModals();

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

        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {

            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando falta...");

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
        })
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

                    {/* Datos de la ausencia */}
                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-info-circle text-primary" />
                                <h6 className="mb-0 fw-bold">Datos de la ausencia</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={12}>
                                    <FieldSelect
                                        register={register("category", { required: "La categoría es requerida" })}
                                        label="Categoría:"
                                        invalid={!!errors.category}
                                        options={[
                                            { label: "JUSTIFICADA", value: "justificada" },
                                            { label: "INJUSTIFICADA", value: "injustificada" },
                                        ]}
                                        className="border"
                                    />
                                </Col>

                                <Col md={12}>
                                    <Entry
                                        register={register("motiveJustify", { required: "El motivo es requerido" })}
                                        label="Motivo:"
                                        invalid={!!errors.motiveJustify}
                                        feedBack={errors.motiveJustify?.message}
                                        className="border text-uppercase"
                                        as="textarea"
                                        rows={2}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Documentos */}
                    <Card className="border rounded-4 mb-4">
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-paperclip text-primary" />
                                    <h6 className="mb-0 fw-bold">Documentos</h6>
                                </div>
                                <span className="text-muted small">
                                    {fileSlots.filter((s) => s.file).length}/{fileSlots.length} cargado(s)
                                </span>
                            </div>

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

                                        <ConditionalRender cond={fileSlots.length > 1}>
                                            <Button
                                                variant="outline-danger"
                                                type="button"
                                                onClick={() => handleRemoveSlot(slot.id)}
                                            >
                                                <i className="bi bi-x" />
                                            </Button>
                                        </ConditionalRender>
                                    </div>
                                ))}
                            </div>

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
                        </Card.Body>
                    </Card>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
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