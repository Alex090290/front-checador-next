"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Dropdown, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment-timezone";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import GenericSearchInput from "../employee/GenericSearchInput";
import VisitorEntryModal, { TVisitorEntryInputs } from "./VisitorEntryModal";
import VisitorExitModal from "./VisitorExitModal";
import VisitorSignaturesModal, { VisitorSignatureImages } from "./VisitorSignaturesModal";
import { getVisitorSignature, registerVisitorEntry, registerVisitorExit } from "@/app/actions/visitors-actions";
import { IVisitor, VisitorStatusFilter } from "@/lib/visitors/interface";
import { formatCreatedAtOnlyHours, formatDateHours } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;

const STATUS_OPTIONS: { value: VisitorStatusFilter; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "dentro", label: "Dentro" },
    { value: "salieron", label: "Ya salieron" },
];

const todayMx = () => moment.tz("America/Mexico_City").format("YYYY-MM-DD");

function formatDuration(minutes: number | null) {
    if (minutes === null || minutes === undefined) return "—";
    const total = Math.max(Math.round(minutes), 0);
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const insideBadge = (
    <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
        <i className="bi bi-door-open me-1" />
        Dentro
    </span>
);

export default function VisitorsClient({
    visitors,
    insideNow,
    total,
    page,
    limit,
    errorMessage,
    search,
    status,
    dateFrom,
    dateTo,
    canCreate,
    canExit,
}: {
    visitors: IVisitor[];
    insideNow: number;
    total: number;
    page: number;
    limit: number;
    errorMessage?: string;
    search: string;
    status: VisitorStatusFilter;
    dateFrom: string;
    dateTo: string;
    canCreate: boolean;
    canExit: boolean;
}) {
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";

    const [rows, setRows] = useState<IVisitor[]>(visitors);
    const [feedback, setFeedback] = useState<FeedbackState>(errorMessage ? "error" : null);
    const [feedbackMsg, setFeedbackMsg] = useState(errorMessage ?? "");
    const [showEntry, setShowEntry] = useState(false);
    const [exitVisitor, setExitVisitor] = useState<IVisitor | null>(null);
    const [signatures, setSignatures] = useState<{ visitor: IVisitor; images: VisitorSignatureImages } | null>(null);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const MAX_VISIBLE = 5;

    const visiblePages = useMemo(() => {
        if (totalPages <= MAX_VISIBLE) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = Math.max(1, page - Math.floor(MAX_VISIBLE / 2));
        let end = start + MAX_VISIBLE - 1;

        if (end > totalPages) {
            end = totalPages;
            start = end - MAX_VISIBLE + 1;
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [page, totalPages]);

    useEffect(() => {
        setRows(visitors);
    }, [visitors]);

    // Al llegar datos nuevos se quita el loading; si el back respondió error se muestra su message
    useEffect(() => {
        setFeedback(errorMessage ? "error" : null);
        setFeedbackMsg(errorMessage ?? "");
    }, [searchParamsString, errorMessage]);

    const showLoading = (message: string) => {
        setFeedback("loading");
        setFeedbackMsg(message);
    };
    const showResult = (success: boolean, message: string) => {
        setFeedback(success ? "success" : "error");
        setFeedbackMsg(message);
    };

    // Las fechas siempre van en la URL (vacías = sin filtro); sin el parámetro la página usa hoy
    const pushParams = useCallback((changes: Record<string, string>, message = "Filtrando...") => {
        const params = new URLSearchParams(searchParamsString);
        params.set("dateFrom", dateFrom);
        params.set("dateTo", dateTo);
        params.set("page", "1");
        params.set("limit", String(limit));
        Object.entries(changes).forEach(([key, value]) => {
            if (value || key === "dateFrom" || key === "dateTo") params.set(key, value);
            else params.delete(key);
        });
        showLoading(message);
        router.push(`/app/visitors?${params.toString()}`);
    }, [searchParamsString, dateFrom, dateTo, limit, router]);

    const goToPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParamsString);
        params.set("dateFrom", dateFrom);
        params.set("dateTo", dateTo);
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        showLoading("Cargando...");
        router.push(`/app/visitors?${params.toString()}`);
    };

    const handleSearch = useCallback((value: string) => {
        if (value.trim() === currentSearch.trim()) return;
        pushParams({ search: value.trim() }, "Buscando...");
    }, [currentSearch, pushParams]);

    const handleEntry = async (data: TVisitorEntryInputs) => {
        try {
            showLoading("Registrando entrada...");
            const res = await registerVisitorEntry(data);

            if (!res.success) {
                showResult(false, res.message || "No se pudo registrar la entrada");
                return;
            }

            setShowEntry(false);
            showResult(true, res.message);
            router.refresh();
        } catch {
            showResult(false, "Error inesperado, intenta de nuevo");
        }
    };

    const handleExit = async (signature: string) => {
        if (!exitVisitor) return;

        try {
            showLoading("Registrando salida...");
            const res = await registerVisitorExit(exitVisitor.id, signature);

            if (!res.success) {
                // 409: otra persona ya registró la salida; 404: ya no existe → se recarga el listado
                if (res.statusCode === 409 || res.statusCode === 404) {
                    setExitVisitor(null);
                    router.refresh();
                }
                showResult(false, res.message || "No se pudo registrar la salida");
                return;
            }

            if (res.data) {
                const updated = res.data;
                setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
            }
            setExitVisitor(null);
            showResult(true, res.message);
            router.refresh();
        } catch {
            showResult(false, "Error inesperado, intenta de nuevo");
        }
    };

    const handleShowSignatures = async (visitor: IVisitor) => {
        try {
            showLoading("Cargando firmas...");

            const [entry, exit] = await Promise.all([
                getVisitorSignature(visitor.id, "entry"),
                visitor.exitAt ? getVisitorSignature(visitor.id, "exit") : Promise.resolve(null),
            ]);

            setSignatures({
                visitor,
                images: {
                    entry: entry.data,
                    exit: exit?.data ?? null,
                    entryMessage: entry.success ? "" : entry.message || "No se pudo cargar la firma de entrada",
                    exitMessage: !exit || exit.statusCode === 404
                        ? "Todavía no registra su salida"
                        : exit.success ? "" : exit.message || "No se pudo cargar la firma de salida",
                },
            });
            setFeedback(null);
        } catch {
            showResult(false, "No se pudieron cargar las firmas, intenta de nuevo");
        }
    };

    const selectedStatusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Todos";
    const isToday = dateFrom === todayMx() && dateTo === todayMx();
    const hasFilters = !!(search || status !== "todos" || dateFrom || dateTo);

    return (
        <>
            {/* Modales antes de los avisos en el DOM: "Registrando..." y el resultado quedan encima (mismo zIndex) */}
            {showEntry && (
                <VisitorEntryModal onClose={() => setShowEntry(false)} onSubmit={handleEntry} />
            )}

            {exitVisitor && (
                <VisitorExitModal visitor={exitVisitor} onClose={() => setExitVisitor(null)} onSubmit={handleExit} />
            )}

            {signatures && (
                <VisitorSignaturesModal
                    visitor={signatures.visitor}
                    images={signatures.images}
                    onClose={() => setSignatures(null)}
                />
            )}

            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Cargando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay message={feedbackMsg} onDone={() => setFeedback(null)} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay message={feedbackMsg} onDone={() => setFeedback(null)} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>
                <ConditionalRender cond={canCreate}>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <Button
                            variant="primary"
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                            onClick={() => setShowEntry(true)}
                        >
                            <i className="bi bi-box-arrow-in-right" />
                            Registrar entrada
                        </Button>
                    </div>
                </ConditionalRender>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <div>
                        <h1 className="mb-0">Visitantes</h1>
                        <span className="text-muted">
                            {total} visita{total !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle fs-6">
                        <i className="bi bi-door-open me-2" />
                        Dentro ahora: {insideNow}
                    </span>
                </div>

                <Card className="rounded-4 shadow-sm border">
                    <Card.Body className="p-3 p-md-5">
                        <Row className="mb-4 g-3">
                            {/* BUSCADOR */}
                            <Col xs={12} lg={4} style={{ minWidth: 0 }}>
                                <Card className="border rounded-4 h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-person text-primary" />
                                            <span className="fw-semibold small">Buscar visitante</span>
                                        </div>

                                        <InputGroup>
                                            <InputGroup.Text className="bg-gray" style={{ color: "#6c757d" }}>
                                                <i className="bi bi-search" />
                                            </InputGroup.Text>
                                            <GenericSearchInput
                                                initialValue={search}
                                                onSearch={handleSearch}
                                                placeholder="Nombre o empresa"
                                            />
                                        </InputGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* ESTATUS */}
                            <Col xs={12} sm={6} lg={3} style={{ minWidth: 0 }}>
                                <Card className="rounded-4 border h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-funnel text-primary" />
                                            <span className="fw-semibold small">Filtrar por estatus</span>
                                        </div>

                                        <Dropdown className="w-100">
                                            <Dropdown.Toggle
                                                id="visitors-filter-status"
                                                as={Button}
                                                variant="outline-secondary"
                                                className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                            >
                                                <span className="text-truncate">{selectedStatusLabel}</span>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                {STATUS_OPTIONS.map((option) => (
                                                    <Dropdown.Item
                                                        key={option.value}
                                                        active={option.value === status}
                                                        onClick={() => option.value !== status && pushParams({ status: option.value === "todos" ? "" : option.value })}
                                                    >
                                                        <span className="text-uppercase">{option.label}</span>
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* FECHAS DE ENTRADA */}
                            <Col xs={12} sm={6} lg={5} style={{ minWidth: 0 }}>
                                <Card className="rounded-4 border h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-calendar3 text-primary" />
                                                <span className="fw-semibold small">Fecha de entrada</span>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    disabled={isToday}
                                                    onClick={() => pushParams({ dateFrom: todayMx(), dateTo: todayMx() })}
                                                >
                                                    Hoy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    disabled={!dateFrom && !dateTo}
                                                    onClick={() => pushParams({ dateFrom: "", dateTo: "" })}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise" />
                                                </Button>
                                            </div>
                                        </div>

                                        <Row className="g-2">
                                            <Col xs={6}>
                                                <Form.Control
                                                    id="visitors-date-from"
                                                    type="date"
                                                    aria-label="Desde"
                                                    value={dateFrom}
                                                    max={dateTo || undefined}
                                                    onChange={(e) => e.target.value !== dateFrom && pushParams({ dateFrom: e.target.value })}
                                                />
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Control
                                                    id="visitors-date-to"
                                                    type="date"
                                                    aria-label="Hasta"
                                                    value={dateTo}
                                                    min={dateFrom || undefined}
                                                    onChange={(e) => e.target.value !== dateTo && pushParams({ dateTo: e.target.value })}
                                                />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <div className="table-responsive rounded-3 border overflow-auto">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark border-secondary">
                                    <tr>
                                        <th className="fw-bold">Nombre</th>
                                        <th className="fw-bold">Empresa</th>
                                        <th className="fw-bold">Motivo</th>
                                        <th className="fw-bold">Entrada</th>
                                        <th className="fw-bold">Salida</th>
                                        <th className="fw-bold">Duración</th>
                                        <th className="fw-bold">Registró</th>
                                        <th className="fw-bold text-center">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <ConditionalRender cond={rows.length === 0}>
                                        <tr>
                                            <td colSpan={8} className="text-center text-muted py-4">
                                                {errorMessage || (hasFilters
                                                    ? "No hay visitas con los filtros aplicados"
                                                    : "No hay visitas registradas")}
                                            </td>
                                        </tr>
                                    </ConditionalRender>

                                    {rows.map((row) => (
                                        <tr key={row.id}>
                                            <td className="text-uppercase text-nowrap fw-semibold">{row.name}</td>
                                            <td className="text-uppercase">{row.company || "—"}</td>
                                            <td className="text-uppercase" style={{ minWidth: 200, maxWidth: 320, whiteSpace: "normal" }}>{row.reason}</td>
                                            <td className="text-nowrap">{formatDateHours(row.entryAt)}</td>
                                            <td className="text-nowrap">
                                                {row.status === "DENTRO" || !row.exitAt ? insideBadge : formatCreatedAtOnlyHours(row.exitAt)}
                                            </td>
                                            <td className="text-nowrap">{row.status === "DENTRO" ? "—" : formatDuration(row.durationMinutes)}</td>
                                            <td className="text-uppercase small">{row.entrySignature?.registeredBy?.name || "—"}</td>
                                            <td>
                                                <div className="d-flex justify-content-center align-items-center gap-2">
                                                    <ConditionalRender cond={canExit && row.status === "DENTRO"}>
                                                        <button
                                                            className="btn btn-sm btn-outline-success text-nowrap"
                                                            onClick={() => setExitVisitor(row)}
                                                        >
                                                            Registrar salida
                                                        </button>
                                                    </ConditionalRender>
                                                    <button
                                                        className="btn btn-sm btn-outline-info text-nowrap"
                                                        onClick={() => handleShowSignatures(row)}
                                                    >
                                                        Ver firmas
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4">
                            <small className="text-muted">
                                Página {page} de {totalPages}
                            </small>

                            <ConditionalRender cond={totalPages > 1}>
                                <Pagination size="sm" className="m-0">
                                    <Pagination.Prev disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                                        Anterior
                                    </Pagination.Prev>

                                    <ConditionalRender cond={visiblePages[0] > 1}>
                                        <Pagination.Item onClick={() => goToPage(1)}>1</Pagination.Item>
                                        <ConditionalRender cond={visiblePages[0] > 2}>
                                            <Pagination.Ellipsis disabled />
                                        </ConditionalRender>
                                    </ConditionalRender>

                                    {visiblePages.map((num) => (
                                        <Pagination.Item key={num} active={num === page} onClick={() => goToPage(num)}>
                                            {num}
                                        </Pagination.Item>
                                    ))}

                                    <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages}>
                                        <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages - 1}>
                                            <Pagination.Ellipsis disabled />
                                        </ConditionalRender>
                                        <Pagination.Item onClick={() => goToPage(totalPages)}>{totalPages}</Pagination.Item>
                                    </ConditionalRender>

                                    <Pagination.Next disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
                                        Siguiente
                                    </Pagination.Next>
                                </Pagination>
                            </ConditionalRender>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}
