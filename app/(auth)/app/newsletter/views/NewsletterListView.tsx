"use client";

import { deleteNotice } from "@/app/actions/newsletter-actions";
import ConditionalRender from "@/components/ConditionalRender";
import ErrorOverlay from "@/components/ErrorOverlay";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { INewsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

type FeedbackState = "loading" | "success" | "error" | null;


function NewsletterListView({ newsletters }: { newsletters: INewsletter[] }) {
  const { modalError, modalConfirm } = useModals();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const colums: TableTemplateColumn<INewsletter>[] = [
    {
      key: "title",
      label: "Título",
      accessor: (row) => row.title,
      type: "string",
      filterable: true,
      render: (row) => (
        <div className="text-uppercase"> {row.title}</div>
      )
    },
    {
      key: "text",
      label: "Texto",
      accessor: (row) => row.text,
      type: "string",
      render: (row) => (
        <div className="text-uppercase"> {row.text}</div>
      )
    },
    {
      key: "dateInitiPublish",
      label: "Inicio",
      accessor: (row) => row.dateInitiPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-uppercase">
          {row.dateInitiPublish
            ? formatDate(row.dateInitiPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
    {
      key: "dateEndPublish",
      label: "Final",
      accessor: (row) => row.dateEndPublish,
      type: "date",
      groupFormat: "yyyy-MM",
      render: (row) => (
        <div className="text-uppercase">
          {row.dateEndPublish
            ? formatDate(row.dateEndPublish, "dd-MM-yyyy HH:mm")
            : null}
        </div>
      ),
    },
  ];

  const actionDeleteRecord = () => {
    if (selectedIds.length <= 0) {
      modalError("Selecciona un registro para continuar");
      return;
    }

    modalConfirm(
      `Se eliminarán ${selectedIds.length ?? 0} registros. Confirma la acción para continuar`,
      async () => {
        try {
          setFeedback("loading");
          setFeedbackMsg("Eliminando registros...");

          for (const record of selectedIds) {
            const res = await deleteNotice({ id: String(record) });

            if (!res) {
              setFeedbackMsg("Error al eliminar registro");
              setFeedback("error");
              return;
            }
          }

          setFeedbackMsg("Se han eliminado los registros");
          setFeedback("success");
        } catch {
          setFeedbackMsg("Error inesperado, intenta de nuevo");
          setFeedback("error");
        }
      }
    );
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Eliminando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            setSelectedIds([]);
            router.refresh();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
            href="/app/newsletter?view_type=form&id=null"
          >
            <i className="bi bi-plus-lg" />
            Crear anuncio
          </Button>

          <Button
            variant="danger"
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
            onClick={actionDeleteRecord}
            disabled={selectedIds.length === 0}
          >
            <i className="bi bi-trash" />
            Eliminar
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Anuncios</h1>

            <span className="text-muted">
              {newsletters.length} anuncio
              {newsletters.length !== 1 ? "s" : ""}
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
                            {colums.map((column) => (
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
                          {(newsletters ?? []).map((row) => (
                            <tr key={row.id}
                              className={selectedIds.includes(String(row.id)) ? "table-secondary" : ""}>
                              {colums.map((column) => (
                                <td key={String(column.key)}>
                                  {column.render
                                    ? column.render(row)
                                    : column.accessor(row)}
                                </td>
                              ))}

                              <td>
                                <button
                                  className={selectedIds.includes(String(row.id)) ? "btn btn-info btn-sm" : "btn btn-sm btn-outline-info"}
                                  onClick={() => {
                                    setSelectedIds((prev) =>
                                      prev.includes(String(row.id))
                                        ? prev.filter((id) => id !== String(row.id))
                                        : [...prev, String(row.id)]
                                    );
                                  }}
                                >
                                  seleccionar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

export default NewsletterListView;
