"use client"

import { IPenaltyForOffeses } from "@/lib/penalties/interface";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { formatCreatedAt } from "@/lib/helpers";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, InputGroup, Row } from "react-bootstrap";
import GenericSearchInput from "../employee/GenericSearchInput";
import ListView from "../templates/ListView";

export default function PenaltiesTableClient({
    total,
    page,
    limit,
    search = "",
    penalty
}: {
    total: number;
    page: number;
    limit: number;
    search?: string;
    penalty: IPenaltyForOffeses[];
}) {
    //Aqui los const
    const router = useRouter();
    const sp = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const isClearingSelectionRef = useRef(false);
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [, setTableResetKey] = useState(0);

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

    const getEmployeeName = (e: IPenaltyForOffeses) => {
        return e.employee
            ? `${capitalize(e.employee.lastName)} ${capitalize(e.employee.name)}`
            : `${e.idEmployee}`;
    };

    const renderCell = (row: IPenaltyForOffeses, column: TableTemplateColumn<IPenaltyForOffeses>) => {
        if (column.render) {
            return column.render(row);
        }

        if (column.accessor) {
            return String(column.accessor(row) ?? "-");
        }

        return String(row[column.key as keyof IPenaltyForOffeses] ?? "-");
    };


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

        router.push(`/app/penalties?${params.toString()}`);
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
            router.push(`/app/penalties?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

    //Desgloce de la tabla
    const columns: TableTemplateColumn<IPenaltyForOffeses>[] = [
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
            key: "type",
            label: "Tipo",
            accessor: (e) => e.type,
            filterable: true,
            type: "string",
            render: (e) => {
                const estado = e.type
                switch (estado) {
                    case "":
                        return (
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                                ASISTENCIA
                            </span>
                        );
                    case "faltas_injustificadas":
                        return (
                            <div className="justify-content-left">
                                <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                                    FALTA INJUSTIFICADA
                                </span>
                            </div>
                        );
                }
            }
        },
        {
            key: "createdAt",
            label: "Fecha de creación",
            accessor: (e) => e.dateOfAbsence,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {formatCreatedAt(e.createdAt)}
                </div>
            )
        }
    ];

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3 " style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Penalizaciones por faltas</h1>

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
                                                    {(penalty ?? []).map((row) => (
                                                        <tr key={row.id}>
                                                            {columns.map((column) => (
                                                                <td key={String(column.key)}>
                                                                    {renderCell(row, column)}
                                                                </td>
                                                            ))}
                                                            <td>
                                                                <a
                                                                    href={`/app/overtime?view_type=form&id=${row.id}`}
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