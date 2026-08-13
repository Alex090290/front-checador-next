"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TableTemplate";

import { IPermissionRequest } from "@/lib/definitions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import AlertSignaturesP from "./AlertSignatures";
import { ISignatures } from "@/lib/overTime/interface";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { formatCreatedAt } from "@/lib/helpers";

export const leaderApproval = {
  APPROVED: "APROBADO",
  REFUSED: "RECHAZADO",
  PENDING: "PENDIENTE",
  EMPLOYEE: "EMPLEADO",
};


export default function PermissionsTableClient({
  permissions,
  total,
  page,
  limit,
}: {
  id: string;
  permissions: IPermissionRequest[];
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

  const pendingPermissions = useMemo(() => {
    return (permissions ?? []).filter((o: IPermissionRequest) => {
      const signatures: ISignatures[] = o.signatures ?? [];
      const mySignature = signatures.find(
        (i: ISignatures) => Number(i.idSignatory) === idEmployee
      );
      if (!mySignature) return false;
      return mySignature.url === '';
    });
  }, [permissions, idEmployee]);

  const hasPendingSignature = pendingPermissions.length > 0;

  useEffect(() => {
    setHideSignatures(hasPendingSignature);
  }, [hasPendingSignature]);

  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading('Cargando');
    const params = new URLSearchParams(searchParamsString);
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/permissions?${params.toString()}`);
  };

  const columns: TableTemplateColumn<IPermissionRequest>[] = [
    {
      key: "id",
      label: "ID",
      accessor: (e) => e.id,
      filterable: true,
      type: "string",
      render: (e) => (
        <div className="text-uppercase">
          {`#${e.id}` || "-"}
        </div>
      )
    },
    {
      key: "employeeName",
      label: "Nombre",
      accessor: (row) => `${row.employee.lastName} ${row.employee.name}`,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-uppercase">
          {row.employee ? `${row.employee.lastName} ${row.employee.name}` : "—"}
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      accessor: (row) => row.type,
    },
    {
      key: "motive",
      label: "Motivo",
      accessor: (row) => row.motive,
      filterable: true,
      type: "string",
      render: (row) => <div className="text-uppercase">{row.motive}</div>,
    },
    {
      key: "createdAt",
      label: "Fecha de creación",
      accessor: (row) => row.createdAt,
      filterable: true,
      render: (row) => (
        <div className="text-start">
          {row.createdAt
            ? formatCreatedAt(row.createdAt)
            : "No Definido"}
        </div>
      ),
    },
    {
      key: "leaderApproval",
      label: "Estatus",
      accessor: (row) => leaderApproval[row.status],
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
  ];

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/permissions/create");
  };

  return (
    <>
      <ConditionalRender cond={hideSignatures}>
        <AlertSignaturesP
          onClose={() => setHideSignatures(false)}
          pendingIds={pendingPermissions.map((o) => o.id)}
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
          Crear permiso
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Permisos</h1>

            <span className="text-muted">
              {total} permiso{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">

                <ListView>
                  <ListView.Body>
                    <div className="table-responsive rounded-3 border overflow-auto">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark border-secondary">
                          <tr>
                            {columns.map((column) => (
                              <th
                                key={String(column.key)}
                                className="fw-bold text-start"
                              >
                                {column.label}
                              </th>
                            ))}

                            <th className="fw-bold">Detalles</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(permissions ?? []).map((row) => (
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
                                  href={`/app/permissions?view_type=form&id=${row.id}`}
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
