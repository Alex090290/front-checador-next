"use client"

import { Button, Card, Col, Container, Dropdown, InputGroup, Pagination, Row } from "react-bootstrap";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListView from "../templates/ListView";
import GenericSearchInput from "../employee/GenericSearchInput";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import ModalBlur from "../ModalBlur";
import EventsTabs from "./EventsTabs";
import ReviewPendingCheckModal from "./ReviewPendingCheckModal";
import { reviewPendingCheck } from "@/app/actions/pendingChecks-actions";
import { IPendingCheck, PendingCheckStatus, PendingCheckStatusFilter } from "@/lib/pendingChecks/interface";
import moment from "moment-timezone";

type FeedbackState = "loading" | "success" | "error" | null;

type ReviewState = {
    pendingCheck: IPendingCheck;
    action: "VALIDADA" | "RECHAZADA";
} | null;

const STATUS_OPTIONS: { value: PendingCheckStatusFilter; label: string }[] = [
    { value: "PENDIENTE", label: "Pendientes" },
    { value: "VALIDADA", label: "Validadas" },
    { value: "RECHAZADA", label: "Rechazadas" },
    { value: "TODOS", label: "Todas" },
];

// Fecha y hora en Ciudad de México: DD/MM/YYYY HH:mm
function formatDateTimeMx(value?: string) {
    const m = moment.utc(value).tz("America/Mexico_City");
    return m.isValid() ? m.format("DD/MM/YYYY HH:mm") : "—";
}

function formatMinutesLate(minutes: number) {
    const total = Math.max(Math.round(Number(minutes) || 0), 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours === 0) return `${mins} min`;
    return mins === 0 ? `${hours} h` : `${hours} h ${mins} min`;
}

function getInitials(name?: string, lastName?: string) {
    return `${(name ?? "").trim().charAt(0)}${(lastName ?? "").trim().charAt(0)}`.toUpperCase() || "?";
}

function statusBadge(status: PendingCheckStatus) {
    switch (status) {
        case "VALIDADA":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                    <i className="bi bi-check-circle me-1" />
                    Validada
                </span>
            );
        case "RECHAZADA":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    <i className="bi bi-x-circle me-1" />
                    Rechazada
                </span>
            );
        default:
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                    <i className="bi bi-hourglass-split me-1" />
                    Pendiente
                </span>
            );
    }
}

export default function PendingChecksTableClient({
    pendingChecks,
    total,
    errorMessage = "",
    page,
    limit,
    search = "",
    status,
    pendingCount,
    canReview,
}: {
    pendingChecks: IPendingCheck[];
    total: number;
    errorMessage?: string;
    page: number;
    limit: number;
    search?: string;
    status: PendingCheckStatusFilter;
    pendingCount: number;
    canReview: boolean;
}) {
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";

    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [review, setReview] = useState<ReviewState>(null);

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
        setFeedback(null);
        setFeedbackMsg("");
    }, [searchParamsString]);

    const navigate = useCallback((params: URLSearchParams, message = "Cargando...") => {
        setFeedback("loading");
        setFeedbackMsg(message);
        params.set("tab", "pendientes");
        router.push(`/app/eventos?${params.toString()}`);
    }, [router]);

    const goToPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParamsString);
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        navigate(params);
    };

    const handleSearch = useCallback(
        (value: string) => {
            const cleanValue = value.trim();
            if (cleanValue === currentSearch.trim()) return;

            const params = new URLSearchParams(searchParamsString);
            params.set("page", "1");
            params.set("limit", String(limit));
            if (cleanValue) {
                params.set("search", cleanValue);
            } else {
                params.delete("search");
            }
            navigate(params, "Buscando...");
        },
        [currentSearch, searchParamsString, limit, navigate]
    );

    const handleStatusFilter = (value: PendingCheckStatusFilter) => {
        if (value === status) return;

        const params = new URLSearchParams(searchParamsString);
        params.set("page", "1");
        params.set("limit", String(limit));
        params.set("status", value);
        navigate(params, "Filtrando...");
    };

    const handleReview = async (notes: string) => {
        if (!review) return;

        const { pendingCheck, action } = review;

        try {
            setFeedback("loading");
            setFeedbackMsg("Guardando...");

            const res = await reviewPendingCheck({ id: pendingCheck.id, status: action, notes });

            setReview(null);

            if (!res.success) {
                setFeedbackMsg(res.message || "No se pudo revisar la checada");
                setFeedback("error");
                // 409: alguien más ya la revisó, se refresca para ver su estado actual
                if (res.statusCode === 409) router.refresh();
                return;
            }

            setFeedbackMsg(res.message || "Checada revisada");
            setFeedback("success");
            router.refresh();
        } catch {
            setFeedbackMsg("Error inesperado, intenta de nuevo");
            setFeedback("error");
        }
    };

    const selectedStatusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? "Pendientes";

    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Cargando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>
                <EventsTabs
                    active="pendientes"
                    pendingCount={pendingCount}
                    onNavigate={(url) => {
                        setFeedback("loading");
                        setFeedbackMsg("Cargando...");
                        router.push(url);
                    }}
                />

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Checadas por validar</h1>
                        <span className="text-muted">
                            Checadas sin conexión que llegaron más de 1 hora tarde · {total} registro{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-3 p-md-5">
                                <Row className="mb-3 g-3">
                                    {/* FILTRO POR EMPLEADO */}
                                    <Col xs={12} md={6} lg={4}>
                                        <Card className="border rounded-4 h-100">
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="bi bi-person text-primary" />
                                                    <span className="fw-semibold small">Filtrar por empleado</span>
                                                </div>

                                                <InputGroup>
                                                    <InputGroup.Text
                                                        className="bg-gray"
                                                        style={{ color: "#6c757d" }}
                                                    >
                                                        <i className="bi bi-search" />
                                                    </InputGroup.Text>
                                                    <GenericSearchInput
                                                        initialValue={search}
                                                        onSearch={handleSearch}
                                                        placeholder="Buscar por nombre o apellido..."
                                                    />
                                                </InputGroup>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    {/* FILTRO POR ESTADO */}
                                    <Col xs={12} md={6} lg={4} style={{ minWidth: 0 }}>
                                        <Card className="rounded-4 border h-100">
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="bi bi-funnel text-primary" />
                                                    <span className="fw-semibold small">Filtrar por estado</span>
                                                </div>

                                                <Dropdown className="w-100">
                                                    <Dropdown.Toggle
                                                        id="pending-checks-status-filter"
                                                        as={Button}
                                                        variant="outline-secondary"
                                                        className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                        style={{ minWidth: 0 }}
                                                    >
                                                        <span className="text-truncate">{selectedStatusLabel}</span>
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu className="w-100">
                                                        {STATUS_OPTIONS.map((option) => (
                                                            <Dropdown.Item
                                                                key={option.value}
                                                                active={option.value === status}
                                                                onClick={() => handleStatusFilter(option.value)}
                                                            >
                                                                <span className="text-uppercase">{option.label}</span>
                                                            </Dropdown.Item>
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <ListView>
                                    <ListView.Body>
                                        <div className="table-responsive rounded-3 border overflow-auto">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-dark border-secondary">
                                                    <tr>
                                                        <th className="fw-bold">Empleado</th>
                                                        <th className="fw-bold">Departamento</th>
                                                        <th className="fw-bold text-nowrap">Checó</th>
                                                        <th className="fw-bold text-nowrap">Llegó</th>
                                                        <th className="fw-bold">Retraso</th>
                                                        <th className="fw-bold">Dispositivo</th>
                                                        <th className="fw-bold text-center">Estado</th>
                                                        <th className="fw-bold">Revisión</th>
                                                        <th className="fw-bold text-center">Acciones</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <ConditionalRender cond={pendingChecks.length === 0}>
                                                        <tr>
                                                            <td colSpan={9} className="text-center text-muted py-4">
                                                                {errorMessage || "No hay checadas para mostrar"}
                                                            </td>
                                                        </tr>
                                                    </ConditionalRender>

                                                    {pendingChecks.map((row) => {
                                                        const employee = row.employee;
                                                        const hasPicture = !!employee?.picture && /^(https?:|data:image\/)/.test(employee.picture);
                                                        const hasCoordinates =
                                                            !!row.coordinates &&
                                                            Number.isFinite(Number(row.coordinates.lat)) &&
                                                            Number.isFinite(Number(row.coordinates.lng)) &&
                                                            !(Number(row.coordinates.lat) === 0 && Number(row.coordinates.lng) === 0);

                                                        return (
                                                            <tr key={row.id}>
                                                                <td>
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        {hasPicture ? (
                                                                            // eslint-disable-next-line @next/next/no-img-element
                                                                            <img
                                                                                src={employee!.picture}
                                                                                alt=""
                                                                                className="rounded-circle object-fit-cover flex-shrink-0"
                                                                                style={{ width: 36, height: 36 }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                className="rounded-circle bg-primary-subtle text-primary-emphasis d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                                                                                style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                                                                            >
                                                                                {getInitials(employee?.name, employee?.lastName)}
                                                                            </div>
                                                                        )}
                                                                        <div className="text-uppercase">
                                                                            <div className="text-nowrap">
                                                                                {employee ? `${employee.lastName} ${employee.name}` : "—"}
                                                                            </div>
                                                                            <small className="text-muted">#{employee?.idCheck ?? row.idCheck}</small>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="text-uppercase">{row.department?.nameDepartment ?? "—"}</td>
                                                                <td className="text-nowrap">{formatDateTimeMx(row.eventTime)}</td>
                                                                <td className="text-nowrap">{formatDateTimeMx(row.receivedAt)}</td>
                                                                <td className="text-nowrap">{formatMinutesLate(row.minutesLate)}</td>
                                                                <td className="text-uppercase">
                                                                    <div className="text-nowrap">{row.checador?.name ?? "—"}</div>
                                                                    <ConditionalRender cond={hasCoordinates}>
                                                                        <a
                                                                            href={`https://www.google.com/maps?q=${row.coordinates?.lat},${row.coordinates?.lng}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="small text-nowrap text-capitalize"
                                                                        >
                                                                            <i className="bi bi-geo-alt me-1" />
                                                                            Ver ubicación
                                                                        </a>
                                                                    </ConditionalRender>
                                                                </td>
                                                                <td className="text-center">{statusBadge(row.status)}</td>
                                                                <td style={{ minWidth: 180 }}>
                                                                    {row.review ? (
                                                                        <div className="small">
                                                                            <div className="fw-semibold text-uppercase">
                                                                                {row.review.name || row.review.email || "—"}
                                                                            </div>
                                                                            <ConditionalRender cond={!!row.review.name && !!row.review.email}>
                                                                                <div className="text-muted">{row.review.email}</div>
                                                                            </ConditionalRender>
                                                                            <div className="text-muted">
                                                                                {formatDateTimeMx(row.review.reviewedAt)}
                                                                            </div>
                                                                            <ConditionalRender cond={!!row.review.notes}>
                                                                                <div className="fst-italic">“{row.review.notes}”</div>
                                                                            </ConditionalRender>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted small">Sin revisar</span>
                                                                    )}
                                                                </td>
                                                                <td className="align-middle">
                                                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                                                        <ConditionalRender cond={canReview && row.status === "PENDIENTE"}>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-success text-nowrap"
                                                                                onClick={() => setReview({ pendingCheck: row, action: "VALIDADA" })}
                                                                            >
                                                                                Validar
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger text-nowrap"
                                                                                onClick={() => setReview({ pendingCheck: row, action: "RECHAZADA" })}
                                                                            >
                                                                                Rechazar
                                                                            </button>
                                                                        </ConditionalRender>
                                                                        <a
                                                                            href={`/app/employee?view_type=form&id=${row.idEmployee}`}
                                                                            className="btn btn-sm btn-outline-info"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Ver
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            <small className="text-muted">
                                                Página {page} de {totalPages}
                                            </small>

                                            <ConditionalRender cond={totalPages > 1}>
                                                <Pagination size="sm" className="m-0">
                                                    <Pagination.Prev
                                                        disabled={page <= 1}
                                                        onClick={() => goToPage(page - 1)}
                                                    >
                                                        Anterior
                                                    </Pagination.Prev>

                                                    <ConditionalRender cond={visiblePages[0] > 1}>
                                                        <Pagination.Item onClick={() => goToPage(1)}>1</Pagination.Item>
                                                        <ConditionalRender cond={visiblePages[0] > 2}>
                                                            <Pagination.Ellipsis disabled />
                                                        </ConditionalRender>
                                                    </ConditionalRender>

                                                    {visiblePages.map((num) => (
                                                        <Pagination.Item
                                                            key={num}
                                                            active={num === page}
                                                            onClick={() => goToPage(num)}
                                                        >
                                                            {num}
                                                        </Pagination.Item>
                                                    ))}

                                                    <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages}>
                                                        <ConditionalRender cond={visiblePages[visiblePages.length - 1] < totalPages - 1}>
                                                            <Pagination.Ellipsis disabled />
                                                        </ConditionalRender>
                                                        <Pagination.Item onClick={() => goToPage(totalPages)}>{totalPages}</Pagination.Item>
                                                    </ConditionalRender>

                                                    <Pagination.Next
                                                        disabled={page >= totalPages}
                                                        onClick={() => goToPage(page + 1)}
                                                    >
                                                        Siguiente
                                                    </Pagination.Next>
                                                </Pagination>
                                            </ConditionalRender>
                                        </div>
                                    </ListView.Body>
                                </ListView>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {review && (
                    <ModalBlur onClose={() => setReview(null)}>
                        <ReviewPendingCheckModal
                            pendingCheck={review.pendingCheck}
                            action={review.action}
                            onHide={() => setReview(null)}
                            onConfirm={handleReview}
                        />
                    </ModalBlur>
                )}
            </Container>
        </>
    );
}
