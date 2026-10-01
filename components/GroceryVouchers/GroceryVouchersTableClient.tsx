"use client"

import { ICurrentPeriod } from "@/lib/definitions";
import { IGroceryVouchers } from "@/lib/groceryVouchers/interface";
import { TableTemplateColumn } from "../templates/TableTemplate";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import { Button, Card, Col, Container, Dropdown, InputGroup, Pagination, Row } from "react-bootstrap";
import ErrorOverlay from "../ErrorOverlay";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListView from "../templates/ListView";
import GenericSearchInput from "../employee/GenericSearchInput";
import { useRouter, useSearchParams } from "next/navigation";
import ShowinfoItemGroceryVouchers from "./ShowinfoItem";
import { formatCreatedAt } from "@/lib/helpers";

type FeedbackState = "loading" | "success" | "error" | null;

export default function GroceryVouchersTableClient({
    periods,
    periodoActual,
    groceryVouchers,
    search,
    page,
    limit,
    total,
    idPeriodSelected
}: {
    periods: ICurrentPeriod[];
    periodoActual: ICurrentPeriod | null;
    groceryVouchers: IGroceryVouchers[];
    search?: string;
    page: number;
    limit: number;
    total: number;
    idPeriodSelected?: string | number;
}) {


    //CONST
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [showInfoOne, setShowInfoOne] = useState(false);
    const [itemSelect, setItemSelect] = useState<IGroceryVouchers | null>(null);


    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [, setTableResetKey] = useState(0);
    const router = useRouter();

    const currentPeriod = sp.get("idPeriod") ?? (idPeriodSelected ? String(idPeriodSelected) : "");
    const totalPages = Math.ceil(total / limit);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);


    useEffect(() => {
        setFeedback(null);
        setFeedbackMsg("");
    }, [searchParamsString]);

    const clearSelectedIds = useCallback(() => {
        isClearingSelectionRef.current = true;

        tableRef.current?.clearSelection();
        setSelectedIds([]);
        setTableResetKey((k) => k + 1);

        setTimeout(() => {
            isClearingSelectionRef.current = false;
        }, 0);
    }, []);

    const handleSearch = useCallback(
        (value: string) => {
            if (value === currentSearch) return;

            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");

            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            clearSelectedIds();
            router.push(`/app/groceryVouchers?${params.toString()}`);
        },
        [currentSearch, searchParamsString, router, clearSelectedIds]
    );

    const goToPage = (nextPage: number) => {
        if (nextPage === page || nextPage < 1 || nextPage > totalPages) return;

        setFeedback("loading");
        setFeedbackMsg("Cargando...")
        const params = new URLSearchParams(searchParamsString);
        params.set("view_type", "list");
        params.set("id", "null");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        router.push(`/app/groceryVouchers?${params.toString()}`);
    };

    const selectedPeriod = useMemo(
        () => periods.find((p) => String(p.id) === currentPeriod),
        [periods, currentPeriod]
    );

    const handleSearchPeriod = useCallback(
        (value: string) => {
            if (value === currentPeriod) return;

            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");
            params.set("page", "1");
            params.set("limit", String(limit));

            if (value) {
                params.set("idPeriod", value);
                params.delete("type");
            } else {
                params.delete("idPeriod");
            }
            clearSelectedIds();
            router.push(`/app/groceryVouchers?${params.toString()}`);
        },
        [currentPeriod, searchParamsString, limit, router, clearSelectedIds]
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
        router.push(`/app/groceryVouchers?${params.toString()}`);
    }, [searchParamsString, limit, router, clearSelectedIds]);

    const columns: TableTemplateColumn<IGroceryVouchers>[] = [
        {
            key: "idCheck",
            label: "ID Checador",
            accessor: (r) => r.idCheck,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.idCheck}
                </div>
            ),
        },
        {
            key: "employee",
            label: "Empleado beneficiado",
            accessor: (r) => r.name,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.lastName} {r.name}
                </div>
            ),
        },
        {
            key: "uiid",
            label: "Clave UIID",
            accessor: (r) => r.uiid,
            filterable: true,
            type: "string",
            render: (r) => {
                const hasUiid = r.uiid;

                return (
                    <>
                        <ConditionalRender cond={!hasUiid}>
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                Falta de registro
                            </span>
                        </ConditionalRender>

                        <ConditionalRender cond={hasUiid !== ""}>
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle badge-grow">
                                {r.uiid}
                            </span>
                        </ConditionalRender>
                    </>
                )
            },
        },
    ];

    const handlerGetItem = (item: IGroceryVouchers) => {
        setFeedback("loading");
        setFeedbackMsg("Cargando...");

        setTimeout(() => {
            setItemSelect(item);
            setShowInfoOne(true);
            setFeedback(null);
            setFeedbackMsg("");
        }, 400);
    };


    return (
        <>
            <ConditionalRender cond={feedback === 'loading'}>
                <Loading message={feedbackMsg} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() =>
                        setFeedback(null)
                    }
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>



            <ConditionalRender cond={!showInfoOne}>
                <Container className="py-3" style={{ maxWidth: "1600px" }}>

                    <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                        <div>
                            <h1 className="mb-0">Vales de despensa</h1>

                            <span className="text-muted">
                                {total} registro{total !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <Row className="justify-content-center">
                        <Col xs={12} xl={12} xxl={12}>
                            <Card className="rounded-4 shadow-sm border">
                                <Card.Body className="p-4 p-md-5">

                                    <Row className="justify-content-left mb-3 g-3">
                                        {/* FILTRO POR EMPLEADO */}
                                        <Col xs={12} md={6} lg={6}>
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

                                        <Col xs={12} md={6} lg={6}>
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

                                                        <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                                            <Dropdown.Item
                                                                active={currentPeriod === String(periodoActual?.id ?? "")}
                                                                onClick={() => handleClear()}
                                                                disabled={!periodoActual}
                                                            >
                                                                <i className="bi bi-arrow-counterclockwise me-2" />
                                                                PERIODO ACTUAL
                                                            </Dropdown.Item>

                                                            <Dropdown.Divider />

                                                            {periods.map((p) => (
                                                                <Dropdown.Item
                                                                    key={p.id}
                                                                    active={String(p.id) === currentPeriod}
                                                                    onClick={() => handleSearchPeriod(String(p.id))}
                                                                >
                                                                    {p.numberPeriod}
                                                                    <span className={`small ms-2 ${String(p.id) === currentPeriod ? "text-white-50" : "text-muted"}`}>
                                                                        {formatCreatedAt(p.dateInit)} - {formatCreatedAt(p.dateEnd)}
                                                                    </span>
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
                                                            {columns.map((column) => (
                                                                <th
                                                                    key={String(column.key)}
                                                                    className="fw-bold text-left"
                                                                >
                                                                    {column.label}
                                                                </th>
                                                            ))}

                                                            <th className="fw-bold text-center">Acciones</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>

                                                        <ConditionalRender cond={groceryVouchers?.length === 0}>
                                                            <tr>
                                                                <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                                                    <i
                                                                        className={`bi ${search ? "bi-clipboard-x" : "bi-inbox"} d-block mb-2`}
                                                                        style={{ fontSize: "2.5rem" }}
                                                                    />
                                                                    <span className="fw-semibold">
                                                                        {search
                                                                            ? "No se encontraron registros de vales con los filtros aplicados"
                                                                            : "No hay registros de vales"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        </ConditionalRender>

                                                        {(groceryVouchers ?? []).map((row) => (
                                                            <tr key={row.idEmployee}>
                                                                {columns.map((column) => (
                                                                    <td key={String(column.key)}>
                                                                        {column.render
                                                                            ? column.render(row)
                                                                            : column.accessor(row)}
                                                                    </td>
                                                                ))}

                                                                <td className="align-middle">
                                                                    <div className="d-flex justify-content-center align-items-center gap-2">


                                                                        <button
                                                                            className="btn btn-sm btn-outline-info"
                                                                            onClick={() => handlerGetItem(row)}
                                                                        >
                                                                            Ver
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-4">
                                                <small className="text-muted">
                                                    Página {page} de {totalPages}
                                                </small>

                                                <ConditionalRender cond={pageNumbers.length > 1}>
                                                    <Pagination size="sm" className="m-0">
                                                        {/* Botón Anterior */}
                                                        <Pagination.Prev
                                                            disabled={page <= 1}
                                                            onClick={() => goToPage(page - 1)}
                                                        >
                                                            Anterior
                                                        </Pagination.Prev>

                                                        {/* Números de Página Dinámicos */}
                                                        {pageNumbers.map((num) => (
                                                            <Pagination.Item
                                                                key={num}
                                                                active={num === page}
                                                                onClick={() => goToPage(num)}
                                                            >
                                                                {num}
                                                            </Pagination.Item>
                                                        ))}

                                                        {/* Botón Siguiente */}
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
                </Container>
            </ConditionalRender>

            <ConditionalRender cond={showInfoOne}>
                <ShowinfoItemGroceryVouchers
                    data={itemSelect ? itemSelect : null}
                    period={selectedPeriod}
                    onBack = {() => {
                            setFeedback("loading");
                            setFeedbackMsg("Regresando...");
                    
                            setTimeout(() => {
                                setShowInfoOne(false);
                                setItemSelect(null);
                                setFeedback(null);
                                setFeedbackMsg("");
                            }, 400);
                        }
                    }
                />
            </ConditionalRender>
        </>
    )
}
