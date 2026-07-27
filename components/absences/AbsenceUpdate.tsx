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

export default function FormUpdateAbsence({
    id,
    onHide,
    absence,
}: ModalBasicProps & ModalAction) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");

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

    // Manejo de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFiles(Array.from(files));
        }
    };

    const handleClearFiles = () => {
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Convertir archivos a base64 para enviar al action
    const filesToDocuments = async (files: File[]) => {
        return Promise.all(
            files.map(
                (file) =>
                    new Promise<{ name: string; base64: string; type: string }>(
                        (resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                                resolve({
                                    name: file.name,
                                    base64: (reader.result as string).split(",")[1],
                                    type: file.type,
                                });
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        }
                    )
            )
        );
    };

    const onSubmit: SubmitHandler<TInputsAbsence> = async (data) => {
        if (!id) return;
    
        try {
            setFeedback("loading");
            setFeedbackMsg("Actualizando ausencia...");
    
            // Armar FormData con el campo "document"
            let formData: FormData | undefined;
            if (selectedFiles.length > 0) {
                formData = new FormData();
                selectedFiles.forEach((file) => {
                    formData!.append("document", file);
                });
            }
    
            const res = await updateAbsence({
                id,
                document: formData,
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

                    {/* Carga de documentos */}
                    <div className="mb-4">
                        <label className="fw-semibold mb-2 d-block">Documento (opcional):</label>

                        <div className="d-flex align-items-center gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <i className="bi bi-upload me-1" />
                                Seleccionar archivo
                            </Button>

                            {selectedFiles.length > 0 && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    type="button"
                                    onClick={handleClearFiles}
                                >
                                    <i className="bi bi-x me-1" />
                                    Quitar
                                </Button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            multiple
                            style={{ display: "none" }}
                        />

                        {selectedFiles.length > 0 && (
                            <div className="mt-2">
                                <small className="text-muted d-block mb-1">
                                    {selectedFiles.length} archivo(s) seleccionado(s)
                                </small>
                                {selectedFiles.slice(0, 2).map((file, i) => (
                                    <div key={i} className="small text-truncate text-secondary">
                                        <i className="bi bi-file-earmark me-1" />
                                        {file.name}
                                    </div>
                                ))}
                                {selectedFiles.length > 2 && (
                                    <small className="text-muted">
                                        +{selectedFiles.length - 2} más
                                    </small>
                                )}
                            </div>
                        )}
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