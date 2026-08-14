"use client"

import { ISignatures, OverTime } from "@/lib/overTime/interface";
import { TableTemplateColumn } from "../templates/TablePage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, InputGroup, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import { useSearchParams, useRouter } from "next/navigation";
import GenericSearchInput from "../employee/GenericSearchInput";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import AlertSignatures from "./AlertSignatures";
import { formatCreatedAt, formatParseHours } from "@/lib/helpers";

export default function OverTimeTableClient({
    total,
    page,
    limit,
    search = "",
    overtime
}: {
    total: number;
    page: number;
    limit: number;
    search?: string;
    overtime?: OverTime[];
    overtimes?: OverTime | null;
}) {
    //Aqui van los const 

    const session = useSessionSnapshot();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const currentSearch = sp.get("search") ?? "";
    const [, setTableResetKey] = useState(0);
    const router = useRouter();
    const [hideSignatures, setHideSignatures] = useState(false);
    const idEmployee = Number(session?.uid?.idEmployee);


    useEffect(() => {
        setLoading(false);
        setMessageLoading("");
    }, [searchParamsString]);

    const pendingOvertimes = useMemo(() => {
        return (overtime ?? []).filter((o: OverTime) => {
            const signatures: ISignatures[] = o.signatures ?? [];
            const mySignature = signatures.find(
                (i: ISignatures) => Number(i.idSignatory) === idEmployee
            );
            if (!mySignature) return false;
            return mySignature.url === '';
        });
    }, [overtime, idEmployee]);

    const hasPendingSignature = pendingOvertimes.length > 0;

    useEffect(() => {
        setHideSignatures(hasPendingSignature);
    }, [hasPendingSignature]);


    // Para redirigir a la pagina de crear
    const handleCreate = () => {
        setLoading(true);
        setMessageLoading("Cargando...");
        router.push("/app/overtime/create");
    };

    //Helpers

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

        router.push(`/app/overtime?${params.toString()}`);
    };


    const capitalize = (text?: string) => {
        if (!text) return "";

        return text
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getEmployeeName = (e: OverTime) => {
        return e.employee
            ? `${capitalize(e.employee.lastName)} ${capitalize(e.employee.name)}`
            : `${e.idEmployee}`;
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
            router.push(`/app/overtime?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );


    const renderCell = (row: OverTime, column: TableTemplateColumn<OverTime>) => {
        if (column.render) {
            return column.render(row);
        }

        if (column.accessor) {
            return String(column.accessor(row) ?? "-");
        }

        return String(row[column.key as keyof OverTime] ?? "-");
    };



    const columns: TableTemplateColumn<OverTime>[] = [
        {
            key: "id",
            label: "ID",
            accessor: (e) => e.id,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {`${e.id}` || "-"}
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
            key: "motive",
            label: "Motivo",
            accessor: (e) => e.motive,
            filterable: true,
            type: "string",
            render: (e) =>
                <div className="text-uppercase">
                    {e.motive || "-"}
                </div>
        },
        {
            key: "date",
            label: "Fecha",
            accessor: (e) => e.informationDate?.dateInit,
            filterable: true,
            type: "date",
            render: (e) => (
                <div className="text-uppercase">
                    {formatCreatedAt(e.informationDate?.dateInit) || "-"}
                </div>
            )
        },
        {
            key: "hourInit",
            label: "Hora inicio",
            accessor: (e) => e.informationDate?.hourInit,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {formatParseHours(e.informationDate?.hourInit)}
                </div>
            )
        },
        {
            key: "hourEnd",
            label: "Hora fin",
            accessor: (e) => e.informationDate?.hourEnd,
            filterable: true,
            type: "string",
            render: (e) =>
                <div className="text-uppercase">
                    {formatParseHours(e.informationDate?.hourEnd) || "-"}
                </div>
        },
        {
            key: "signatures",
            label: "Firmado",
            accessor: (row) => row.signatures,
            filterable: true,
            render: (row) => {
                const mySignature = (row.signatures ?? []).find(
                    (s) => Number(s.idSignatory) === idEmployee
                );

                if (!mySignature) {
                    return <span className="text-muted text-center">Este permiso no corresponde a este perfil</span>;
                }

                return mySignature.url === "" ? (
                    <i className="bi bi-x-lg text-danger ms-4" title="Pendiente de tu firma" />
                ) : (
                    <i className="bi bi-check-lg text-success ms-4" title="Firmado" />
                );
            },
        },
        {
            key: "status",
            label: "Estatus",
            accessor: (e) => e.status,
            filterable: true,
            type: "string",
            render: (e) => {
                const estado = e.status
                switch (estado) {
                    case "APPROVED":
                        return (
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                                APROBADO
                            </span>
                        );
                    case "PENDING":
                        return (
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                PENDIENTE
                            </span>
                        );
                    case "REFUSED":
                        return (
                            <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                                RECHAZADO
                            </span>
                        );
                }
            },
        }
    ];

    return (
        <>
            <ConditionalRender cond={hideSignatures}>
                <AlertSignatures
                    onClose={() => setHideSignatures(false)}
                    pendingIds={pendingOvertimes.map((o) => o.id)}
                />
            </ConditionalRender>

            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3 " style={{ maxWidth: "1600px" }}>
                <Button
                    variant="primary"
                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={handleCreate}
                >
                    <i className="bi bi-plus-lg" />
                    Crear registro
                </Button>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Registro de horas extra</h1>

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
                                                    {(overtime ?? []).map((row) => (
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
                </Row>
            </Container>
        </>
    );
}