"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import moment from "moment-timezone";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TablePage";
import { IInability } from "@/lib/definitions";

const statusVariantMap: Record<string, string> = {
  APROBADA: "badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle",
  // APROBADO: "success",
  PENDIENTE: "badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle",
  RECHAZADA: "badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle",
  RECHAZADO: "badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle",
};

export default function TableInabilityComponent({
  total,
  page,
  limit,
  inhabilities = [],
}: {
  total: number;
  page: number;
  limit: number;
  inhabilities?: IInability[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  useEffect(() => {
    setLoading(false);
    setMessageLoading("");
  }, [searchParamsString]);

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/inability/create");
  };

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("view_type", "list");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    router.push(`/app/inability?${params.toString()}`);
  };

  const columns: TableTemplateColumn<IInability>[] = [
    {
      key: "employee",
      label: "Empleado",
      accessor: (r) =>
        `${r.employee?.name ?? ""} ${r.employee?.lastName ?? ""}`.trim(),
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">
          {r.employee?.name ?? ""} {r.employee?.lastName ?? ""}
        </div>
      ),
    },
    {
      key: "disabilityCategory",
      label: "Categoría",
      accessor: (r) => r.disabilityCategory,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">{r.disabilityCategory}</div>
      ),
    },
    {
      key: "typeOfDisability",
      label: "Tipo",
      accessor: (r) => r.typeOfDisability,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">{r.typeOfDisability}</div>
      ),
    },
    {
      key: "status",
      label: "Estatus",
      accessor: (r) => r.status,
      filterable: true,
      type: "string",
      render: (r) => {
        const status = String(r.status ?? "").toUpperCase();
        const variant = statusVariantMap[status] ?? "badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle";

        return (
          <div className="text-start">
            <Badge pill bg={variant}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "whoCreate",
      label: "Creado por",
      accessor: (r) =>
        `${r.whoCreate?.name ?? ""} ${r.whoCreate?.lastName ?? ""}`.trim(),
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">
          {r.whoCreate?.name ?? ""} {r.whoCreate?.lastName ?? ""}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Creación",
      accessor: (r) => r.createdAt,
      filterable: true,
      type: "date",
      render: (r) => (
        <div className="small text-start text-uppercase">
          {r.createdAt ? moment.utc(r.createdAt).format("DD/MM/YYYY") : ""}
        </div>
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
          Crear incapacidad
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Incapacidades</h1>

            <span className="text-muted">
              {total} incapacidad{total !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">
                <div className="mb-4">
                  {/* <Col xs={12} md={6} lg={4}>
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
                        placeholder="Buscar incapacidad..."
                      />
                    </InputGroup>
                  </Col> */}
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
                          {(inhabilities ?? []).map((row) => (
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
                                  href={`/app/inability?view_type=form&id=${row.id}`}
                                  className="btn btn-sm btn-outline-info"
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