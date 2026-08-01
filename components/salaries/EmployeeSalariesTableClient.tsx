"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TablePage";
import { Button, Card, Col, Container, Dropdown, InputGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import GenericSearchInput from "../employee/GenericSearchInput";
import { ISalariesEmployees } from "@/lib/salaries/interface";
import { Department, Branch, Position } from "@/lib/definitions";
import ModalBlur from "../ModalBlur";
import UpdateSalaryModal from "./UpdateSalaryModal";


export default function EmployeeSalariesTableClient({
    total,
    page,
    limit,
    employees = [],
    search = "",
    departments = [],
    branches = [],
}: {
    total: number;
    page: number;
    limit: number;
    employees?: ISalariesEmployees[];
    search?: string;
    departments?: Department[];
    branches?: Branch[];
    idDepartment?: string;
    idPosition?: string;
    branch?: string;
}) {
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [, setTableResetKey] = useState(0);
    const isClearingSelectionRef = useRef(false);
    const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
    const currentIdDepartment = sp.get("idDepartment") ?? "";
    const [positions, setPositions] = useState<Array<Position>>([]);
    const currentPosition = sp.get("idPosition") ?? "";
    const currentBranch = sp.get("branch") ?? "";
    const [showModalSalary, setShowModalSalary] = useState(false);


    useEffect(() => {
        setLoading(false);
        setMessageLoading("");
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

    const renderCell = (row: ISalariesEmployees, column: TableTemplateColumn<ISalariesEmployees>) => {
        if (column.render) {
            return column.render(row);
        }

        if (column.accessor) {
            return String(column.accessor(row) ?? "-");
        }

        return String(row[column.key as keyof ISalariesEmployees] ?? "-");
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

        router.push(`/app/salaries?${params.toString()}`);
    };

    // Filtrar por nombre o apellido
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
            router.push(`/app/salaries?${params.toString()}`);
        },
        [currentSearch, searchParamsString, limit, router, clearSelectedIds]
    );

    // Filtro por sucursal
    const handleBranchFilter = useCallback((value: string) => {
        setLoading(true);
        setMessageLoading("Filtrando...");

        const params = new URLSearchParams(searchParamsString);
        params.delete("id");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));

        if (value && value.trim() !== "") {
            params.set("branch", value.trim());
            params.delete("idDepartment")
        } else {
            params.delete("branch");
            params.delete("idDepartment")
        }

        clearSelectedIds();
        router.push(`/app/salaries?${params.toString()}`);
    }, [searchParamsString, limit, router, clearSelectedIds]);

    const selectedBranchName = useMemo(() => {
        if (!currentBranch) return "Sucursales";
        const found = branches.find(
            (br) => String(br.id) === currentBranch
        );
        return found ? found.name : "Sucursales";
    }, [currentBranch, branches]);


    // Filtro por departamento
    const handleDepartmentFilter = useCallback((value: string, positions?: Position[]) => {
        if (positions) {
            setPositions(positions)
        }
        setLoading(true);
        setMessageLoading("Filtrando...");

        const params = new URLSearchParams(searchParamsString);
        params.delete("id");
        params.delete("branch")
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));

        if (value && value.trim() !== "") {
            params.set("idDepartment", value.trim());
        } else {
            params.delete("branch");
            params.delete("idDepartment");
            params.delete("idPosition")
            setPositions([]);
        }

        clearSelectedIds();
        router.push(`/app/salaries?${params.toString()}`);
    }, [searchParamsString, limit, router, clearSelectedIds]);

    const selectedDepartmentName = useMemo(() => {
        if (!currentIdDepartment) return "Departamentos";
        const found = departments.find(
            (dep) => String(dep.id) === currentIdDepartment
        );
        return found ? found.nameDepartment : "Departamentos";
    }, [currentIdDepartment, departments]);

    // Filtro por puesto
    const handlePositionFilter = useCallback((id: string) => {
        setLoading(true);
        setMessageLoading("Filtrando...");

        const params = new URLSearchParams(searchParamsString);
        params.delete("id");
        params.set("view_type", "list");
        params.set("page", "1");
        params.set("limit", String(limit));

        if (id && id.trim() !== "") {
            params.set("idPosition", id.trim());
        } else {
            params.delete("idPosition");
        }

        clearSelectedIds();
        router.push(`/app/salaries?${params.toString()}`);
    }, [ searchParamsString, limit, router, clearSelectedIds]);

    const selectedPositionName = useMemo(() => {
        if (!currentIdDepartment) return "inhabilitado"
        if (!currentPosition) return "Puestos";
        const found = positions.find(
            (pos) => String(pos.id) === currentPosition
        );
        return found ? found.namePosition : "Puestos";
    }, [currentPosition, currentIdDepartment, positions]);


    // Seleccion de empleados
    const handleToggleSelect = (row: ISalariesEmployees) => {
        const rowId = String(row.id);
        const isSelected = selectedIds.includes(rowId);

        // Deseleccionar siempre se permite, sin validar nada
        if (isSelected) {
            setSelectedIds((prev) => prev.filter((id) => id !== rowId));
            return;
        }

        setSelectedIds((prev) => [...prev, rowId]);
    };

    const actionUpdateSalaries = () => {
        const selectedRows = (employees ?? []).filter((row) =>
            selectedIds.includes(String(row.id))
        );

        if (selectedRows.length > 0) {
            setShowModalSalary(true);
        }
    };


    //TABLA 
    const columns: TableTemplateColumn<ISalariesEmployees>[] = [
        {
            key: "employeeName",
            label: "Empleado",
            accessor: (u) => `${u.lastName} ${u.name}`,
            filterable: false,
            type: "string",
            render: (u) => <div className="text-uppercase">{u.lastName} {u.name}</div>,
        },
        {
            key: "branch",
            label: "Sucursal",
            accessor: (u) => u.branch,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">{u.branch.name}</div>
            ),
        },
        {
            key: "department",
            label: "Departamento",
            accessor: (u) => u.branch,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">{u.department.nameDepartment}</div>
            ),
        },
        {
            key: "position",
            label: "Puesto",
            accessor: (u) => u.position,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">{u.position.namePosition}</div>
            ),
        },
        {
            key: "dailyWage",
            label: "Salario diario",
            accessor: (u) => u.dailyWage,
            filterable: false,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">${u.dailyWage}</div>
            ),
        }
    ];

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>
                <Button
                    variant="primary"
                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={actionUpdateSalaries}
                    disabled={selectedIds.length === 0 || loading}
                >
                    <i className="bi bi-pencil" />
                    Actualizar Salario Diario
                </Button>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Salarios</h1>

                        <span className="text-muted">
                            {total} empleado{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">
                                <div className="mb-4">
                                    <Row className="mb-4 g-5 align-items-between">

                                        {/* FILTRO DE EMPLEADOS */}
                                        <Col xs={12} sm={6} md={6} lg={3} style={{ minWidth: 0 }}>
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

                                        {/* FILTRO DE SUCURSALES */}
                                        <Col xs={12} sm={6} md={6} lg={3} style={{ minWidth: 0 }}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-building text-primary" />
                                                        <span className="fw-semibold small">Filtrar por sucursal</span>
                                                    </div>

                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                            style={{ minWidth: 0 }}
                                                        >
                                                            {selectedBranchName}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                active={!currentBranch}
                                                                onClick={() => handleBranchFilter("")}
                                                            >
                                                                <span className="text-uppercase text-muted">TODOS</span>
                                                            </Dropdown.Item>

                                                            {branches.map((br) => (
                                                                <Dropdown.Item
                                                                    key={br.id}
                                                                    active={String(br.id) === currentBranch}
                                                                    onClick={() => handleBranchFilter(String(br.id))}>
                                                                    <span className="text-uppercase">
                                                                        {br.name}
                                                                    </span>
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        {/* FILTRO DE DEPARTAMENTOS */}
                                        <Col xs={12} sm={6} md={6} lg={3} style={{ minWidth: 0 }}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-columns-gap text-primary" />
                                                        <span className="fw-semibold small">Filtrar por departamento</span>
                                                    </div>

                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                            style={{ minWidth: 0 }}
                                                        >
                                                            {selectedDepartmentName}
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                active={!currentIdDepartment}
                                                                onClick={() => handleDepartmentFilter("")}
                                                            >
                                                                <span className="text-uppercase text-muted">TODOS</span>
                                                            </Dropdown.Item>

                                                            {departments.map((dep) => (
                                                                <Dropdown.Item
                                                                    key={dep.id}
                                                                    active={String(dep.id) === currentIdDepartment}
                                                                    onClick={() => handleDepartmentFilter(String(dep.id), dep.positions)}>
                                                                    <span className="text-uppercase">
                                                                        {dep.nameDepartment}
                                                                    </span>
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </Card.Body>
                                            </Card>
                                        </Col>

                                        {/* FILTRO POR PUESTOS */}
                                        <Col xs={12} sm={6} md={6} lg={3} style={{ minWidth: 0 }}>
                                            <Card className="rounded-4 border h-100">
                                                <Card.Body className="p-3">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-briefcase text-primary" />
                                                        <span className="fw-semibold small">Filtrar por puesto</span>

                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip id="tooltip-info">
                                                                    Para filtrar por puesto, primero debes elegir un departamento.
                                                                </Tooltip>
                                                            }
                                                        >
                                                            <span style={{ cursor: "pointer" }}>
                                                                <i className="bi bi-info-circle-fill text-primary" />
                                                            </span>
                                                        </OverlayTrigger>
                                                    </div>


                                                    <Dropdown className="w-100">
                                                        <Dropdown.Toggle
                                                            as={Button}
                                                            variant="outline-secondary"
                                                            className="w-100 d-flex align-items-center justify-content-between text-uppercase"
                                                            disabled={!currentIdDepartment}
                                                            style={{ minWidth: 0 }}
                                                        >
                                                            {selectedPositionName}
                                                        </Dropdown.Toggle>


                                                        <Dropdown.Menu className="w-100 text-truncate">

                                                            <Dropdown.Item
                                                                active={!currentPosition}
                                                                onClick={() => handlePositionFilter("")}
                                                            >
                                                                <span className="text-uppercase text-muted">TODOS</span>
                                                            </Dropdown.Item>

                                                            {positions.map((pos) => (
                                                                <Dropdown.Item
                                                                    key={pos.id}
                                                                    onClick={() => handlePositionFilter(String(pos.id))}>
                                                                    <span className="text-uppercase text-truncate">
                                                                        {pos.namePosition}
                                                                    </span>
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
                                                                className="fw-bold text-left"
                                                            >
                                                                {column.label}
                                                            </th>
                                                        ))}

                                                        <th className="fw-bold">Detalles</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {(employees ?? []).map((row) => {
                                                        const isSelected = selectedIds.includes(String(row.id));

                                                        return (
                                                            <tr key={row.id} className={isSelected ? "table-secondary table-row-selected" : ""}>
                                                                {columns.map((column) => (
                                                                    <td key={String(column.key)}>{renderCell(row, column)}</td>
                                                                ))}
                                                                <td className="align-middle">
                                                                    <div className="d-flex justify-content-center align-items-center gap-2">


                                                                        <button
                                                                            className={isSelected ? "btn btn-info btn-sm" : "btn btn-sm btn-outline-info"}
                                                                            onClick={() => handleToggleSelect(row)}
                                                                        >
                                                                            {isSelected ? "Seleccionado" : "Seleccionar"}
                                                                        </button>

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

                <ConditionalRender cond={showModalSalary}>
                    <ModalBlur onClose={() => setShowModalSalary(false)}>
                        <UpdateSalaryModal
                            show={showModalSalary}
                            onHide={() => {
                                setShowModalSalary(false);
                                clearSelectedIds();
                            }}

                            employees={(employees ?? []).filter((row) =>
                                selectedIds.includes(String(row.id))
                            )}
                        />
                    </ModalBlur>
                </ConditionalRender>
            </Container >
        </>
    );
}