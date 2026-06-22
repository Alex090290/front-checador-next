"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { Department } from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";

export default function DepartmentsTableList({
  departments,
  total,
  page,
  limit,
}: {
  departments: Department[];
  total: number;
  page: number;
  limit: number;
  search?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");


  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando");
    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/departments?${params.toString()}`);
  };

  const columns: TableTemplateColumn<Department>[] = [
    {
      key: "nameDepartment",
      label: "Nombre",
      accessor: (u) => u.nameDepartment,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.nameDepartment}</div>,
    },
    {
      key: "leader",
      label: "Líder",
      accessor: (u) => u.leader?.name,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">
          {`${u.leader?.name ?? " "} ${u.leader?.lastName ?? " "}`}
        </div>
      ),
    },
    {
      key: "positions",
      label: "Puestos",
      accessor: (u) => u.positions.length,
      filterable: false,
      type: "number",
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form.Select
            size="sm"
            className="text-uppercase shadow-none border-0"
          >
            <option>{u.positions.length}</option>
            {u.positions.map((p) => (
              <option key={`${p.id}-${p.namePosition}`}>{p.namePosition}</option>
            ))}
          </Form.Select>
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/departments/create");
  };

  // const deleteIds = async () => {
  //   for (const id of selectedIds) {
  //     const res = await deleteDepartment({ id: Number(id) });
  //     if (!res.success) {
  //       modalError(res.message);
  //       return;
  //     }
  //   }
  // };


  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
            onClick={handleCreate}
            disabled={loading}
          >
            <i className="bi bi-plus-lg" />
            Crear departamento
          </Button>

          {/* <Button
            variant="danger"
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
            onClick={handleDelete}
            disabled={loading || selectedIds.length === 0}
          >
            <i className="bi bi-trash" />
            Eliminar
          </Button> */}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Departamentos</h1>

            <span className="text-muted">
              {total} departamento{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">
                {/* <div className="mb-4">
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
                        placeholder="Buscar departamento..."
                      />
                    </InputGroup>
                  </Col>
                </div> */}

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
                          {(departments ?? []).map((row) => (
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
                                  href={`/app/departments?view_type=form&id=${row.id}`}
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