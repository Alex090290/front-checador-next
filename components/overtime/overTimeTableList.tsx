"use client"

import { OverTime } from "@/lib/overTime/interface";
import TableTemplateServer, { TableTemplateColumn } from "../templates/TablePage";
import { useCallback, useEffect, useRef, useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Col, Container, Form, InputGroup } from "react-bootstrap";
import ListView from "../templates/ListView";
import { usePathname, useSearchParams,useRouter } from "next/navigation";

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
}) {
    //Aqui van los const 

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const pathname = usePathname();
    const currentSearch = sp.get("search") ?? "";
    const [tableResetKey, setTableResetKey] = useState(0);
      const router = useRouter();


    useEffect(() => {
        if (loading) {
            setLoading(false);
            setMessageLoading("");
        }
    }, [searchParamsString, loading]);

    // Para redirigir a la pagina de crear
    const handleCreate = () => {
        console.log("Cargando sitio");

        setLoading(true);
        setMessageLoading("Cargando...");
        router.push("/app/overtime/create");
    };

    //Helpers

    const goToPage = (nextPage: number) => {
        setLoading(true);
        setMessageLoading("Cargando");
        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
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
            ? `${capitalize(e.employee.name)} ${capitalize(e.employee.lastName)}`
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

    const handleSelectionChange = (ids: Array<string | number>) => {
        if (isClearingSelectionRef.current) return;
        setSelectedIds(ids);
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
            router.push(`/app/employee?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

    const columns: TableTemplateColumn<OverTime>[] = [
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
            accessor: (e) => e.date,
            filterable: true,
            type: "date",
            render: (e) => (
                <div className="text-uppercase">
                    {e.date || "-"}
                </div>
            )
        },
        {
            key: "hourInit",
            label: "Hora inicio",
            accessor: (e) => e.hourInit,
            filterable: true,
            type: "string",
            render: (e) => (
                <div className="text-uppercase">
                    {e.hourInit || "-"}
                </div>
            )
        },
        {
            key: "hourEnd",
            label: "Hora fin",
            accessor: (e) => e.hourEnd,
            filterable: true,
            type: "string",
            render: (e) =>
                <div className="text-uppercase">
                    {e.hourEnd}
                </div>
        }
    ];

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container fluid className="py-4">

                {/* Acciones */}
                <div className="mb-4">
                    <Button
                        variant="primary"
                        className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                        onClick={handleCreate}
                    // disabled={loading}
                    >
                        <i className="bi bi-plus-lg" />
                        Crear registro
                    </Button>
                </div>

                {/* Contenido */}
                <ListView>
                    <ListView.Header
                        title={
                            <div>
                                <h2 className="mb-1 fw-bold">
                                    Registro de horas extra
                                </h2>

                                <span className="text-muted">
                                    {total} registro{total !== 1 ? "s" : ""}
                                </span>
                            </div>
                        }
                    />

                    <div className="mt-2 mb-2">
                        <Col xs={12} md={5} lg={4}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white" style={{ color: "#6c757d" }}>
                                    <i className="bi bi-search" />
                                </InputGroup.Text>

                                <Form.Control
                                    className="shadow-sm border-1 border-secondary"
                                    type="text"
                                    placeholder="Buscar por nombre, apellido, departamento..."
                                    defaultValue={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </div>

                    <ListView.Body>
                        <div className=" rounded-4 shadow-sm border mt-3">
                            <div className="p-3">
                                <TableTemplateServer
                                    ref={tableRef}
                                    key={tableResetKey}
                                    columns={columns}
                                    data={overtime ?? []}
                                    total={total}
                                    page={page}
                                    limit={limit}
                                    onPageChange={goToPage}
                                    getRowId={(row) => Number(row.id)}
                                    viewForm="/app/overtime?view_type=form"
                                    onSelectionChange={handleSelectionChange}
                                />
                            </div>
                        </div>
                    </ListView.Body>
                </ListView>

            </Container>
        </>
    );
}