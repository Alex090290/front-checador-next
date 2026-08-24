import { ModalBasicProps } from "@/lib/definitions";
import moment from "moment";
import { useCallback, useRef, useState } from "react";
import { Badge, Button, Card, Col, Container, Overlay, Row } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { getReport } from "@/app/actions/absences-actions";
import ConditionalRender from "../ConditionalRender";
import ErrorOverlay from "../ErrorOverlay";
import SuccessOverlay from "../SuccessOverlay";
import Loading from "../LoadingSpinner";

registerLocale("es", es);

type FeedbackState = "loading" | "success" | "error" | null;

type ModalAction = {
    dateInit?: string;
    dateEnd?: string;
}

export default function GenerateModal({
    onHide,
    dateInit,
    dateEnd,
}: ModalBasicProps & ModalAction) {

    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    //PARA CALENDARIO
    const [dateInitValue, setDateInitValue] = useState(dateInit ?? "");
    const [dateEndValue, setDateEndValue] = useState(dateEnd ?? "");
    const dateButtonRef = useRef(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateError, setDateError] = useState("");
    const parsedStart = dateInitValue ? moment(dateInitValue, "YYYY-MM-DD").toDate() : null;
    const parsedEnd = dateEndValue ? moment(dateEndValue, "YYYY-MM-DD").toDate() : null;

    const handleRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setDateInitValue(start ? moment(start).format("YYYY-MM-DD") : "");
        setDateEndValue(end ? moment(end).format("YYYY-MM-DD") : "");
        if (start && end) setShowCalendar(true);
    };

    const rangeLabel =
        parsedStart && parsedEnd
            ? `${moment(parsedStart).format("DD/MM/YYYY")} - ${moment(parsedEnd).format("DD/MM/YYYY")}`
            : "Selecciona un rango de fechas";

    const handleGenerate = async () => {
        if (!dateInitValue || !dateEndValue) {
            setDateError("Ambas fechas son requeridas");
            return;
        }
        if (dateEndValue < dateInitValue) {
            setDateError("'Hasta' debe ser posterior a 'Desde'");
            return;
        }
        setDateError("");
        setFeedback("loading");
        setFeedbackMsg("Generando reporte...");

        try {
            const res = await getReport({ dateInit: dateInitValue, dateEnd: dateEndValue });

            if (!res.success || !res.data) {
                setFeedbackMsg(res.message || "No se pudo generar el reporte");
                setFeedback("error");
                return;
            }

            const { base64Url, fileName } = res.data;

            const link = document.createElement("a");
            link.href = base64Url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();

            setFeedbackMsg("Reporte generado correctamente");
            setFeedback("success");
        } catch {
            setFeedbackMsg("Error inesperado al generar el reporte");
            setFeedback("error");
        }
    };

    const handleClear = () => {
        setDateInitValue("");
        setDateEndValue("");
        setDateError("");
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
                        <h4 className="mb-0 fw-bold">Generar excel por fechas</h4>

                        <Badge
                            bg="info-subtle"
                            text="info-emphasis"
                            className="rounded-pill px-3 py-2 fw-semibold border border-info-subtle"
                        >
                            Generar
                        </Badge>
                        <p className="text-muted">Por favor seleccione el rango de fechas de las cuales desea generar el excel</p>
                    </div>

                    <Card className="rounded-4 border h-100">
                        <Card.Body className="p-3">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-calendar-range text-primary" />
                                <span className="fw-semibold small">Filtrar por fechas</span>
                            </div>

                            <Button
                                ref={dateButtonRef}
                                variant="outline-secondary"
                                className={`w-100 d-flex align-items-center justify-content-between ${dateError ? "border-danger text-danger" : ""}`}
                                onClick={() => setShowCalendar((s) => !s)}
                            >
                                <span>{rangeLabel}</span>
                                <i className="bi bi-calendar3" />
                            </Button>

                            {dateError && (
                                <small className="text-danger d-block mt-1">{dateError}</small>
                            )}

                            <Overlay
                                target={dateButtonRef.current}
                                show={showCalendar}
                                placement="top-start"
                                rootClose
                                onHide={() => setShowCalendar(false)}
                            >
                                {({ ref, style }) => (
                                    <div ref={ref} style={{ ...style, zIndex: 2080 }} className="mt-2 shadow-lg rounded-4 overflow-hidden bg-light text-capitalize">
                                        <DatePicker
                                            selectsRange
                                            inline
                                            startDate={parsedStart}
                                            endDate={parsedEnd}
                                            onChange={handleRangeChange}
                                            monthsShown={1}
                                            locale="es"
                                        />
                                        <Row className="g-2 m-2">
                                            <Col xs={12} md={6} lg={6}>
                                                <Button
                                                    variant="secondary"
                                                    className="w-100"
                                                    onClick={() => {
                                                        handleClear();
                                                        setShowCalendar(false);
                                                    }}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise" />
                                                </Button>
                                            </Col>
                                        </Row>
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
                            onClick={handleGenerate}
                        >
                            {feedback === "loading" ? "Generando reporte..." : "Generar reporte"}
                        </Button>
                    </div>
                </div>
            </Container>
        </>
    );
}