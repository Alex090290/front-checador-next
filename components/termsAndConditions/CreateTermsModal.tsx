"use client"
import { ModalBasicProps } from "@/lib/definitions";
import { Button, Card, Col, Form } from "react-bootstrap";
import { BooleanField, Entry, FieldSelect } from "../fields";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    ITermsAndConditionsForm,
    LEGAL_DOCUMENT_LABELS,
    TERMS_CONTENT_MAX_LENGTH,
} from "@/lib/termsAndConditions/interface";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { createTerms } from "@/app/actions/termsAndConditions-actions";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

export default function CreateTermsModal({
    onHide
}: ModalBasicProps) {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ITermsAndConditionsForm>({
        defaultValues: {
            type: "" as ITermsAndConditionsForm["type"],
            title: "",
            content: "",
            isActive: false,
        },
    });

    const { modalConfirm } = useModals();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const contentLength = watch("content")?.length ?? 0;


    const onSubmit: SubmitHandler<ITermsAndConditionsForm> = async (data) => {
        const message = data.isActive
            ? `¿Seguro que quieres guardar y publicar el documento? El ${LEGAL_DOCUMENT_LABELS[data.type].toLowerCase()} vigente actual dejará de estarlo.`
            : "¿Seguro que quieres guardar los cambios?";

        modalConfirm(message, async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Creando documento...");

                const res = await createTerms({
                    type: data.type,
                    title: data.title.trim(),
                    content: data.content,
                    isActive: data.isActive === true,
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo crear");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Creado correctamente");
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
                <Loading message={feedbackMsg || "Cargando..."} />
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

            <div className="p-2 mt-4">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-4">
                    <div>
                        <h4 className="mb-1 fw-bold">Nuevo documento legal</h4>
                        <p className="text-muted mb-0">
                            Captura el tipo, el título y el contenido del documento.
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Crear
                    </span>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Card className="border-0">
                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body className="p-4">
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-file-earmark-text text-primary" />
                                        Tipo:
                                    </label>
                                    <FieldSelect
                                        register={register("type", { required: "Selecciona el tipo de documento" })}
                                        label=""
                                        options={[
                                            { value: "", label: "Selecciona un tipo" },
                                            { value: "TERMINOS", label: LEGAL_DOCUMENT_LABELS.TERMINOS },
                                            { value: "PRIVACIDAD", label: LEGAL_DOCUMENT_LABELS.PRIVACIDAD },
                                        ]}
                                        className="border"
                                        invalid={!!errors.type}
                                        feedBack={errors.type?.message}
                                    />
                                </Card.Body>
                            </Card>

                            <Card className="border rounded-4 mt-3">
                                <Card.Body className="p-4">
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-type text-primary" />
                                        Título:
                                    </label>
                                    <Entry
                                        register={register("title", {
                                            required: "Este campo es requerido",
                                            validate: (v) => {
                                                const length = v.trim().length;
                                                if (length < 3) return "El título debe tener al menos 3 caracteres";
                                                if (length > 150) return "El título no puede tener más de 150 caracteres";
                                                return true;
                                            },
                                        })}
                                        label=""
                                        className="border"
                                        invalid={!!errors.title}
                                        feedBack={errors.title?.message}
                                    />
                                </Card.Body>
                            </Card>

                            <Card className="border rounded-4 mt-3">
                                <Card.Body className="p-4">
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-body-text text-primary" />
                                        Contenido:
                                    </label>
                                    <Entry
                                        register={register("content", {
                                            required: "Este campo es requerido",
                                            maxLength: {
                                                value: TERMS_CONTENT_MAX_LENGTH,
                                                message: `El contenido no puede tener más de ${TERMS_CONTENT_MAX_LENGTH.toLocaleString("es-MX")} caracteres`,
                                            },
                                        })}
                                        label=""
                                        as="textarea"
                                        rows={12}
                                        className="border"
                                        invalid={!!errors.content}
                                        feedBack={errors.content?.message}
                                    />
                                    <div className={`small text-end ${contentLength > TERMS_CONTENT_MAX_LENGTH ? "text-danger" : "text-muted"}`}>
                                        {contentLength.toLocaleString("es-MX")} / {TERMS_CONTENT_MAX_LENGTH.toLocaleString("es-MX")} caracteres
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="border rounded-4 mt-3">
                                <Card.Body className="p-4 pb-2">
                                    <BooleanField
                                        register={register("isActive")}
                                        label="Publicar al guardar"
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Card>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={onHide}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={isSubmitting || feedback === "loading"}
                        >
                            {isSubmitting || feedback === "loading" ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    )
}
