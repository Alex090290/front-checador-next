"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Employee } from "@/lib/definitions";
import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TablePage";
import { Button, Card, Col, Container, InputGroup, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import GenericSearchInput from "./GenericSearchInput";

const employeeStatus = {
  1: "activo",
  2: "baja",
};

export default function EmployeeTableClient({
  total,
  page,
  limit,
  employees = [],
  search = "",
}: {
  total: number;
  page: number;
  limit: number;
  employees?: Employee[];
  search?: string;
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
  const [, setSelectedIds] = useState<Array<string | number>>([]);

  useEffect(() => {
  setLoading(false);
  setMessageLoading("");
}, [searchParamsString]);

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/employee/create");
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

    router.push(`/app/employee?${params.toString()}`);
  };

  // const handleSelectionChange = (ids: Array<string | number>) => {
  //   if (isClearingSelectionRef.current) return;
  //   setSelectedIds(ids);
  // };

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

  const columns: TableTemplateColumn<Employee>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (u) => u.name,
      filterable: false,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.name}</div>,
    },
    {
      key: "lastName",
      label: "Apellidos",
      accessor: (u) => u.lastName,
      filterable: false,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.lastName}</div>,
    },
    {
      key: "status",
      label: "Estado",
      accessor: (u) => employeeStatus[u.status as keyof typeof employeeStatus] ?? "",
      filterable: false,
      type: "string",
      render: (u) => {
        const estado = u.status
        switch (estado) {
          case 1:
            return (
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                ACTIVO
              </span>
            );
          case 2:
            return (
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                BAJA
              </span>
            );
        }
      }
    },
    {
      key: "phonePersonal.internationalNumber",
      label: "Teléfono",
      accessor: (u) => u.phonePersonal?.internationalNumber,
      filterable: false,
      type: "string",
    },
    {
      key: "department.nameDepartment",
      label: "Departamento",
      accessor: (u) => u.department?.nameDepartment,
      filterable: false,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{u.department?.nameDepartment}</div>
      ),
    },
    {
      key: "position.namePosition",
      label: "Puesto",
      accessor: (u) => u.position?.namePosition,
      filterable: false,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{u.position?.namePosition}</div>
      ),
    },
    {
      key: "leader.name",
      label: "Líder",
      accessor: (u) => u.leader?.name,
      filterable: false,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">
          {`${u.leader?.name ?? ""} ${u.leader?.lastName ?? ""}`}
        </div>
      ),
    },
    {
      key: "branch.name",
      label: "Sucursal",
      accessor: (u) => u.branch?.name,
      filterable: false,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{u.branch?.name}</div>
      ),
    },
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
          onClick={handleCreate}
          disabled={loading}
        >
          <i className="bi bi-plus-lg" />
          Crear empleado
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Empleados</h1>

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
                        placeholder="Buscar por nombre o apellido"
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
                                className="fw-bold text-left"
                              >
                                {column.label}
                              </th>
                            ))}

                            <th className="fw-bold">Detalles</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(employees ?? []).map((row) => (
                            <tr key={row.id}>
                              {columns.map((column) => (
                                <td key={String(column.key)}>
                                  {column.render
                                    ? column.render(row)
                                    : column.accessor(row)}
                                </td>
                              ))}

                              <td>
                                <a
                                  href={`/app/employee?view_type=form&id=${row.id}`}
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