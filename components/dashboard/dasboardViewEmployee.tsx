"use client"

import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useCallback, useEffect, useMemo, useRef, useTransition } from "react";
import { Card, Container, Dropdown, Row } from "react-bootstrap";
import { Employee, ICurrentPeriod } from "@/lib/definitions";
import { IStatistics } from "@/lib/statistics/interface";
import { useRouter, useSearchParams } from "next/navigation";
import BasicCarousel from "./Carousel";
import { formatCreatedAt } from "@/lib/helpers";


function StatCard({
    label,
    icon,
    value,
    accent = "primary",
}: {
    label: string;
    icon: string;
    accent?: string;
    value?: number;
}) {
    return (
        <div className="border rounded-3 p-3 h-100">
            <div
                className={`d-flex align-items-center justify-content-center rounded-circle bg-${accent}-subtle text-${accent}-emphasis mb-3`}
                style={{ width: 40, height: 40 }}
            >
                <i className={`bi bi-${icon} text-${accent}`} />
            </div>
            <div className="fw-bold lh-1" style={{ fontSize: "2rem" }}>
                {value ?? "—"}
            </div>
            <div className="text-muted small mt-1">{label}</div>
            {/* <div className="text-muted small mt-2 pt-2 border-top">
                <span className="fw-semibold">{yearValue ?? "—"}</span> en el año
            </div> */}
        </div>
    );
}

export default function DashboardViewEmployee({
    statistics,
    periods,
    periodoActual,
    employee
}: {
    statistics: IStatistics;
    periods: ICurrentPeriod[];
    periodoActual: ICurrentPeriod | null;
    employee: Employee | null;
}) {
    const session = useSessionSnapshot();
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const [isPending, startTransition] = useTransition();

    const hasAppliedDefaultFilters = useRef(false);
    const currentPeriod = sp.get("idPeriod") ?? "";
    const currentYear = sp.get("year") ?? "";

    const dataPeriod = statistics.period;
    const dataYear = statistics.year;
    


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
        () => periods.find((p) => String(p.id) === currentPeriod),
        [periods, currentPeriod]
    );
       
    const baseItems = [
        { label: "Permisos solicitados", icon: "file-earmark-ruled", value: dataPeriod.permissions, view: "permissions" },
        { label: "Vacaciones solicitadas", icon: "calendar4-week", value: dataPeriod.vacations, accent: "pink" },
        { label: "Incapacidades", icon: "clipboard2-pulse", value: dataPeriod.disabilities, accent: "orange" },
        { label: "Horas extra", icon: "clock-history", value: dataPeriod.overtimes, accent: "info" },
        { label: "Penalizaciones", icon: "exclamation-octagon", value: dataPeriod.penalties, accent: "danger" },
        { label: "Faltas justificadas", icon: "calendar-check", value: dataPeriod.excusedAbsences, accent: "success" },
        { label: "Faltas injustificadas", icon: "calendar-x", value: dataPeriod.unexcusedAbsences, accent: "purple" },
    ];

    return (
        <>
            <Container fluid className="py-3 px-4" style={{ maxWidth: "1600px" }}>
                <div className="mb-4">
                    <h1 className="mb-1 ms-1">Bienvenido <strong className="text-capitalize text-primary">{session?.uid?.name}</strong></h1>
                    <p className="text-muted mb-0 ms-1">
                        Panel de incidencias.
                    </p>
                </div>

                <Card
                    className="border shadow-sm rounded-4"
                    style={{ minHeight: "calc(100vh - 220px)" }}
                >
                    <Card.Body className="p-3">

                        <div className="d-flex flex-wrap align-items-center gap-3 p-3 border rounded-4 mb-3">
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary"
                                style={{ width: 48, height: 48, flexShrink: 0 }}
                            >
                                <i className="bi bi-person-fill fs-5" />
                            </div>

                            <div className="me-auto">
                                <div className="fw-bold text-capitalize">{session?.uid?.name}</div>
                                <div className="text-muted small text-capitalize">{employee?.position?.namePosition ?? "Sin puesto registrado"}</div>
                            </div>

                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle text-capitalize">
                                <i className="bi bi-building text-muted" /> {employee?.branch?.name || "Sin sucursal"}
                            </span>
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle text-capitalize">
                                <i className="bi bi-columns-gap text-muted" /> {employee?.department?.nameDepartment || "Sin departamento"}
                            </span>
                        </div>

                        <Row className="mt-4 mb-4">
                            <div className="d-flex align-items-center gap-2 mt-2 ms-2">
                                <i className="bi bi-calendar-week text-primary" />
                                <h6 className="mb-0 fw-bold">Incidencias del periodo</h6>
                                <Dropdown className="w-50" style={{maxWidth: "250px"}}>
                                    <Dropdown.Toggle
                                        variant="outline-secondary"
                                        className="w-100 d-flex align-items-center justify-content-between text-uppercase badge rounded-pill bg-info-subtle text-info-emphasis border border-info-subtle"
                                    >
                                    {selectedPeriod ? selectedPeriod.numberPeriod : "SELECCIONA UN PERIODO"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100" style={{ maxHeight: "300px",maxWidth: "250px", overflowY: "auto" }}>
                                        <Dropdown.Item
                                            active={currentPeriod === ""}
                                            onClick={() => handleClear()}
                                        >
                                            LIMPIAR
                                        </Dropdown.Item>
                                        {periods.map((p) => (
                                            <Dropdown.Item
                                                key={p.id}
                                                onClick={() => handleSearchPeriod(String(p.id))}
                                                style={{maxWidth: "250px"}}
                                            >
                                                <strong className="fw-bold">{p.numberPeriod} </strong> <span className="text-muted">{formatCreatedAt(p.dateInit)} - {formatCreatedAt(p.dateEnd)} </span>
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>


                            <BasicCarousel
                                items={baseItems}
                                isPending={isPending}
                                view={String(baseItems.map((d) => d.view))}
                            />
                        </Row>

                        <Row>
                            <div className="d-flex align-items-center gap-2 mt-2 ms-2 mb-4">
                                <i className="bi bi-calendar-check text-primary" />
                                <h6 className="mb-0 fw-bold">Incidencias del año</h6>
                            </div>
                            <div
                                className="d-grid gap-3 mt-2"
                                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
                            >
                                <StatCard label="Permisos solicitados" icon="file-earmark-ruled" value={dataYear.permissions} />
                                <StatCard label="Vacaciones solicitadas" icon="calendar4-week" value={dataYear.vacations} accent="pink" />
                                <StatCard label="Incapacidades" icon="clipboard2-pulse" value={dataYear.disabilities} accent="orange" />
                                <StatCard label="Horas extra" icon="clock-history" value={dataYear.overtimes} accent="info" />
                                <StatCard label="Penalizaciones" icon="exclamation-octagon" value={dataYear.penalties} accent="danger" />
                                <StatCard label="Faltas justificadas" icon="calendar-check" value={dataYear.excusedAbsences} accent="success" />
                                <StatCard label="Faltas injustificadas" icon="calendar-x" value={dataYear.unexcusedAbsences} accent="purple" />
                            </div>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}