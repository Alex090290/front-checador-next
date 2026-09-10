"use client"

import { IDevices } from "@/lib/devices/interface";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { Button, Card, Col, Container, Dropdown, InputGroup, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import GenericSearchInput from "../employee/GenericSearchInput";

type FeedbackState = "loading" | "success" | "error" | null;

function statusVariant(status: string) {
    switch ((status ?? "")) {
        case "activo":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                    ACTIVO
                </span>
            )
        case "inactivo":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                    INACTIVO
                </span>
            )
        case "en_reparacion":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                    EN REPARACIÓN
                </span>
            )
        case "baja":
            return (
                <span className="badge rounded-pill px-2 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                    BAJA
                </span>
            )
    }
}

export function formatLabel(value: string) {
    return value
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .trim();
}

export default function DevicesTableClient({
    total,
    page,
    limit,
    devices,
    search = "",
}: {
    total: number;
    page: number;
    limit: number;
    devices: IDevices[];
    search?: string;
    status?: string;
    idEmployee?: string;
    idDepartment?: string;
    idBranch?: string;
}) {
    //AQUI LOS CONST
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const currentType = sp.get("type") ?? "";


    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [loading] = useState(false);

    const deviceTypeOptions = [
        { value: "computadora", label: "COMPUTADORA" },
        { value: "laptop", label: "LAPTOP" },
        { value: "impresora", label: "IMPRESORA" },
        { value: "servidor", label: "SERVIDOR" },
        { value: "switch", label: "SWITCH" },
        { value: "router", label: "ROUTER" },
        { value: "telefono_ip", label: "TELEFONO IP" },
        { value: "camara", label: "CAMARA" },
        { value: "access_point", label: "ACCESS POINT" },
        { value: "celular", label: "CELULAR" },
        { value: "television", label: "TELEVISIÓN" },
        { value: "tablet", label: "TABLET" },
        { value: "otro", label: "OTRO" },
    ];

    useEffect(() => {
        setFeedback(null);
        setFeedbackMsg("");
    }, [searchParamsString]);

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

        router.push(`/app/devices?${params.toString()}`);
    };

    const renderCell = (row: IDevices, column: TableTemplateColumn<IDevices>) => {
        if (column.render) {
            return column.render(row);
        }

        if (column.accessor) {
            return String(column.accessor(row) ?? "-");
        }

        return String(row[column.key as keyof IDevices] ?? "-");
    };

    const handleCreate = () => {
        setFeedback("loading");
        setFeedbackMsg("Cargando...");
        router.push("/app/devices/create");
    };

    const handleSearch = useCallback((value: string) => {

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
        router.push(`/app/devices?${params.toString()}`);
    },
        [currentSearch, searchParamsString, limit, router]
    );

    const handleTypeFilter = useCallback((value: string) => {
        const trimedSuc = value.trim();
        const normalizedCurrent = currentType ? String(currentType) : "";

        if (trimedSuc === normalizedCurrent) return;


        setFeedback("loading");
        setFeedbackMsg("Buscando...");

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
        router.push(`/app/devices?${params.toString()}`);
    },
        [currentType, searchParamsString, limit, router]
    );

    const selectedType = currentType
        ? deviceTypeOptions.find((opt) => opt.value === currentType)?.label ?? currentType
        : "TODOS";

    //TABLA
    const columns: TableTemplateColumn<IDevices>[] = [
        {
            key: "id",
            label: "ID",
            accessor: (u) => u.id,
            filterable: false,
            type: "string",
            render: (u) => <div className="text-uppercase">{u.id}</div>,
        },
        {
            key: "name",
            label: "Nombre",
            accessor: (u) => u.name,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">{u.name}</div>
            ),
        },
        {
            key: "employee",
            label: "Empleado Responsable",
            accessor: (u) => u.employee?.name,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">{u.employee?.lastName} {u.employee?.name}</div>
            ),
        },
        {
            key: "mac",
            label: "Mac",
            accessor: (u) => u.networkInfo.find((e) => e.mac)?.mac ?? "-",
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">
                    {u.networkInfo.filter((e) => e.mac).map((e) => e.mac).join(" -  ")}
                </div>
            ),
        },
        {
            key: "vlan1",
            label: "VLAN 1",
            accessor: (u) => u.networkInfo.find((e) => e.vlan === "1")?.vlan ?? "-",
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">
                    {u.networkInfo.filter((e) => e.vlan === "1").map((e) => e.ip).join(" - ")}
                </div>
            ),
        },
        {
            key: "vlan20",
            label: "VLAN 20",
            accessor: (u) => u.networkInfo.find((e) => e.vlan === "20")?.vlan ?? "-",
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">
                    {u.networkInfo.filter((e) => e.vlan === "20").map((e) => e.ip).join(" - ")}
                </div>
            ),
        },
        {
            key: "type",
            label: "Tipo",
            align: "center",
            accessor: (u) => u.type,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase text-center">{formatLabel(u.type!)}</div>
            ),
        },
        {
            key: "status",
            label: "Estatus",
            align: "center",
            accessor: (u) => u.status,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase text-center">{statusVariant(u.status)}</div>
            ),
        },

    ];

    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Guardando..."} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>

                <Button
                    variant="primary"
                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    <i className="bi bi-plus-lg" />
                    Crear dispositivo
                </Button>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Dispositivos</h1>

                        <span className="text-muted">
                            {total} dispositivo{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">

                                <div className="mb-4">
                                    <Row className="mb-4 g-3 align-items-between">

                                        {/* FILTRO DE EMPLEADOS */}
                                        <Col xs={12} sm={6} md={6} lg={6} xl={6} style={{ minWidth: 0 }}>
                                            <Card className="border rounded-4 h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-laptop text-primary" />
                                                        <span className="fw-semibold small">Filtrar dispositivos</span>
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
                                                            placeholder="Buscar por nombre o empleado..."
                                                        />
                                                    </InputGroup>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        <Col xs={12} sm={6} md={6} lg={6} style={{ minWidth: 0 }}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-tags-fill text-primary" />
                                                        <span className="fw-semibold small">Filtrar por tipo</span>
                                                    </div>

                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                            style={{ minWidth: 0 }}
                                                        >
                                                            <span
                                                                style={{
                                                                    whiteSpace: "normal",
                                                                    overflowWrap: "break-word",
                                                                    wordBreak: "break-word",
                                                                    textAlign: "left",
                                                                }}
                                                            >
                                                                {selectedType}
                                                            </span>
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                active={!currentType}
                                                                onClick={() => handleTypeFilter("")}
                                                            >
                                                                <span className="text-uppercase text-muted">TODOS</span>
                                                            </Dropdown.Item>

                                                            {deviceTypeOptions.map((opt) => (
                                                                <Dropdown.Item
                                                                    key={opt.value}
                                                                    active={opt.value === currentType}
                                                                    onClick={() => handleTypeFilter(opt.value)}
                                                                >
                                                                    <span className="text-uppercase">{opt.label}</span>
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
                                                    {(devices ?? []).map((row) => {
                                                        return (
                                                            <tr key={row.id}>
                                                                {columns.map((column) => (
                                                                    <td key={String(column.key)}>{renderCell(row, column)}</td>
                                                                ))}
                                                                <td className="align-middle">
                                                                    <div className="d-flex justify-content-center align-items-center gap-2">

                                                                        <a href={`/app/devices?view_type=form&id=${row.id}`} className="btn btn-sm btn-outline-info">
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
            </Container >
        </>
    )
}