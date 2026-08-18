"use client"

import { IPrePayroll, IUpdatePrepayroll } from "@/lib/prePayroll/interface";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatCreatedAt, formatCreatedAtOnlyHours } from "@/lib/helpers";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, Dropdown, InputGroup, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import { useRouter, useSearchParams } from "next/navigation";
import GenericSearchInput from "../employee/GenericSearchInput";
import { IPeriod } from "../attendanceReportComponents/AttendanceFiltersBar";
import ModalBlur from "../ModalBlur";
import UpdateModal from "./UpdateModal";

type FeedbackState = "loading" | "success" | "error" | null;

type UpdatePayload = Pick<IPrePayroll, "idPeriod" | "idIncidence" | "incidenceRef">;


function statusVariant(incidenceRef?: string | null) {
    switch ((incidenceRef ?? "")) {
        case "falta":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                    FALTA
                </span>
            )
        case "retardo":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                    RETARDO
                </span>
            )
        case "HORAS_EXTRAS":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                    HORAS EXTRAS
                </span>
            )
        case "INCAPACIDAD":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-orange-subtle text-orange-emphasis border border-orange-subtle">
                    INCAPACIDAD
                </span>
            )
        case "VACACIONES":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-pink-subtle text-pink-emphasis border border-pink-subtle">
                    VACACIONES
                </span>
            )
        case "PERMISOS":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                    PERMISOS
                </span>
            )
        case "PENALIZACION":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    PENALIZACIÓN
                </span>
            )
    }
}

export default function PrePayrollTableClient({
    total,
    page,
    limit,
    search = "",
    prepayroll,
    periods,
    periodoActual
}: {
    total: number;
    page: number;
    limit: number;
    search?: string;
    prepayroll: IPrePayroll[];
    periods: IPeriod[];
    periodoActual: IPeriod | null;
}) {

    //CONST
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();

    const isClearingSelectionRef = useRef(false);
    const [, setTableResetKey] = useState(0);
    const [selectedRow, setSelectedRow] = useState<UpdatePayload | null>(null);
    const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const currentSearch = sp.get("search") ?? "";
    const currentPeriod = sp.get("idPeriod") ?? "";
    const currentYear = sp.get("year") ?? "";
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const hasAppliedDefaultFilters = useRef(false);



    const selectedPeriod = useMemo(
        () => periods.find((p) => String(p.id) === currentPeriod),
        [periods, currentPeriod]
    );

    //Para detener el loading
    useEffect(() => {
        setFeedback(null);
        setFeedbackMsg("");
    }, [searchParamsString]);

    //Al montar: si no hay filtros en la URL, usar periodo actual y año en curso
    useEffect(() => {
        if (hasAppliedDefaultFilters.current) return;
        hasAppliedDefaultFilters.current = true;

        if (currentPeriod || currentYear) return; // ya viene con filtros, no tocar
        if (!periodoActual) return; // no hay periodo actual que aplicar

        const params = new URLSearchParams(searchParamsString);
        params.set("idPeriod", String(periodoActual.id));
        params.set("year", String(new Date().getFullYear()));
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));

        router.replace(`/app/prePayroll?${params.toString()}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const list: number[] = [];
        for (let y = currentYear; y >= 2000; y--) {
            list.push(y);
        }
        return list;
    }, []);

    const clearSelectedIds = useCallback(() => {
        isClearingSelectionRef.current = true;

        tableRef.current?.clearSelection();
        setSelectedIds([]);
        setTableResetKey((k) => k + 1);

        setTimeout(() => {
            isClearingSelectionRef.current = false;
        }, 0);
    }, []);

    const goToPage = (nextPage: number) => {
        setFeedback(null);
        setFeedbackMsg("Cargando...");
        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));

        if (search?.trim()) {
            params.set("search", search.trim());
        } else {
            params.delete("search");
        }

        router.push(`/app/prePayroll?${params.toString()}`);
    };

    //Buscar por empleado
    const handleSearch = useCallback(
        (value: string) => {
            if (value === currentSearch) return;

            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");
            params.set("page", "1");
            params.set("limit", String(limit));

            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            clearSelectedIds();
            router.push(`/app/prePayroll?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

    //Buscar por periodo
    const handleSearchPeriod = useCallback(
        (value: string) => {
            if (value === currentSearch) return;

            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");
            params.set("page", "1");
            params.set("limit", String(limit));

            if (value) {
                params.set("idPeriod", value);
            } else {
                params.delete("idPeriod");
            }
            clearSelectedIds();
            router.push(`/app/prePayroll?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

    //Buscar por año
    const handleSearchYear = useCallback(
        (value: string) => {
            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");
            params.set("page", "1");
            params.set("limit", String(limit));

            if (value) {
                params.set("year", value);
                params.delete("idPeriod")
            } else {
                params.delete("year");
            }
            clearSelectedIds();
            router.push(`/app/prePayroll?${params.toString()}`);
        },
        [searchParamsString, limit, router, clearSelectedIds]
    );

    const handleClear = useCallback(() => {
        setFeedback("loading");
        setFeedbackMsg("Cargando...");

        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));
        params.delete("idPeriod");

        clearSelectedIds();
        router.push(`/app/prePayroll?${params.toString()}`);
    }, [searchParamsString, limit, router, clearSelectedIds]);


    //ACTUALIZAR FECHA NOMINA
    const handleUpdate = (row: IUpdatePrepayroll) => {
        setSelectedRow({
            idPeriod: row.idPeriod,
            idIncidence: row.idIncidence,
            incidenceRef: row.incidenceRef,
        });
        setShowModalUpdate(true);
    };

    //Tabla
    const columns: TableTemplateColumn<IPrePayroll>[] = useMemo(
        () => [
            {
                key: "id",
                label: "ID",
                accessor: (row) => row.idPrePayRoll,
                filterable: true,
                type: "string",
                render: (row) => (
                    <div className="text-uppercase fw-semibold">
                        {row.idPrePayRoll}
                    </div>
                ),
            },
            {
                key: "idEmployee",
                label: "ID Empleado",
                accessor: (row) => row.data.employee.id,
                filterable: true,
                type: "string",
                render: (row) => (
                    <div className="text-uppercase fw-semibold">
                        {row.data.employee.id}
                    </div>
                ),
            },
            {
                key: "employee",
                label: "Nombre Empleado",
                accessor: (row) => `${row.data.employee.lastName} ${row.data.employee.name}`.toUpperCase(),
                filterable: true,
                type: "string",
                render: (row) => (
                    <div className="text-left fw-semibold text-uppercase">
                        {row.data.employee.lastName} {row.data.employee.name}
                    </div>
                ),
            },
            {
                key: "incidence",
                label: "Incidencia",
                accessor: (row) => row.incidenceRef,
                filterable: true,
                type: "string",
                align: "center",
                render: (row) => <div className="text-center">{statusVariant(row.incidenceRef)} </div>
            },
            //   {
            //     key: "notes",
            //     label: "Notas",
            //     accessor: (row) => row.notes,
            //     filterable: true,
            //     type: "number",
            //     render: (row) => (
            //       <div className="text-center fw-semibold">{row.notes}</div>
            //     ),
            //   },
            {
                key: "notes",
                label: "Concepto",
                accessor: (row) => row.notes,
                filterable: true,
                type: "string",
                render: (row) => (
                    <div className="text-left fw-semibold text-uppercase">
                        {row.notes}
                    </div>
                ),
            },
            {
                key: "dateOfAbsence",
                label: "Fecha Incidente",
                accessor: (row) => row.data.dateOfAbsence,
                filterable: true,
                type: "number",
                render: (row) => (
                    <div className="text-left fw-semibold">
                        {formatCreatedAt(row.data.dateOfAbsence)}
                    </div>
                ),
            },
            {
                key: "createdAt",
                label: "Fecha Nomina",
                accessor: (row) => row.fechaNomina,
                filterable: true,
                type: "number",
                render: (row) => (
                    <div className="text-left fw-semibold text-uppercase">
                        {row.fechaNomina ? row.fechaNomina : "Falta de completar"}
                    </div>
                ),
            },
            {
                key: "claveNomipaq",
                label: "Clave Nomipaq",
                accessor: (row) => row.claveNomiPaq,
                filterable: true,
                type: "number",
                render: (row) => (
                    <div className="text-left fw-semibold text-uppercase">
                        {row.claveNomiPaq}
                    </div>
                ),
            },
            {
                key: "duracion",
                label: "Duración",
                align: "center",
                accessor: (row) => row.duracion,
                filterable: true,
                type: "number",
                render: (row) => (
                    <div className="text-center fw-semibold text-uppercase">
                        {row.duracion}
                    </div>
                ),
            },
        ],
        []
    );


    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Generando..."} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Prenomina</h1>

                        <span className="text-muted">
                            {total} registro{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">
                                <div className="mb-4">
                                    <Row className="mb-4 g-3 align-items-between">
                                        {/* Filtrar por empleado */}
                                        <Col xs={12} md={4} lg={4}>
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

                                        {/* Filtrar por año */}
                                        <Col xs={12} md={4} lg={4}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-hourglass-split text-primary" />
                                                        <span className="fw-semibold small">Filtrar por año</span>
                                                    </div>

                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                        >
                                                            {currentYear ? currentYear : "SELECCIONA UN AÑO"}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                            <Dropdown.Item
                                                                active={currentYear === ""}
                                                                onClick={() => handleSearchYear("")}
                                                            >
                                                                LIMPIAR
                                                            </Dropdown.Item>
                                                            {years.map((y) => (
                                                                <Dropdown.Item
                                                                    key={y}
                                                                    active={currentYear === String(y)}
                                                                    onClick={() => handleSearchYear(String(y))}
                                                                >
                                                                    {y}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        {/* Filtrar por periodo */}
                                        <Col xs={12} md={4} lg={4}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-calendar-range text-primary" />
                                                        <span className="fw-semibold small">Filtrar por periodo</span>
                                                    </div>

                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                        >
                                                            {selectedPeriod ? selectedPeriod.numberPeriod : "SELECCIONA UN PERIODO"}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu className="w-100">
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
                                                                >
                                                                    {p.numberPeriod}
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Menu>
                                                    </Dropdown>

                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </div>


                                <ListView>
                                    <ListView.Body>
                                        <div className="table-responsive rounded-3 border overflow-auto">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-dark border-secondary">
                                                    <tr>
                                                        {columns.map((column) => (
                                                            <th
                                                                key={String(column.key)}
                                                                className={`fw-bold ${column.align === "center" ? "text-center" : "text-left"}`}
                                                            >
                                                                {column.label}
                                                            </th>
                                                        ))}

                                                        <th className="fw-bold">Detalles</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {(prepayroll ?? []).map((row, index) => (
                                                        <tr key={`row-${index}`}>
                                                            {columns.map((column) => (
                                                                <td key={String(column.key)}>
                                                                    {column.render
                                                                        ? column.render(row)
                                                                        : column.accessor(row)}
                                                                </td>
                                                            ))}

                                                            <td className="align-middle">
                                                                <div className="d-flex justify-content-center align-items-center gap-2">
                                                                    <Button
                                                                        variant="outline-info"
                                                                        className="btn-sm"
                                                                        onClick={() => handleUpdate(row)}
                                                                    >
                                                                        Actualizar
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            <small className="text-muted">
                                                Página {page} de {Math.ceil(total / limit)}
                                            </small>

                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    disabled={page <= 1}
                                                    onClick={() => goToPage(page - 1)}
                                                >
                                                    Anterior
                                                </Button>

                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    disabled={page >= Math.ceil(total / limit)}
                                                    onClick={() => goToPage(page + 1)}
                                                >
                                                    Siguiente
                                                </Button>
                                            </div>
                                        </div>
                                    </ListView.Body>
                                </ListView>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <ConditionalRender cond={showModalUpdate}>
                    <ModalBlur onClose={() => setShowModalUpdate(false)}>
                        <UpdateModal
                            show={showModalUpdate}
                            onHide={() => {
                                setShowModalUpdate(false);
                                clearSelectedIds();
                            }}
                            prenom={selectedRow ? [selectedRow] : []}
                        />
                    </ModalBlur>
                </ConditionalRender>
            </Container>
        </>
    )
}