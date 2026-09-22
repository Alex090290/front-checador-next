"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Carousel, Col, Overlay, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import DatePicker, { registerLocale } from "react-datepicker";
import { useRouter, useSearchParams } from "next/navigation";
import { es } from "date-fns/locale";
import moment from "moment";

moment.locale("es");
registerLocale("es", es);


type FeedbackState = "loading" | "success" | "error" | null;

interface StatCardData {
    id?: string;
    label?: string;
    icon?: string;
    value?: string;
    accent?: string;
    changed?: boolean;
    view?: string;
    dateInit?: string;
    dateEnd?: string;
}


function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function StatCard({ label, icon, value, accent = "primary", isPending, dateInit, dateEnd }: StatCardData & { isPending?: boolean; onClick?: () => void }) {
    const router = useRouter();
    const [, setFeedbackMsg] = useState("");
    const [, setFeedback] = useState<FeedbackState>(null);
    const sp = useSearchParams();
    const searchParamsString = sp.toString();

    const [justArrived, setJustArrived] = useState(false);
    const [dateInitValue, setDateInitValue] = useState(dateInit ?? "");
    const [dateEndValue, setDateEndValue] = useState(dateEnd ?? "");
    const [dateError, setDateError] = useState("");

    const [showCalendar, setShowCalendar] = useState(false);
    const dateButtonRef = useRef(null);
    const parsedStart = dateInitValue ? moment(dateInitValue, "YYYY-MM-DD").toDate() : null;
    const parsedEnd = dateEndValue ? moment(dateEndValue, "YYYY-MM-DD").toDate() : null;

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

    const handleClear = () => {
        setDateInitValue("");
        setDateEndValue("");
    };

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



    useEffect(() => {
        // Solo dispara el flash cuando la data terminó de llegar (isPending pasó a false)
        if (!isPending) {
            setJustArrived(true);
        }
    }, [value, isPending]);

    return (
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
                    <Button
                        ref={dateButtonRef}
                        variant="black"

                        title={rangeLabel}
                        className={`border-light bg-black text-light rounded-4 d-flex align-items-center justify-content-center ${dateError ? "border-danger text-danger" : ""}`}
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
                                            onClick={() => {
                                                handleDateFilter();
                                                setShowCalendar(false);
                                            }}
                                        >
                                            Filtrar fechas
                                        </Button>
                                    </Col>

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
            >
                <i className="bi bi-download me-2" />
                Descargar
            </Button>
        </div>
    );
}

export default function CardsFiles({
    items,
    chunkSize = 4,
}: {
    items: StatCardData[];
    chunkSize?: number;
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