"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { Branch } from "@/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function BranchesTableClient({
  branches,
  total,
  page,
  limit,
}: {
  branches: Branch[];
  total: number;
  page: number;
  limit: number;
  search?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const searchParamsString = sp.toString();


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
    router.push(`/app/branches?${params.toString()}`);
  };

  const columns: TableTemplateColumn<Branch>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (u) => u.name,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.name}</div>,
    },
    {
      key: "address.street",
      label: "Calle",
      accessor: (u) => u.address?.street,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">
          {u.address?.street} {u.address?.numberOut}
        </div>
      ),
    },
    {
      key: "address.neighborhood",
      label: "Colonia",
      accessor: (u) => u.address?.neighborhood,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{u.address?.neighborhood}</div>
      ),
    },
    {
      key: "address.zipCode",
      label: "C.P.",
      accessor: (u) => u.address?.zipCode,
      filterable: true,
      type: "number",
      render: (u) => <div className="text-uppercase">{u.address?.zipCode}</div>,
    },
    {
      key: "address.municipality",
      label: "Municipio",
      accessor: (u) => u.address?.municipality,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{u.address?.municipality}</div>
      ),
    },
    {
      key: "address.state",
      label: "Estado",
      accessor: (u) => u.address?.state,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.address?.state}</div>,
    },
  ];

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/branches/create");
  };

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
          Crear sucursal
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Sucursales</h1>

            <span className="text-muted">
              {total} sucursal{total !== 1 ? "es" : ""}
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
                        placeholder="Buscar sucursal..."
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
                          {(branches ?? []).map((row) => (
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
                                  href={`/app/branches?view_type=form&id=${row.id}`}
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