"use client"


import { ModalBasicProps } from "@/lib/definitions";
import { useState } from "react";
import { Badge, Button, Card, Col, Container, Form } from "react-bootstrap";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import ConditionalRender from "../ConditionalRender";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";
import Loading from "../LoadingSpinner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import { Entry } from "../fields";
import { useRouter } from "next/navigation";
import { IDeleteInhability } from "@/lib/inhability/interface";
import { deleteOverTime } from "@/app/actions/overtime-actions";

registerLocale("es", es);

type FeedbackState = "loading" | "success" | "error" | null;

type ModalAction = {
    idOvertime: number | null;
    motive: string | null;
    status: boolean | null;
}

export default function DeleteOvertimeModal({
    onHide,
    idOvertime,
    motive,
    status
}: ModalBasicProps & ModalAction) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IDeleteInhability>({
        // defaultValues: DEFAULT_VALUES,
    });

    const router = useRouter();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalConfirm } = useModals();


    const onSubmit: SubmitHandler<IDeleteInhability> = async (data) => {


        modalConfirm("¿Seguro que quieres eliminar esta solicitud?", async () => {

            try {
                setFeedback("loading");
                setFeedbackMsg("Eliminando solicitud...");

                const res = await deleteOverTime({
                    id: idOvertime,
                    data: data,
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo eliminar");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Eliminado correctamente");
                setFeedback("success");
                router.push("/app/overtime");
            } catch {
                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        })
    };


    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
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


            <ConditionalRender cond={status === false}>
                <Container className="mt-4">
                    <div className="p-2">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                            <h4 className="mb-0 fw-bold">Eliminar solicitud de horas extra</h4>

                            <Badge
                                bg="danger-subtle"
                                text="danger-emphasis"
                                className="rounded-pill px-3 py-2 fw-semibold border border-danger-subtle"
                            >
                                Eliminar
                            </Badge>
                        </div>

                        <p className="text-muted">Registra la razón  por la cual se elimina la solicitud</p>

                        <Form onSubmit={handleSubmit(onSubmit)}>

                            <Card className="rounded-4 shadow-sm mt-2">
                                <Col md={12}>
                                    <Card.Body className="p-4">
                                        <Form.Group>
                                            <Entry
                                                register={register("reaseonDelete", { required: "La razón es requerida" })}
                                                invalid={!!errors.reaseonDelete}
                                                label="Razón por la cual se elimina:"
                                                feedBack={errors.reaseonDelete?.message}
                                                className="border rounded-3 text-uppercase"
                                                as={"textarea"}
                                                rows={3}
                                            />
                                        </Form.Group>
                                    </Card.Body>
                                </Col>
                            </Card>


                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onHide}
                                    disabled={feedback === "loading"}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    variant="danger"
                                    disabled={feedback === "loading"}
                                    type="submit"
                                >
                                    {feedback === "loading" ? "Eliminando solicitud..." : "Eliminar solicitud"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Container>
            </ConditionalRender>

            <ConditionalRender cond={status === true}>
                <Container className="mt-4">
                    <div className="p-2">
                        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                            <div>
                                <h4 className="mb-0 fw-bold">Motivo de eliminación</h4>
                                <small className="text-muted">Detalle proporcionado al eliminar la solicitud</small>
                            </div>

                            <Badge
                                bg="danger-subtle"
                                text="danger-emphasis"
                                className="rounded-pill px-3 py-2 fw-semibold border border-danger-subtle"
                            >
                                Eliminación
                            </Badge>
                        </div>

                        <Card className="rounded-4 shadow-sm mt-2">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-chat-square-quote text-danger" />
                                    <h6 className="mb-0 fw-bold">Motivo</h6>
                                </div>
                                <p className="mb-0 text-uppercase ms-3">{motive}</p>
                            </Card.Body>
                        </Card>
                    </div>
                </Container>
            </ConditionalRender>
        </>
    );
}