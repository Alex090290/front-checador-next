"use client"
import { ModalBasicProps } from "@/lib/definitions";
import { Button, Card, Col, Form } from "react-bootstrap";
import { Entry } from "../fields";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    ITermsAndConditions,
    LEGAL_DOCUMENT_LABELS,
    TERMS_CONTENT_MAX_LENGTH,
} from "@/lib/termsAndConditions/interface";
import { useModals } from "@/context/ModalContext";
import { useCallback, useEffect, useState } from "react";
import { getTermsById, updateTerms } from "@/app/actions/termsAndConditions-actions";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
    title: string;
    content: string;
};

type ModalProps = {
    idRegister: number;
}

export default function UpdateTermsModal({
    onHide,
    idRegister,
}: ModalBasicProps & ModalProps) {

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TInputs>({
        defaultValues: { title: "", content: "" },
    });

    const { modalConfirm } = useModals();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [terms, setTerms] = useState<ITermsAndConditions | null>(null);
    const contentLength = watch("content")?.length ?? 0;

    // El listado no trae content, se carga el documento completo
    const loadTerms = useCallback(async () => {
        const res = await getTermsById(idRegister);

        if (!res.success || !res.data) {
            setFeedbackMsg(res.message || "No se pudo cargar el documento");
            setFeedback("error");
            return;
        }

        setTerms(res.data);
        reset({ title: res.data.title ?? "", content: res.data.content ?? "" });
    }, [idRegister, reset]);

    useEffect(() => {
        const run = async () => {
            setFeedback("loading");
            setFeedbackMsg("Cargando documento...");
            await loadTerms();
            setFeedback((prev) => (prev === "loading" ? null : prev));
        };
        run();
    }, [loadTerms]);

    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando documento...");

                const res = await updateTerms(idRegister, {
                    title: data.title.trim(),
                    content: data.content,
                });

                if (!res.success) {
                    // 409: otro administrador lo guardó al mismo tiempo → se recarga el documento
                    if (res.data?.conflict) await loadTerms();

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
                    onDone={() => {
                        setFeedback(null);
                        // Si no se pudo cargar el documento no hay nada que editar
                        if (!terms) onHide();
                    }}
                />
            </ConditionalRender>

            <div className="p-2 mt-4">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-4">
                    <div>
                        <h4 className="mb-1 fw-bold">Editar documento legal</h4>
                        <p className="text-muted mb-0">
                            {terms
                                ? `Versión actual: v${terms.version}. Si cambias el título o el contenido, se guardará como v${terms.version + 1}.`
                                : "Cargando documento..."}
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Editar
                    </span>
                </div>

                <ConditionalRender cond={!!terms}>
                    <Form onSubmit={handleSubmit(onSubmit)}>

                        <Card className="border-0">
                            <Col md={12}>
                                <Card className="border rounded-4">
                                    <Card.Body className="p-4">
                                        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                                            <div className="d-flex align-items-center gap-2 text-muted">
                                                <i className="bi bi-file-earmark-text text-primary" />
                                                <span>Tipo</span>
                                            </div>

                                            <span className="fw-semibold">
                                                {terms ? LEGAL_DOCUMENT_LABELS[terms.type] : "-"}
                                            </span>
                                        </div>
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
                </ConditionalRender>
            </div>
        </>
    )
}
