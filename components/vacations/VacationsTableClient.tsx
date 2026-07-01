"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { formatDate } from "date-fns";

import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TableTemplate";

import { Vacations } from "@/lib/definitions";
import { vacationStatus } from "@/app/(auth)/app/vacations/views/VacationsListView";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

export default function VacationsTableClient({
  vacations,
  total,
  page,
  limit,
}: {
  id: string;
  vacations: Vacations[];
  total: number;
  page: number;
  limit: number;
}) {

  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState('');


  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading('Cargando...');
    const params = new URLSearchParams(sp.toString());
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/vacationList?${params.toString()}`);
  };

  const columns: TableTemplateColumn<Vacations>[] = useMemo(() => [
    {
      key: "employee",
      label: "Empleado",
      accessor: (row) =>
        `${row.employee.lastName} ${row.employee.name}`.toUpperCase(),
      filterable: true,
      type: "string",
    },
    {
      key: "holidayName",
      label: "Día festivo",
      accessor: (row) => row.holidayName,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-left fs-6 fw-semibold">{row.holidayName}</div>
      ),
    },
    {
      key: "period",
      label: "Periodo Vacacional",
      accessor: (row) => row.period.periodDescription,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-left fs-6 fw-semibold">
          {row.period.periodDescription}
        </div>
      ),
    },
    {
      key: "dateInit",
      label: "Fecha Inicio",
      accessor: (row) => row.dateInit,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-left fs-6 fw-semibold">
          {formatDate(row.dateInit, "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      key: "dateEnd",
      label: "Fecha Fin",
      accessor: (row) => row.dateEnd,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-left fs-6 fw-semibold">
          {formatDate(row.dateEnd, "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: (row) => vacationStatus[row.status],
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
    },
  ],
    []
  );

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/vacationList/create");
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
          Crear registro
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Vacaciones</h1>

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
                        placeholder="Buscar vacaciones..."
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
                          {(vacations ?? []).map((row) => (
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
                                  href={`/app/vacationList?view_type=form&id=${row.id}`}
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
