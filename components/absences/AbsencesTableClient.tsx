"use client"
import { IAbsence } from "@/lib/absences/interface";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TableTemplateColumn } from "../templates/TableTemplate";
import moment from "moment";
import { Button, Card, Col, Container, Dropdown, DropdownButton, InputGroup, Overlay, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import GenericSearchInput from "../employee/GenericSearchInput";
import DatePicker from "react-datepicker";


export default function AbsencesTableClient({
    total,
    page,
    limit,
    search = "",
    absence,
    dateInit,
    dateEnd
}: {
    total: number;
    page: number;
    limit: number;
    search?: string;
    dateInit?: string;
    dateEnd?: string;
    type?: string;
    absence?: IAbsence[];
    absences?: IAbsence | null;
}) {
    //Aqui los const 
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const currentType = sp.get("type") ?? "";
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [, setTableResetKey] = useState(0);

    //Filtro
    const [dateInitValue, setDateInitValue] = useState(dateInit ?? "");
    const [dateEndValue, setDateEndValue] = useState(dateEnd ?? "");
    const [dateError, setDateError] = useState("");

    const [showCalendar, setShowCalendar] = useState(false);
    const dateButtonRef = useRef(null);
    const parsedStart = dateInitValue ? moment(dateInitValue, "YYYY-MM-DD").toDate() : null;
    const parsedEnd = dateEndValue ? moment(dateEndValue, "YYYY-MM-DD").toDate() : null;

    useEffect(() => {
        setDateInitValue(dateInit ?? "");
        setDateEndValue(dateEnd ?? "");
    }, [dateInit, dateEnd]);


    useEffect(() => {
        setLoading(false);
        setMessageLoading("");
    }, [searchParamsString]);

    //Helpers
    const capitalize = (text?: string) => {
        if (!text) return "";

        return text
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getEmployeeName = (e: IAbsence) => {
        return e.employee
            ? `${capitalize(e.employee.lastName)} ${capitalize(e.employee.name)}`
            : `${e.idEmployee}`;
    };

    const getDate = (e: IAbsence) => {
        return e.dateOfAbsence
            ? moment.utc(e.dateOfAbsence).format("DD/MM/YYYY")
            : `${e.idEmployee}`
    }

    const renderCell = (row: IAbsence, column: TableTemplateColumn<IAbsence>) => {
        if (column.render) {
            return column.render(row);
        }

        if (column.accessor) {
            return String(column.accessor(row) ?? "-");
        }

        return String(row[column.key as keyof IAbsence] ?? "-");
    };

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
        setLoading(true);
        setMessageLoading("Cargando...");
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

        router.push(`/app/absences?${params.toString()}`);
    };

    const handleSearch = useCallback(
        (value: string) => {
            if (value === currentSearch) return;

            setLoading(true);
            setMessageLoading("Buscando...");

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
            router.push(`/app/absences?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

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

        setLoading(true);
        setMessageLoading("Filtrando...");

        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));
        params.set("dateInit", dateInitValue);
        params.set("dateEnd", dateEndValue);

        clearSelectedIds();
        router.push(`/app/absences?${params.toString()}`);
    }, [dateInitValue, dateEndValue, dateInit, dateEnd, searchParamsString, limit, router, clearSelectedIds]);

    const handleTypeFilter = useCallback((value: string) => {
        setLoading(true);
        setMessageLoading("Filtrando...");

        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));

        if (value) {
            params.set("type", value);
        } else {
            params.delete("type");
        }

        clearSelectedIds();
        router.push(`/app/absences?${params.toString()}`);
    }, [searchParamsString, limit, router, clearSelectedIds]);

    const handleClear = useCallback(() => {
        setLoading(true);
        setMessageLoading("Cargando...")
        setDateError("")
        router.push("/app/absences");
    }, [router]);

    const handleRangeChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setDateInitValue(start ? moment(start).format("YYYY-MM-DD") : "");
        setDateEndValue(end ? moment(end).format("YYYY-MM-DD") : "");
        if (start && end) setShowCalendar(false);
    };

    const rangeLabel =
        parsedStart && parsedEnd
            ? `${moment(parsedStart).format("DD/MM/YYYY")} - ${moment(parsedEnd).format("DD/MM/YYYY")}`
            : "Selecciona un rango de fechas";


    //Desgloce de la tabla
    const columns: TableTemplateColumn<IAbsence>[] = [
        {
            key: "id",
            label: "ID",
            accessor: (e) => e.id,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {`#${e.id}` || "-"}
                </div>
            )
        },
        {
            key: "employee",
            label: "Empleado",
            accessor: getEmployeeName,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {getEmployeeName(e) || "-"}
                </div>
            )
        },
        {
            key: "category",
            label: "Categoría",
            accessor: (e) => e.category,
            filterable: true,
            type: "string",
            render: (e) =>
                <div className="text-uppercase">
                    {e.category || "-"}
                </div>
        },
        {
            key: "type",
            label: "Tipo de falta",
            accessor: (e) => e.type,
            filterable: true,
            type: "string",
            render: (e) => {
                const estado = e.type
                switch (estado) {
                    case "asistencia":
                        return (
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                                ASISTENCIA
                            </span>
                        );
                    case "falta":
                        return (
                            <div className="ms-3">
                                <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                                    FALTA
                                </span>
                            </div>
                        );
                }
            }
        },
        {
            key: "dateOfAbsence",
            label: "Fecha de la falta",
            accessor: getDate,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {getDate(e) || "-"}
                </div>
            )
        }
    ];

    return (
        <>
            {/* <ConditionalRender cond={hideSignatures}>
                <AlertSignatures
                    onClose={() => setHideSignatures(false)}
                    pendingIds={pendingOvertimes.map((o) => o.id)}
                />
            </ConditionalRender> */}

            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3 " style={{ maxWidth: "1600px" }}>
                {/* <Button
                    variant="primary"
                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={handleCreate}
                >
                    <i className="bi bi-plus-lg" />
                    Crear registro
                </Button> */}

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Faltas</h1>

                        <span className="text-muted">
                            {total} registro{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <div className="mb-4">
                                    <Row className="mb-4 g-5 align-items-between">
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

                                        <Col xs={12} md={6} lg={4}>
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
                                                        placement="bottom-start"
                                                        rootClose
                                                        onHide={() => setShowCalendar(false)}
                                                    >
                                                        {({ ref, style }) => (
                                                            <div ref={ref} style={style} className="mt-2 shadow-lg rounded-4 overflow-hidden">
                                                                <DatePicker
                                                                    selectsRange
                                                                    inline
                                                                    startDate={parsedStart}
                                                                    endDate={parsedEnd}
                                                                    onChange={handleRangeChange}
                                                                    monthsShown={1}
                                                                />
                                                                <Row className="g-2">
                                                                    <Col xs={12} md={6} lg={6}>
                                                                        <Button
                                                                            variant="primary"
                                                                            className="w-100"
                                                                            onClick={handleDateFilter}
                                                                        >
                                                                            Filtrar fechas
                                                                        </Button>
                                                                    </Col>

                                                                    <Col xs={12} md={6} lg={6}>
                                                                        <Button
                                                                            variant="secondary"
                                                                            className="w-100"
                                                                            onClick={handleClear}
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
                                        </Col>

                                        <Col xs={12} md={6} lg={4}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-tag text-primary" />
                                                        <span className="fw-semibold small">Filtrar por tipo</span>
                                                    </div>

                                                    <DropdownButton
                                                        variant="outline-secondary"
                                                        className="w-100"
                                                        title={
                                                            currentType === "asistencia"
                                                                ? "Asistencia"
                                                                : currentType === "falta"
                                                                    ? "Falta"
                                                                    : "Todos"
                                                        }
                                                    >
                                                        <Dropdown.Item
                                                            active={currentType === ""}
                                                            onClick={() => handleTypeFilter("")}
                                                            className="w-100"
                                                        >
                                                            Todos
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            active={currentType === "asistencia"}
                                                            onClick={() => handleTypeFilter("asistencia")}
                                                            className="w-100"
                                                        >
                                                            Asistencia
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            active={currentType === "falta"}
                                                            onClick={() => handleTypeFilter("falta")}
                                                            className="w-100"
                                                        >
                                                            Falta
                                                        </Dropdown.Item>
                                                    </DropdownButton>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col xs={12} md={6} lg={2}>


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
                                                                className=" fw-bold text-left"
                                                            >
                                                                {column.label}
                                                            </th>
                                                        ))}
                                                        <th className=" fw-bold">
                                                            Detalles
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {(absence ?? []).map((row) => (
                                                        <tr key={row.id}>
                                                            {columns.map((column) => (
                                                                <td key={String(column.key)}>
                                                                    {renderCell(row, column)}
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <a
                                                                    href={`/app/absences?view_type=form&id=${row.id}`}
                                                                    className="btn btn-sm btn-outline-info ms-3"
                                                                >
                                                                    Ver
                                                                </a>
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
                </Row >
            </Container >
        </>
    )
}

