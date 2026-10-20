"use client";

import { Branch, Department } from "@/lib/definitions";
import { IParticipationEmployee, ParticipationFilter } from "@/lib/reportsParticipation/interface";
import { updateReportsParticipation } from "@/app/actions/reportsParticipation-actions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Dropdown, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import ModalBlur from "../ModalBlur";
import GenericSearchInput from "../employee/GenericSearchInput";
import ParticipationModal, { ParticipationAction } from "./ParticipationModal";
import { formatDateHours, formatDateMx } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;

type ModalState = {
    action: ParticipationAction;
    ids: number[];
    employeeName?: string;
} | null;

const PARTICIPATION_OPTIONS: { value: ParticipationFilter; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "participa", label: "Participan" },
    { value: "no_participa", label: "No participan" },
];

const wrapStyle: React.CSSProperties = {
    whiteSpace: "normal",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    minWidth: 0,
};

function getInitials(name?: string, lastName?: string) {
    return `${(name ?? "").trim().charAt(0)}${(lastName ?? "").trim().charAt(0)}`.toUpperCase() || "?";
}

const badgeClass = (color: string) =>
    `badge rounded-pill px-2 py-2 fw-semibold bg-${color}-subtle text-${color}-emphasis border border-${color}-subtle text-wrap`;

function participationBadge(row: IParticipationEmployee) {
    const p = row.reportsParticipation;

    if (row.participatesToday && !p) {
        return <span className={badgeClass("secondary")}><i className="bi bi-dash-circle me-1" />Participa (sin configurar)</span>;
    }
    if (row.participatesToday) {
        return (
            <span className={badgeClass("success")}>
                <i className="bi bi-check-circle me-1" />
                {p?.since ? `Participa desde ${formatDateMx(p.since)}` : "Participa"}
            </span>
        );
    }
    if (p?.active) {
        return (
            <span className={badgeClass("primary")}>
                <i className="bi bi-calendar-event me-1" />
                {p.since ? `Participará desde ${formatDateMx(p.since)}` : "Participará"}
            </span>
        );
    }
    return <span className={badgeClass("danger")}><i className="bi bi-x-circle me-1" />No participa</span>;
}

export default function ReportsParticipationClient({
    employees,
    total,
    page,
    limit,
    errorMessage,
    search,
    participation,
    departments = [],
    branches = [],
    canUpdate,
}: {
    employees: IParticipationEmployee[];
    total: number;
    page: number;
    limit: number;
    errorMessage?: string;
    search?: string;
    participation: ParticipationFilter;
    departments?: Department[];
    branches?: Branch[];
    canUpdate: boolean;
}) {
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const currentBranch = sp.get("branch") ?? "";
    const currentIdDepartment = sp.get("idDepartment") ?? "";

    const [feedbackMsg, setFeedbackMsg] = useState(errorMessage ?? "");
    const [feedback, setFeedback] = useState<FeedbackState>(errorMessage ? "error" : null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [modal, setModal] = useState<ModalState>(null);
    // Si el back niega el cambio por permisos, se deshabilitan las acciones (la tabla se puede seguir viendo)
    const [forbidden, setForbidden] = useState(false);
    const actionsEnabled = canUpdate && !forbidden;

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

    // Al llegar datos nuevos se quita el loading y la selección; si el back respondió error se muestra su message
    useEffect(() => {
        setFeedback(errorMessage ? "error" : null);
        setFeedbackMsg(errorMessage ?? "");
        setSelectedIds([]);
    }, [searchParamsString, errorMessage]);

    const pushParams = useCallback((params: URLSearchParams, message = "Cargando...") => {
        setFeedback("loading");
        setFeedbackMsg(message);
        router.push(`/app/reportsParticipation?${params.toString()}`);
    }, [router]);

    const goToPage = (nextPage: number) => {
        const params = new URLSearchParams(searchParamsString);
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        pushParams(params);
    };

    const setFilter = useCallback((key: string, value: string, current: string, message = "Filtrando...") => {
        if (value === current) return;

        const params = new URLSearchParams(searchParamsString);
        params.set("page", "1");
        params.set("limit", String(limit));
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        pushParams(params, message);
    }, [searchParamsString, limit, pushParams]);

    const handleSearch = useCallback(
        (value: string) => setFilter("search", value.trim(), currentSearch.trim(), "Buscando..."),
        [setFilter, currentSearch]
    );

    const selectedBranchName = useMemo(() => {
        const found = branches.find((br) => String(br.id) === currentBranch);
        return found ? found.name : "Sucursales";
    }, [currentBranch, branches]);

    const selectedDepartmentName = useMemo(() => {
        const found = departments.find((dep) => String(dep.id) === currentIdDepartment);
        return found ? found.nameDepartment : "Departamentos";
    }, [currentIdDepartment, departments]);

    const selectedParticipationLabel = PARTICIPATION_OPTIONS.find((o) => o.value === participation)?.label ?? "Todos";

    // Selección
    const pageIds = employees.map((e) => e.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleSelectPage = () => {
        setSelectedIds((prev) => allPageSelected
            ? prev.filter((id) => !pageIds.includes(id))
            : [...new Set([...prev, ...pageIds])]);
    };

    const handleConfirm = async (since?: string) => {
        if (!modal) return;

        const { action, ids } = modal;

        try {
            setModal(null);
            setFeedback("loading");
            setFeedbackMsg("Guardando...");

            const res = await updateReportsParticipation({ ids, active: action === "include", since });

            const notFoundText = res.notFound.length > 0
                ? ` · No se encontraron o ya no están activos: ${res.notFound.join(", ")}`
                : "";

            if (!res.success) {
                if (/permiso/i.test(res.message)) setForbidden(true);
                setFeedbackMsg(`${res.message || "No se pudo cambiar la participación"}${notFoundText}`);
                setFeedback("error");
                return;
            }

            setSelectedIds([]);
            setFeedbackMsg(`${res.message}${notFoundText}`);
            setFeedback("success");
            router.refresh();
        } catch {
            setFeedbackMsg("Error inesperado, intenta de nuevo");
            setFeedback("error");
        }
    };

    const hasFilters = !!(search || currentBranch || currentIdDepartment || participation !== "todos");

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
                <div className="d-flex flex-wrap gap-2 mb-4">
                    <Button
                        variant="success"
                        className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                        disabled={!actionsEnabled || selectedIds.length === 0}
                        onClick={() => setModal({ action: "include", ids: selectedIds })}
                    >
                        <i className="bi bi-person-check" />
                        Incluir en reportes
                    </Button>

                    <Button
                        variant="danger"
                        className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                        disabled={!actionsEnabled || selectedIds.length === 0}
                        onClick={() => setModal({ action: "exclude", ids: selectedIds })}
                    >
                        <i className="bi bi-person-x" />
                        Excluir de reportes
                    </Button>
                </div>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div>
                        <h1 className="mb-0">Participación en reportes</h1>
                        <span className="text-muted">
                            {total} empleado{total !== 1 ? "s" : ""} activo{total !== 1 ? "s" : ""}
                            {selectedIds.length > 0 && ` · ${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>
                </div>

                <Alert variant="info" className="rounded-4 small">
                    <div className="fw-semibold mb-1">
                        <i className="bi bi-info-circle me-2" />
                        ¿Qué significa participar?
                    </div>
                    <ul className="mb-0 ps-4">
                        <li><span className="fw-semibold">Participa:</span> se le generan faltas automáticas si no checa y entra a prenómina, vales, bono de asistencia y puntualidad, reportes del checador y gráficas del dashboard.</li>
                        <li><span className="fw-semibold">No participa:</span> nada de lo anterior. Sigue apareciendo en Empleados, Directorio y Organigrama, y sí puede checar; solo no cuenta en los cálculos.</li>
                        <li><span className="fw-semibold">Participa desde una fecha:</span> solo cuenta lo de ese día en adelante.</li>
                        <li>Un empleado que nunca se ha configurado participa, como hasta hoy.</li>
                    </ul>
                </Alert>

                <ConditionalRender cond={!actionsEnabled}>
                    <Alert variant="warning" className="rounded-4 small">
                        <i className="bi bi-lock me-2" />
                        No cuentas con el permiso para cambiar la participación en reportes; solo puedes consultarla.
                    </Alert>
                </ConditionalRender>

                <Card className="rounded-4 shadow-sm border">
                    <Card.Body className="p-3 p-md-5">
                        <Row className="mb-4 g-3">
                            {/* BUSCADOR */}
                            <Col xs={12} lg={6} xl={3} style={{ minWidth: 0 }}>
                                <Card className="border rounded-4 h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-person text-primary" />
                                            <span className="fw-semibold small">Buscar empleado</span>
                                        </div>

                                        <InputGroup>
                                            <InputGroup.Text className="bg-gray" style={{ color: "#6c757d" }}>
                                                <i className="bi bi-search" />
                                            </InputGroup.Text>
                                            <GenericSearchInput
                                                initialValue={search}
                                                onSearch={handleSearch}
                                                placeholder="Nombre, apellido o número de checador"
                                            />
                                        </InputGroup>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* FILTRO DE DEPARTAMENTOS */}
                            <Col xs={12} sm={6} lg={6} xl={3} style={{ minWidth: 0 }}>
                                <Card className="rounded-4 border h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-columns-gap text-primary" />
                                            <span className="fw-semibold small">Filtrar por departamento</span>
                                        </div>

                                        <Dropdown className="w-100">
                                            <Dropdown.Toggle
                                                id="participation-filter-department"
                                                as={Button}
                                                variant="outline-secondary"
                                                className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                style={{ minWidth: 0 }}
                                            >
                                                <span style={{ ...wrapStyle, textAlign: "left" }}>{selectedDepartmentName}</span>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                <Dropdown.Item
                                                    active={!currentIdDepartment}
                                                    onClick={() => setFilter("idDepartment", "", currentIdDepartment)}
                                                >
                                                    <span className="text-uppercase text-muted">TODOS</span>
                                                </Dropdown.Item>

                                                {departments.map((dep) => (
                                                    <Dropdown.Item
                                                        key={dep.id}
                                                        active={String(dep.id) === currentIdDepartment}
                                                        onClick={() => setFilter("idDepartment", String(dep.id), currentIdDepartment)}
                                                    >
                                                        <span className="text-uppercase">{dep.nameDepartment}</span>
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* FILTRO DE SUCURSALES */}
                            <Col xs={12} sm={6} lg={6} xl={3} style={{ minWidth: 0 }}>
                                <Card className="rounded-4 border h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-building text-primary" />
                                            <span className="fw-semibold small">Filtrar por sucursal</span>
                                        </div>

                                        <Dropdown className="w-100">
                                            <Dropdown.Toggle
                                                id="participation-filter-branch"
                                                as={Button}
                                                variant="outline-secondary"
                                                className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                style={{ minWidth: 0 }}
                                            >
                                                <span style={{ ...wrapStyle, textAlign: "left" }}>{selectedBranchName}</span>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                <Dropdown.Item
                                                    active={!currentBranch}
                                                    onClick={() => setFilter("branch", "", currentBranch)}
                                                >
                                                    <span className="text-uppercase text-muted">TODOS</span>
                                                </Dropdown.Item>

                                                {branches.map((br) => (
                                                    <Dropdown.Item
                                                        key={br.id}
                                                        active={String(br.id) === currentBranch}
                                                        onClick={() => setFilter("branch", String(br.id), currentBranch)}
                                                    >
                                                        <span className="text-uppercase">{br.name}</span>
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* FILTRO DE PARTICIPACIÓN */}
                            <Col xs={12} sm={6} lg={6} xl={3} style={{ minWidth: 0 }}>
                                <Card className="rounded-4 border h-100">
                                    <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-funnel text-primary" />
                                            <span className="fw-semibold small">Filtrar por participación</span>
                                        </div>

                                        <Dropdown className="w-100">
                                            <Dropdown.Toggle
                                                id="participation-filter-status"
                                                as={Button}
                                                variant="outline-secondary"
                                                className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                style={{ minWidth: 0 }}
                                            >
                                                <span style={{ ...wrapStyle, textAlign: "left" }}>{selectedParticipationLabel}</span>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="w-100">
                                                {PARTICIPATION_OPTIONS.map((option) => (
                                                    <Dropdown.Item
                                                        key={option.value}
                                                        active={option.value === participation}
                                                        onClick={() => setFilter("participation", option.value === "todos" ? "" : option.value, participation === "todos" ? "" : participation)}
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

                        <div className="table-responsive rounded-3 border overflow-auto">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-dark border-secondary">
                                    <tr>
                                        <th className="text-center" style={{ width: 44 }}>
                                            <Form.Check
                                                id="participation-select-page"
                                                aria-label="Seleccionar todos los de esta página"
                                                checked={allPageSelected}
                                                disabled={!actionsEnabled || pageIds.length === 0}
                                                onChange={toggleSelectPage}
                                            />
                                        </th>
                                        <th className="fw-bold">Empleado</th>
                                        <th className="fw-bold">Departamento</th>
                                        <th className="fw-bold">Puesto</th>
                                        <th className="fw-bold">Sucursal</th>
                                        <th className="fw-bold text-center">Estado</th>
                                        <th className="fw-bold">Última modificación</th>
                                        <th className="fw-bold text-center">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <ConditionalRender cond={employees.length === 0}>
                                        <tr>
                                            <td colSpan={8} className="text-center text-muted py-4">
                                                {errorMessage || (hasFilters
                                                    ? "No se encontró ningún empleado con los filtros aplicados"
                                                    : "No hay empleados activos")}
                                            </td>
                                        </tr>
                                    </ConditionalRender>

                                    {employees.map((row) => {
                                        const isSelected = selectedIds.includes(row.id);
                                        const hasPicture = !!row.picture && /^(https?:|data:image\/)/.test(row.picture);
                                        const fullName = `${row.lastName} ${row.name}`;
                                        const p = row.reportsParticipation;

                                        return (
                                            <tr key={row.id} className={isSelected ? "table-secondary table-row-selected" : ""}>
                                                <td className="text-center">
                                                    <Form.Check
                                                        id={`participation-select-${row.id}`}
                                                        aria-label={`Seleccionar a ${fullName}`}
                                                        checked={isSelected}
                                                        disabled={!actionsEnabled}
                                                        onChange={() => toggleSelect(row.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {hasPicture ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={row.picture}
                                                                alt=""
                                                                className="rounded-circle object-fit-cover flex-shrink-0"
                                                                style={{ width: 36, height: 36 }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="rounded-circle bg-primary-subtle text-primary-emphasis d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                                                                style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                                                            >
                                                                {getInitials(row.name, row.lastName)}
                                                            </div>
                                                        )}
                                                        <div className="text-uppercase">
                                                            <div className="text-nowrap">{fullName}</div>
                                                            <small className="text-muted">#{row.idCheck}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-uppercase">{row.department?.nameDepartment ?? "—"}</td>
                                                <td className="text-uppercase">{row.position?.namePosition ?? "—"}</td>
                                                <td className="text-uppercase">{row.branch?.name ?? "—"}</td>
                                                <td className="text-center">{participationBadge(row)}</td>
                                                <td style={{ minWidth: 160 }}>
                                                    {p?.updatedBy ? (
                                                        <div className="small">
                                                            <div className="fw-semibold text-uppercase">{p.updatedBy.name || p.updatedBy.email || "—"}</div>
                                                            <div className="text-muted">{formatDateHours(p.updatedAt)}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center align-items-center gap-2">
                                                        <ConditionalRender cond={!row.participatesToday}>
                                                            <button
                                                                className="btn btn-sm btn-outline-success text-nowrap"
                                                                disabled={!actionsEnabled}
                                                                onClick={() => setModal({ action: "include", ids: [row.id], employeeName: fullName })}
                                                            >
                                                                Incluir
                                                            </button>
                                                        </ConditionalRender>
                                                        <ConditionalRender cond={row.participatesToday || !!p?.active}>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger text-nowrap"
                                                                disabled={!actionsEnabled}
                                                                onClick={() => setModal({ action: "exclude", ids: [row.id], employeeName: fullName })}
                                                            >
                                                                Excluir
                                                            </button>
                                                        </ConditionalRender>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
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

                {modal && (
                    <ModalBlur onClose={() => setModal(null)}>
                        <ParticipationModal
                            action={modal.action}
                            count={modal.ids.length}
                            employeeName={modal.employeeName}
                            onHide={() => setModal(null)}
                            onConfirm={handleConfirm}
                        />
                    </ModalBlur>
                )}
            </Container>
        </>
    );
}
