"use client"

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Carousel, Col, Dropdown, Overlay, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import DatePicker, { registerLocale } from "react-datepicker";
import { useRouter, useSearchParams } from "next/navigation";
import { es } from "date-fns/locale";
import moment from "moment";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import Loading from "../LoadingSpinner";
import { getReportInflowsAndOutflows } from "@/app/actions/reports-actions";
import { ICurrentPeriod } from "@/lib/definitions";
import { formatCreatedAt } from "@/lib/helpers";
import { createPortal } from "react-dom";


moment.locale("es");
registerLocale("es", es);


type FeedbackState = "loading" | "success" | "error" | null;

export interface StatCardData {
    id?: string;
    idCard?: number;
    label?: string;
    icon?: string;
    value?: string;
    accent?: string;
    changed?: boolean;
    view?: string;
    dateInit?: string;
    dateEnd?: string;
    periods?: ICurrentPeriod[];
    periodoActual?: ICurrentPeriod | null;
}


function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function StatCard({ idCard, label, icon, value, accent = "primary", isPending, dateInit, dateEnd, periods, periodoActual }: StatCardData & { isPending?: boolean; onClick?: () => void }) {
    const router = useRouter();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const hasAppliedDefaultFilters = useRef(false);
    const currentPeriod = sp.get("idPeriod") ?? "";
    const currentYear = sp.get("year") ?? "";

    const [justArrived, setJustArrived] = useState(false);
    const [dateInitValue, setDateInitValue] = useState(dateInit ?? "");
    const [dateEndValue, setDateEndValue] = useState(dateEnd ?? "");
    const [dateError, setDateError] = useState("");

    const [showCalendar, setShowCalendar] = useState(false);
    const dateButtonRef = useRef(null);
    const parsedStart = dateInitValue ? moment(dateInitValue, "YYYY-MM-DD").toDate() : null;
    const parsedEnd = dateEndValue ? moment(dateEndValue, "YYYY-MM-DD").toDate() : null;
    // dentro de StatCard:
    const [mounted, setMounted] = useState(false);


    const rangeLabel =
        parsedStart && parsedEnd
            ? `${moment(parsedStart).format("D MMM")} - ${moment(parsedEnd).format("D MMM")}`
            : "Rango de fechas";

    const handleRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setDateInitValue(start ? moment(start).format("YYYY-MM-DD") : "");
        setDateEndValue(end ? moment(end).format("YYYY-MM-DD") : "");
        if (start && end) setShowCalendar(true);
    };

    const handleClearDates = () => {
        setDateInitValue("");
        setDateEndValue("");
    };

    useEffect(() => setMounted(true), []);

    //Al montar: si no hay filtros en la URL, usar periodo actual y año en curso
    useEffect(() => {
        if (hasAppliedDefaultFilters.current) return;
        hasAppliedDefaultFilters.current = true;

        if (currentPeriod || currentYear) return;
        if (!periodoActual) return;

        const params = new URLSearchParams(searchParamsString);
        params.set("idPeriod", String(periodoActual.id));
        params.set("year", String(new Date().getFullYear()));

        startTransition(() => {
            router.replace(`/app?${params.toString()}`);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Solo dispara el flash cuando la data terminó de llegar (isPending pasó a false)
        if (!isPending) {
            setJustArrived(true);
        }
    }, [value, isPending]);

    //Filtrar fechas
    const handleDateFilter = useCallback(() => {
        if (!dateInitValue || !dateEndValue) {
            setDateError("Ambas fechas son requeridas");
            return;
        }
        if (dateEndValue < dateInitValue) {
            setDateError("'Hasta' debe ser posterior a 'Desde'");
            return;
        }
        setDateError("");

        if (dateInitValue === (dateInit ?? "") && dateEndValue === (dateEnd ?? "")) return;

        setFeedback("loading");
        setFeedbackMsg("Filtrando...");


        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("dateInit", dateInitValue);
        params.set("dateEnd", dateEndValue);

        router.push(`/app?${params.toString()}`);
    }, [dateInitValue, dateEndValue, dateInit, dateEnd, searchParamsString, router]);

    //Boton de descargar
    const handleDownload = async (idCard: number | null) => {

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

        switch (idCard) {
            case 3: // Ingresos y salidas
                try {

                    const res = await getReportInflowsAndOutflows({ dateInit: dateInitValue, dateEnd: dateEndValue });

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
                    handleClearDates();
                    setFeedbackMsg("Reporte generado correctamente");
                    setFeedback("success");
                } catch (err) {
                    setFeedbackMsg("Error inesperado al generar el reporte");
                    setFeedback("error");
                }
                break;
            case 4: // Vales

                break; // Prima anual

            case 1: // Asistencia Y Puntualidad Perfecta

                break;

            default:
                break;
        }
    }


    const handleSearchPeriod = useCallback(
        (value: string) => {
            if (value === currentPeriod) return;

            const params = new URLSearchParams(searchParamsString);
            if (value) {
                params.set("idPeriod", value);
            } else {
                params.delete("idPeriod");
            }

            startTransition(() => {
                router.push(`/app?${params.toString()}`);
            });
        },
        [currentPeriod, searchParamsString, router]
    );

    const handleClear = useCallback(() => {
        const params = new URLSearchParams(searchParamsString);
        params.set("idPeriod", String(periodoActual?.id));
        startTransition(() => {
            router.push(`/app?${params.toString()}`);
        });
    }, [searchParamsString, router, periodoActual]);

    const selectedPeriod = useMemo(
        () => periods?.find((p) => String(p.id) === currentPeriod),
        [periods, currentPeriod]
    );



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
                        // onHide();
                    }}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <div
                className={["border rounded-4 p-3 h-100 d-flex flex-column mt-1", isPending && "stat-card-loading", justArrived && "collapse-card"].filter(Boolean).join(" ")}
                onAnimationEnd={() => justArrived && setJustArrived(false)}
            >
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                        className={`d-flex align-items-center justify-content-center rounded-circle bg-${accent}-subtle text-${accent}-emphasis`}
                        style={{ width: 44, height: 44 }}
                    >
                        <i className={`bi bi-${icon} fs-5`} />
                    </div>

                    <div className="position-relative">
                        <ConditionalRender cond={value === "Asistencia Y Puntualidad Perfecta"}>
                            <Button
                                ref={dateButtonRef}
                                variant="outline-secondary"
                                title={rangeLabel}
                                className={`rounded-4 d-flex align-items-center justify-content-center ${dateError ? "border-danger text-danger" : ""}`}
                                // style={{ width: 32, height: 32 }}
                                onClick={() => setShowCalendar((s) => !s)}
                            >
                                Rango de fechas
                                <i className="bi bi-calendar3 ms-2" />
                            </Button>

                            <Overlay
                                target={dateButtonRef.current}
                                show={showCalendar}
                                placement="bottom-end"
                                rootClose
                                onHide={() => setShowCalendar(false)}
                            >
                                {({ ref, style }) => (
                                    <div ref={ref} style={style} className="mt-2 shadow-lg rounded-4 overflow-hidden bg-light text-capitalize">
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
                                                    variant="primary"
                                                    className="w-100"
                                                    onClick={() => { return setShowCalendar(false) }}
                                                // onClick={() => {
                                                //     // handleDateFilter();
                                                //     setShowCalendar(false);
                                                // }}
                                                >
                                                    Filtrar fechas
                                                </Button>
                                            </Col>

                                            <Col xs={12} md={6} lg={6}>
                                                <Button
                                                    variant="secondary"
                                                    className="w-100"
                                                    onClick={() => {
                                                        handleClearDates();
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
                        </ConditionalRender>

                        <ConditionalRender cond={value !== "Asistencia Y Puntualidad Perfecta"}>
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="outline-info"
                                    className="rounded-pill d-inline-flex align-items-center gap-2 px-3 fw-semibold text-uppercase bg-info-subtle text-info-emphasis border-info-subtle"
                                    style={{ minWidth: 140 }}
                                >
                                    <i className="bi bi-calendar-week" />
                                    <span className="text-truncate" style={{ maxWidth: 120 }}>
                                        {selectedPeriod ? selectedPeriod.numberPeriod : "Periodo"}
                                    </span>
                                </Dropdown.Toggle>

                                {mounted &&
                                    createPortal(
                                        <Dropdown.Menu
                                            className="shadow rounded-3 py-1"
                                            style={{ minWidth: 280, maxHeight: 320, overflowY: "auto" }}
                                        >
                                            <Dropdown.Header className="text-uppercase small fw-bold">
                                                Periodos
                                            </Dropdown.Header>

                                            {periods?.map((p) => (
                                                <Dropdown.Item
                                                    key={p.id}
                                                    active={selectedPeriod?.id === p.id}
                                                    onClick={() => handleSearchPeriod(String(p.id))}
                                                    className="d-flex flex-column py-2"
                                                >
                                                    <span className="fw-bold">{p.numberPeriod}</span>
                                                    <small className={selectedPeriod?.id === p.id ? "text-white-50" : "text-muted"}>
                                                        {formatCreatedAt(p.dateInit)} – {formatCreatedAt(p.dateEnd)}
                                                    </small>
                                                </Dropdown.Item>
                                            ))}

                                            <Dropdown.Divider />

                                            <Dropdown.Item
                                                onClick={handleClear}
                                                disabled={!selectedPeriod}
                                                className="text-danger d-flex align-items-center gap-2"
                                            >
                                                <i className="bi bi-arrow-return-left" />
                                                Periodo actual
                                            </Dropdown.Item>
                                        </Dropdown.Menu>,
                                        document.body
                                    )}

                            </Dropdown>
                        </ConditionalRender>
                    </div>
                </div>

                {dateError && (
                    <small className="text-danger d-block mb-2">{dateError}</small>
                )}

                {parsedStart && parsedEnd && (
                    <div className="text-muted small mb-1">Seleccionado: {rangeLabel}</div>
                )}

                <div className="fw-bold lh-1 mb-1 text-muted" style={{ fontSize: "clamp(1.20rem, 3vw, 2rem)" }}>
                    {value ?? "—"}
                </div>
                <div className="text-muted small mt-auto text-end">{label}</div>

                <Button
                    className="hover-clickable mt-2"
                    variant="info"
                    onClick={() => { return handleDownload(idCard ? idCard : null) }}
                >
                    <i className="bi bi-download me-2" />
                    Descargar
                </Button>
            </div>
        </>
    );
}

export default function CardsFiles({
    items,
    chunkSize = 4,
    periods,
    periodoActual,
}: {
    items: StatCardData[];
    chunkSize?: number;
    periods: ICurrentPeriod[];
    periodoActual: ICurrentPeriod | null;
}) {

    const groups = chunk(items, chunkSize);
    const [index, setIndex] = useState(0);

    const isFirst = index === 0;
    const isLast = index === groups.length - 1;

    const goTo = (direction: 1 | -1) => {
        setIndex((prev) => {
            const next = prev + direction;
            if (next < 0 || next >= groups.length) return prev;
            return next;
        });
    };

    return (
        <div className="h-100 p-3">
            <ConditionalRender cond={groups.length > 1}>
                <div className="d-flex justify-content-end gap-2 mb-2">
                    <button
                        type="button"
                        onClick={() => goTo(-1)}
                        disabled={isFirst}
                        className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, opacity: isFirst ? 0.4 : 1 }}
                        aria-label="Anterior"
                    >
                        <i className="bi bi-chevron-left" />
                    </button>
                    <button
                        type="button"
                        onClick={() => goTo(1)}
                        disabled={isLast}
                        className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, opacity: isLast ? 0.4 : 1 }}
                        aria-label="Siguiente"
                    >
                        <i className="bi bi-chevron-right" />
                    </button>
                </div>
            </ConditionalRender>

            <Carousel
                activeIndex={index}
                onSelect={setIndex}
                controls={false}
                indicators={false}
                interval={null}
                touch
            >
                {groups.map((group, i) => (
                    <Carousel.Item key={i}>
                        <div
                            className="d-grid gap-3 px-1 mb-5"
                            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}
                        >
                            {group.map((item) => (
                                <StatCard
                                    key={item.value} {...item}
                                    periods={periods}
                                    periodoActual={periodoActual}
                                />
                            ))}
                        </div>
                    </Carousel.Item>
                )
                )}
            </Carousel>
        </div>
    );
}