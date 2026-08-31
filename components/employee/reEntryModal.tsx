"use client"


import { ModalBasicProps, reEntryEmployee } from "@/lib/definitions";
import moment from "moment";
import { useRef, useState } from "react";
import { Badge, Button, Card, Container, Overlay } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import ConditionalRender from "../ConditionalRender";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";
import Loading from "../LoadingSpinner";
import { useForm } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import { reEntry } from "@/app/actions/employee-actions";

registerLocale("es", es);

type FeedbackState = "loading" | "success" | "error" | null;

type ModalAction = {
    employee: reEntryEmployee;
    id: number;
}

export default function ReEntryModal({
    onHide,
    id
}: ModalBasicProps & ModalAction) {
    const {
        watch,
        setValue,
    } = useForm<reEntryEmployee>({
        // defaultValues: DEFAULT_VALUES,
    });

    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalConfirm, modalError } = useModals();

    //PARA CALENDARIO

    const dateButtonRef = useRef(null);
    const [showCalendar, setShowCalendar] = useState(false);


    const selectedDate = watch("reEntryDate"); // lee el valor actual del form state

    const parsedDate = selectedDate
        ? moment(selectedDate, "YYYY-MM-DD").toDate()
        : null;

    const handleDateChange = (date: Date | null) => {
        setValue("reEntryDate", date ? moment(date).format("YYYY-MM-DD") : "", { shouldDirty: true });
    };



    const handleReEntry = async () => {


        modalConfirm("Confirma el reingreso del empleado", async () => {
            if (!selectedDate) {
                modalError("Selecciona una fecha de reingreso");
                return;
            }

            try {
                setFeedback("loading");
                setFeedbackMsg("Reingresando empleado...");

                const res = await reEntry({
                    id: Number(id),
                    reEntryDate: String(selectedDate) ?? ""
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo reingresar al empleado");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Empleado actualizado correctamente");
                setFeedback("success");
            } catch {
                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        });
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

            <Container className="mt-4">
                <div className="p-2">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                        <h4 className="mb-0 fw-bold">Reingresar empleado</h4>

                        <Badge
                            bg="info-subtle"
                            text="info-emphasis"
                            className="rounded-pill px-3 py-2 fw-semibold border border-info-subtle"
                        >
                            Reingresar
                        </Badge>
                    </div>

                    <p className="text-muted">Selecciona la fecha de reingreso del empleado</p>

                    <Card className="rounded-4 border h-100">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-calendar-date text-primary" />
                                <span className="fw-semibold small">Fecha</span>
                            </div>

                            <Button
                                ref={dateButtonRef}
                                variant="outline-secondary"
                                className="w-100 d-flex align-items-center justify-content-between"
                                onClick={() => setShowCalendar((s) => !s)}
                                type="button"
                            >
                                <span className="text-truncate">{selectedDate ? selectedDate : "Selecciona una fecha"}</span>
                                <i className="bi bi-calendar3 flex-shrink-0" />
                            </Button>

                            <Overlay
                                target={dateButtonRef.current}
                                show={showCalendar}
                                placement="bottom-start"
                                rootClose
                                onHide={() => setShowCalendar(false)}
                                container={document.body}
                            >
                                {({ ref, style }) => (
                                    <div
                                        ref={ref}
                                        style={{ ...style, zIndex: 3080 }}
                                        className="mt-2 shadow-lg rounded-4 overflow-hidden bg-light text-capitalize"
                                    >
                                        <DatePicker
                                            inline
                                            selected={parsedDate}
                                            onChange={handleDateChange}
                                            locale="es"
                                        />
                                    </div>
                                )}
                            </Overlay>
                        </Card.Body>
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
                            variant="success"
                            disabled={feedback === "loading"}
                            onClick={handleReEntry}
                        >
                            {feedback === "loading" ? "Reingresando al empleado..." : "Reingresar empleado"}
                        </Button>
                    </div>
                </div>
            </Container>
        </>
    );
}