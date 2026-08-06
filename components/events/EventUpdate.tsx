"use client";

import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Form, Overlay, Row } from "react-bootstrap";
import { Entry, FieldSelect } from "../fields";
import { useModals } from "@/context/ModalContext";
import { fetchChecadorStatus, fetchChecadorTypes } from "@/app/actions/eventos-actions";
import DatePicker from "react-datepicker";
import moment from "moment-timezone";
import { formatDateHours } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
    status: string;
    type: string;
    dateHour: string; // formato interno "YYYY-MM-DDTHH:mm" — lo que se envía al backend
    minutesDifference: string;
};

type ModalAction = {
    sendData: (
        type: string,
        status: string,
        dateHour: string,
        minutesDifference: string
    ) => Promise<ActionResponse<boolean | null>>;
    status: string;
    type: string;
    date: string; // timestamp crudo UTC
};

export default function FormUpdateEvent({
    onHide,
    sendData,
    status: currentStatus,
    type: currentType,
    date: currentDate,
}: ModalBasicProps & ModalAction) {
    // Único parseo a formato interno (para alimentar el DatePicker) — misma conversión que tu helper,
    // solo que en formato máquina en vez de "DD-MM-YYYY hh:mm A"
    const initialDateHour = currentDate
        ? moment.utc(currentDate).tz("America/Mexico_City").format("YYYY-MM-DDTHH:mm")
        : "";

    const {
        reset,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TInputs>({
        defaultValues: {
            status: currentStatus,
            type: currentType,
            dateHour: initialDateHour,
        },
    });

    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalConfirm } = useModals();
    const [checadorTypes, setChecadorTypes] = useState<string[]>([]);
    const [checadorStatus, setChecadorStatus] = useState<string[]>([]);
    const [, setLoading] = useState(false);
    const dateButtonRef = useRef<HTMLButtonElement>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setOverlayContainer(document.body);
    }, []);

    useEffect(() => {
        register("dateHour");
    }, [register]);

    const selectedDateHour = watch("dateHour");

    // Parsea el valor interno (YYYY-MM-DDTHH:mm) a Date para el DatePicker
    const parsedDateHour = selectedDateHour
        ? moment(selectedDateHour, "YYYY-MM-DDTHH:mm").toDate()
        : null;

    // Usa tu helper para mostrar el botón — ya sabe convertir y formatear correctamente
    const dateHourLabel = selectedDateHour
        ? formatDateHours(moment(selectedDateHour, "YYYY-MM-DDTHH:mm").utc().format())
        : "Selecciona fecha y hora";

    // El registro original, directo con tu helper — tal cual, sin tocar
    const originalDateLabel = currentDate ? formatDateHours(currentDate) : "—";

    const handleDateHourChange = (date: Date | null) => {
        // Guarda SIEMPRE en formato interno — nunca en el formato de visualización
        setValue("dateHour", date ? moment(date).format("YYYY-MM-DDTHH:mm") : "", { shouldDirty: true });
    };

    useEffect(() => {
        reset({
            status: currentStatus,
            type: currentType,
            dateHour: initialDateHour,
        });
    }, [reset, currentStatus, currentType, initialDateHour]);

    const handleFetchResources = useCallback(async () => {
        setLoading(true);

        try {
            const [types, status] = await Promise.all([
                fetchChecadorTypes(),
                fetchChecadorStatus(),
            ]);

            setChecadorTypes(types);
            setChecadorStatus(status);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        handleFetchResources();
    }, [handleFetchResources]);

    useEffect(() => {
        if (checadorTypes.length > 0 && checadorStatus.length > 0) {
            reset({
                status: currentStatus,
                type: currentType,
                dateHour: initialDateHour,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checadorTypes, checadorStatus]);

    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Actualizando registro...");

                const res = await sendData(
                    data.type,
                    data.status,
                    data.dateHour,
                    data.minutesDifference
                );

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

                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h4 className="mb-1 fw-bold">Modificar registro</h4>
                            <p className="text-muted mb-0">
                                Ajusta el tipo de evento, status, fecha/hora y diferencia del registro.
                            </p>
                        </div>
                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                            Actualizar
                        </span>
                    </div>

                    <Card className="border rounded-4 mb-3">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-info-circle text-primary" />
                                <h6 className="mb-0 fw-bold">Datos del evento</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <FieldSelect
                                        register={register("type", { required: true })}
                                        options={checadorTypes.map((t) => ({
                                            label: t.replace(/_/g, " ").toUpperCase(),
                                            value: t,
                                        }))}
                                        label="Evento:"
                                        invalid={!!errors.type}
                                        className="border"
                                    />
                                </Col>

                                <Col md={6}>
                                    <FieldSelect
                                        register={register("status", { required: true })}
                                        options={checadorStatus.map((ev) => ({
                                            label: ev.replace(/_/g, " ").toUpperCase(),
                                            value: ev,
                                        }))}
                                        label="Status:"
                                        invalid={!!errors.status}
                                        className="border"
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="border rounded-4 mb-4">
                        <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-clock-history text-primary" />
                                <h6 className="mb-0 fw-bold">Fecha y diferencia</h6>
                            </div>

                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">Fecha y hora:</Form.Label>
                                        <Button
                                            ref={dateButtonRef}
                                            variant="outline-secondary"
                                            className="w-100 d-flex align-items-center justify-content-between border"
                                            onClick={() => setShowCalendar((s) => !s)}
                                            type="button"
                                        >
                                            <span className="text-truncate">{dateHourLabel}</span>
                                            <i className="bi bi-calendar3 flex-shrink-0" />
                                        </Button>

                                        <Overlay
                                            target={dateButtonRef.current}
                                            show={showCalendar}
                                            placement="bottom-start"
                                            container={overlayContainer}
                                            rootClose
                                            onHide={() => setShowCalendar(false)}
                                            popperConfig={{
                                                modifiers: [
                                                    {
                                                        name: "flip",
                                                        enabled: true,
                                                        options: { fallbackPlacements: ["top-start", "bottom-start"] },
                                                    },
                                                    {
                                                        name: "preventOverflow",
                                                        enabled: true,
                                                        options: { boundary: "viewport" },
                                                    },
                                                ],
                                            }}
                                        >
                                            {({ ref, style }) => (
                                                <div
                                                    ref={ref}
                                                    style={{ ...style, zIndex: 2100 }}
                                                    className="mt-2 shadow-lg rounded-4 overflow-hidden bg-light"
                                                >
                                                    <DatePicker
                                                        inline
                                                        selected={parsedDateHour}
                                                        onChange={handleDateHourChange}
                                                        showTimeSelect
                                                        timeFormat="HH:mm"
                                                        timeIntervals={5}
                                                        timeCaption="Hora"
                                                        dateFormat="dd-MM-yyyy hh:mm aa"
                                                    />
                                                    <div className="p-2">
                                                        <Button
                                                            variant="primary"
                                                            className="w-100"
                                                            onClick={() => setShowCalendar(false)}
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Overlay>
                                        <div className="text-muted small mb-2">
                                            <i className="bi bi-info-circle me-1" />
                                            Registro original: {originalDateLabel}
                                        </div>
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Entry
                                        label="Diferencia (minutos):"
                                        type="number"
                                        register={register("minutesDifference")}
                                        className="border"
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

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