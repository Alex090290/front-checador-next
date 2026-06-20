"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TableTemplate";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

// ✅ ajusta el import a donde dejaste la interface
// ejemplo: import { AttendanceReportRow } from "@/lib/definitions";
type AttendanceReportRow = {
  totalChecks: number;
  lunchExcessMinutes: number;
  lunchExcessTimes: number;
  statsByStatus: Record<string, number>;
  faultsDays: string[];
  totalFaults: number;
  employee: {
    id: number;
    name: string;
    lastName: string;
    idDepartment: number;
    branch: number;
    status: number;
  };
  idEmployee: number;
  totalRecords: number;
  usersCount: number;
};

export default function AttendanceTable({
  id,
  data,
  total,
  page,
  limit,
  year
}: {
  id: string;
  data: AttendanceReportRow[];
  total: number;
  page: number;
  limit: number;
  year: string;
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
  }, [searchParamsString, loading]);


  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando...");
    const params = new URLSearchParams(searchParamsString);
    params.set("id", id);
    params.set("year", `${year}`);
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/attendanceReport?${params.toString()}`);
  };

  const columns: TableTemplateColumn<AttendanceReportRow>[] = useMemo(
    () => [
      {
        key: "employee",
        label: "Empleado",
        accessor: (row) =>
          `${row.employee.lastName} ${row.employee.name}`.toUpperCase(),
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-uppercase fw-semibold">
            {row.employee.lastName} {row.employee.name}
          </div>
        ),
      },
      {
        key: "totalChecks",
        label: "Checadas",
        accessor: (row) => row.totalChecks,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalChecks}</div>
        ),
      },
      {
        key: "totalRecords",
        label: "Registros",
        accessor: (row) => row.totalRecords,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalRecords}</div>
        ),
      },
      {
        key: "totalFaults",
        label: "Faltas",
        accessor: (row) => row.totalFaults,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalFaults}</div>
        ),
      },
      {
        key: "faultsDays",
        label: "Días con falta",
        accessor: (row) => (row.faultsDays ?? []).join(", "),
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fw-semibold">
            {(row.faultsDays ?? []).length === 0
              ? "—"
              : row.faultsDays.join(", ")}
          </div>
        ),
      },
      {
        key: "lunchExcessMinutes",
        label: "Exceso comida (min)",
        accessor: (row) => row.lunchExcessMinutes,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.lunchExcessMinutes}</div>
        ),
      },
      {
        key: "lunchExcessTimes",
        label: "Exceso comida (veces)",
        accessor: (row) => row.lunchExcessTimes,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.lunchExcessTimes}</div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">
                <ListView>
                  <ListView.Body>
                    <div className="table-responsive rounded-3 border overflow-hidden">
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
                          {(data ?? []).map((row) => (
                            <tr key={row.idEmployee}>
                              {columns.map((column) => (
                                <td key={String(column.key)}>
                                  {column.render
                                    ? column.render(row)
                                    : column.accessor(row)}
                                </td>
                              ))}

                              <td>
                                <a
                                  href={`/app/attendanceReport?view_type=form&idEmployee=${row.idEmployee}&id=${id}&year=${year}`}
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
