"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Col, Container, Pagination, Row } from "react-bootstrap";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TablePage";
import { IInability } from "@/lib/inhability/interface";
import { formatParse } from "@/lib/helpers";
import ModalBlur from "../ModalBlur";
import DeleteInhabilityModal from "./DeleteInhabilityModal";

type FeedbackState = "loading" | "success" | "error" | null;

function statusVariant(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "aviso_de_incapacidad":
      return (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
          Aviso de incapacidad
        </span>
      );
    case "posesion_de_hoja":
      return (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
          Posesión de hoja
        </span>
      );
    case "entrega_a_contabilidad":
      return (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
          Entrega a contabilidad
        </span>
      );
    case "alta":
      return (
        <span className="badge rounded-pill px-2 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
          Alta
        </span>
      );
    default:
      return (
        <span className="badge rounded-pill px2 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle" />
      );
  }
}

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

  const [showdeleteInhabilityModal, setShowDeleteInhabilityModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number | null>(null);
  const [motive, setMotive] = useState<string | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const totalPages = Math.ceil(total / limit);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  useEffect(() => {
    setFeedback(null);
    setFeedbackMsg("");
  }, [searchParamsString]);

  const handleCreate = () => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");
    router.push("/app/inability/create");
  };

  const goToPage = (nextPage: number) => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("view_type", "list");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    router.push(`/app/inability?${params.toString()}`);
  };

  const handleDelete = (idInhability: number, motive: string, status: boolean) => {
    setSelectedIds(idInhability);
    setMotive(motive);
    setStatus(status)
    setShowDeleteInhabilityModal(true);
  };

  const columns: TableTemplateColumn<IInability>[] = [
    {
      key: "id",
      label: "ID",
      accessor: (r) => r.id,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">
          {r.id}
        </div>
      ),
    },
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
      key: "whoCreate",
      label: "Creado por",
      accessor: (r) =>
        `${r.whoCreate?.name ?? ""} ${r.whoCreate?.lastName ?? ""}`.trim(),
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">
          {r.whoCreate?.lastName ?? ""} {r.whoCreate?.name ?? ""}
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
        <div className="text-start">
          {r.createdAt
            ? formatParse(r.createdAt)
            : ""}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estatus",
      align: "center",
      accessor: (r) => r.status,
      filterable: true,
      type: "string",
      render: (r) => {
        const isDelete = r.delete?.delete === true;

        if (isDelete === true) {
          return (
            <div className="text-center">
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                CANCELADO
              </span>
            </div>
          );
        } else {
          return (
            <div className="text-uppercase text-center"> {statusVariant(r.status)} </div>
          )
        }
      }
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
                                className={`fw-bold ${column.align === "center" ? "text-center" : "text-left"}`}
                              >
                                {column.label}
                              </th>
                            ))}

                            <th className="fw-bold text-center">Acciones</th>
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
                                <div className="d-flex align-items-center justify-content-center gap-2">

                                  <a
                                    href={row.delete?.delete === true ? undefined : `/app/inability?view_type=form&id=${row.id}`}
                                    className={`btn btn-sm btn-outline-info ${row.delete?.delete === true ? "disabled" : ""}`}
                                    aria-disabled={row.delete?.delete === true}
                                    onClick={(e) => {
                                      if (row.delete?.delete === true) e.preventDefault();
                                    }}
                                  >
                                    Ver
                                  </a>

                                  <a
                                    className={row.delete?.delete === true ? "btn btn-sm btn-outline-danger" : "btn btn-sm btn-danger"}
                                    onClick={() => handleDelete(row.id, row.delete?.reaseonDelete ?? "", row.delete?.delete ?? false)}
                                  >
                                    {row.delete?.delete === true ? "Ver motivo" : "Eliminar"}
                                  </a>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <small className="text-muted">
                        Página {page} de {totalPages}
                      </small>

                      <ConditionalRender cond={pageNumbers.length > 1}>
                        <Pagination size="sm" className="m-0">
                          {/* Botón Anterior */}
                          <Pagination.Prev
                            disabled={page <= 1}
                            onClick={() => goToPage(page - 1)}
                          >
                            Anterior
                          </Pagination.Prev>

                          {/* Números de Página Dinámicos */}
                          {pageNumbers.map((num) => (
                            <Pagination.Item
                              key={num}
                              active={num === page}
                              onClick={() => goToPage(num)}
                            >
                              {num}
                            </Pagination.Item>
                          ))}

                          {/* Botón Siguiente */}
                          <Pagination.Next
                            disabled={page >= totalPages}
                            onClick={() => goToPage(page + 1)}
                          >
                            Siguiente
                          </Pagination.Next>
                        </Pagination>
                      </ConditionalRender>
                    </div>
                  </ListView.Body>
                </ListView>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ConditionalRender cond={showdeleteInhabilityModal}>
          <ModalBlur onClose={() => setShowDeleteInhabilityModal(false)}>
            <DeleteInhabilityModal
              show={showdeleteInhabilityModal}
              onHide={() => { setShowDeleteInhabilityModal(false); }}
              idInhability={selectedIds}
              motive={motive}
              status={status}
            />
          </ModalBlur>
        </ConditionalRender>
      </Container >
    </>
  );
}