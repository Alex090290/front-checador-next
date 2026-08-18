"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { Vacations } from "@/lib/definitions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import AlertSignaturesV from "./AlertSignatures";
import { ISignatures } from "@/lib/overTime/interface";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { formatCreatedAt } from "@/lib/helpers";

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
  const session = useSessionSnapshot();
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState('');
  const [hideSignatures, setHideSignatures] = useState(false);
  const idEmployee = Number(session?.uid?.idEmployee);

  const pendingVacations = useMemo(() => {
    return (vacations ?? []).filter((o: Vacations) => {
      const signatures: ISignatures[] = o.signatures ?? [];
      const mySignature = signatures.find(
        (i: ISignatures) => Number(i.idSignatory) === idEmployee
      );
      if (!mySignature) return false;
      return mySignature.url === '';
    });
  }, [vacations, idEmployee]);

  const hasPendingSignature = pendingVacations.length > 0;

  useEffect(() => {
    setHideSignatures(hasPendingSignature);
  }, [hasPendingSignature]);


  useEffect(() => {
    setLoading(false);
    setMessageLoading("");
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
        <div className="text-left">{row.holidayName}</div>
      ),
    },
    {
      key: "period",
      label: "Periodo Vacacional",
      accessor: (row) => row.period.periodDescription,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-left">
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
        <div className="text-left">
          {formatCreatedAt(row.dateInit)}
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
        <div className="text-left">
          {formatCreatedAt(row.dateEnd)}
        </div>
      ),
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
      label: "Estado",
      align: "center",
      accessor: (row) => row.status,
      type: "string",
      render: (e) => {
        const estado = e.status
        switch (estado) {
          case "APPROVED":
            return (
              <div className="text-center">
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                  APROBADO
                </span>
              </div>
            );
          case "PENDING":
            return (
              <div className="text-center">
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                  PENDIENTE
                </span>
              </div>
            );
          case "REFUSED":
            return (
              <div className="text-center">
                <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                  RECHAZADO
                </span>
              </div>
            );
        }
      },
    },
  ],
    [idEmployee]
  );

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/vacationList/create");
  };


  return (
    <>
      <ConditionalRender cond={hideSignatures}>
        <AlertSignaturesV
          onClose={() => setHideSignatures(false)}
          pendingIds={pendingVacations.map((o) => o.id)}
        />
      </ConditionalRender>

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
