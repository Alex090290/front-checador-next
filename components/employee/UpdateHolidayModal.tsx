"use client"

import { ModalBasicProps } from "@/lib/definitions";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useRef, useState } from "react";
import { useModals } from "@/context/ModalContext";
import { Badge, Button, Card, Container, Overlay } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useForm } from "react-hook-form";
import { IUpdateVacation } from "@/lib/vactions/interface";
import moment from "moment";
import { updateVacationRequest } from "@/app/actions/vacations-actions";
import { formatCreatedAt } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;


type ModalProps = {
    idRequest: number | null;
    idPeriod: number | null;
    data?: IUpdateVacation;
    holidayName: string | null;
}

export default function UpdateHolidayModal({
    onHide,
    idRequest,
    idPeriod,
    holidayName
}: ModalBasicProps & ModalProps) {
    const {
        watch,
        setValue,
    } = useForm<IUpdateVacation>({
        // defaultValues: DEFAULT_VALUES,
    });


    //CONST

    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalConfirm, modalError } = useModals();

    //PARA CALENDARIO

    const dateButtonRef = useRef(null);
    const [showCalendar, setShowCalendar] = useState(false);


    const selectedDate = watch("dateInit"); // lee el valor actual del form state

    const parsedDate = selectedDate
        ? moment(selectedDate, "YYYY-MM-DD").toDate()
        : null;

    const handleDateChange = (date: Date | null) => {
        setValue("dateInit", date ? moment(date).format("YYYY-MM-DD") : "", { shouldDirty: true });
    };

    const handleUpdate = async () => {
        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {

            if (!selectedDate) {
                modalError("Selecciona una fecha");
                return;
            }

            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando fecha...");
                
                const res = await updateVacationRequest({
                    idRequest: String(idRequest),
                    idPeriod: String(idPeriod),
                    data: {
                        dateInit: selectedDate,
                        dateEnd: selectedDate
                    }
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo actualizar la fecha");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Fecha actualizada correctamente");
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
                        <h4 className="mb-0 fw-bold">Actualizar Fecha</h4>

                        <Badge
                            bg="info-subtle"
                            text="info-emphasis"
                            className="rounded-pill px-3 py-2 fw-semibold border border-info-subtle"
                        >
                            Actualizar
                        </Badge>
                    </div>

                    <p className="text-muted">Se actualizará la fecha en <strong className="text-info">{holidayName}</strong>.</p>
                </div>

                <Card className="rounded-4 border h-100">
                    <Card.Body className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-calendar-date text-primary" />
                            <span className="fw-semibold small">Nueva Fecha</span>
                        </div>

                        <Button
                            ref={dateButtonRef}
                            variant="outline-secondary"
                            className="w-100 d-flex align-items-center justify-content-between"
                            onClick={() => setShowCalendar((s) => !s)}
                            type="button"
                        >
                            <span className="text-truncate">{selectedDate ? formatCreatedAt(selectedDate) : "Selecciona una fecha"}</span>
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
                        onClick={handleUpdate}
                    >
                        {feedback === "loading" ? "Actualizando fecha..." : "Actualizar"}
                    </Button>
                </div>
            </Container>
        </>
    )
}
