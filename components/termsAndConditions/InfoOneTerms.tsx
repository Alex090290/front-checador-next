"use client";

import { useState } from "react";
import { Accordion, Button, Card, Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import {
  ITermsAndConditions,
  ITermsAuthor,
  LEGAL_DOCUMENT_LABELS,
} from "@/lib/termsAndConditions/interface";

function formatText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatAuthor(author?: ITermsAuthor | null) {
  if (!author) return "-";
  return author.name ? `${author.name} (${author.email})` : author.email;
}

// El contenido se muestra como TEXTO (nunca como HTML)
const contentStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: "60vh",
  overflowY: "auto",
};

export default function InfoOneTerms({
  terms,
  message,
}: {
  terms: ITermsAndConditions | null;
  message?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    setLoading(true);
    router.push("/app/termsAndConditionsAdmin");
  };

  const history = terms?.history ?? [];

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message="Cargando datos..." />
      </ConditionalRender>

      <Container className="py-3 overflow-x-auto" style={{ maxWidth: "1600px" }}>
        <div className="d-flex justify-content-end align-items-center mb-4 flex-wrap gap-3">
          <Button
            variant="outline-secondary"
            onClick={handleBack}
            disabled={loading}
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
          >
            <i className="bi bi-arrow-left" />
            Regresar
          </Button>
        </div>

        <ConditionalRender cond={!terms}>
          <Card className="rounded-4 shadow-sm border">
            <Card.Body className="p-5 text-center text-muted">
              <i className="bi bi-clipboard-x d-block mb-2" style={{ fontSize: "2.5rem" }} />
              <span className="fw-semibold">{message || "No se encontró el documento"}</span>
            </Card.Body>
          </Card>
        </ConditionalRender>

        <ConditionalRender cond={!!terms}>
          <div>
            <h1 className="mb-1 ms-1 text-break">
              {terms?.title}
            </h1>

            <p className="text-muted mb-3 ms-1">
              {terms ? LEGAL_DOCUMENT_LABELS[terms.type] : ""} · v{terms?.version}
            </p>
          </div>

          <Card className="rounded-4 shadow-sm border">
            <Card.Body className="p-3 p-md-5">
              <Row className="g-2">
                <Col xs={12} lg={6}>
                  <Card className="border rounded-4 h-100">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h6 className="mb-0 fw-bold">Documento</h6>

                        {terms?.isActive ? (
                          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                            Vigente
                          </span>
                        ) : (
                          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                            Inactivo
                          </span>
                        )}
                      </div>

                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom pb-2">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-file-earmark-text text-primary" />
                            <span>Tipo</span>
                          </div>
                          <span className="fw-semibold text-end">
                            {terms ? LEGAL_DOCUMENT_LABELS[terms.type] : "-"}
                          </span>
                        </div>

                        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom pb-2">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-hash text-secondary" />
                            <span>Versión</span>
                          </div>
                          <span className="fw-semibold text-end">v{terms?.version}</span>
                        </div>

                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-calendar-check text-success" />
                            <span>Publicado</span>
                          </div>
                          <span className="fw-semibold text-end">{formatText(terms?.publishedAt)}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12} lg={6}>
                  <Card className="border rounded-4 h-100">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h6 className="mb-0 fw-bold">Registro</h6>

                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                          Autor
                        </span>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-1 gap-sm-3 border-bottom pb-2">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-person-plus text-primary" />
                            <span>Creado por</span>
                          </div>
                          <span className="fw-semibold text-sm-end text-break">{formatAuthor(terms?.createdBy)}</span>
                        </div>

                        <div className="d-flex align-items-start justify-content-between gap-3 border-bottom pb-2">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-calendar-plus text-primary" />
                            <span>Creado el</span>
                          </div>
                          <span className="fw-semibold text-end">{formatText(terms?.createdAt)}</span>
                        </div>

                        <div className="d-flex flex-column flex-sm-row align-items-sm-start justify-content-between gap-1 gap-sm-3 border-bottom pb-2">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-pencil text-warning" />
                            <span>Editado por</span>
                          </div>
                          <span className="fw-semibold text-sm-end text-break">{formatAuthor(terms?.updatedBy)}</span>
                        </div>

                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-calendar-event text-warning" />
                            <span>Actualizado el</span>
                          </div>
                          <span className="fw-semibold text-end">{formatText(terms?.updatedAt)}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="border rounded-4">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0 fw-bold">Contenido</h6>
                      </div>

                      <div className="bg-body-tertiary border rounded-3 p-3" style={contentStyle}>
                        {terms?.content || "-"}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xs={12}>
                  <Card className="border rounded-4">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0 fw-bold">Historial de versiones</h6>

                        <span className="badge rounded-pill px-3 py-2 fw-semibold bg-primary-subtle text-primary-emphasis border border-primary-subtle">
                          {history.length} versi{history.length === 1 ? "ón" : "ones"}
                        </span>
                      </div>

                      <ConditionalRender cond={history.length === 0}>
                        <div className="text-center text-muted py-3">
                          No hay versiones anteriores
                        </div>
                      </ConditionalRender>

                      <ConditionalRender cond={history.length > 0}>
                        <Accordion alwaysOpen>
                          {history.map((item) => (
                            <Accordion.Item key={item.version} eventKey={String(item.version)}>
                              <Accordion.Header>
                                <div className="d-flex flex-column flex-md-row gap-1 gap-md-3 me-2" style={{ minWidth: 0 }}>
                                  <span className="fw-semibold">v{item.version}</span>
                                  <span className="text-break">{item.title}</span>
                                  <span className="text-muted small">
                                    {item.updatedAt} · {formatAuthor(item.updatedBy)}
                                  </span>
                                </div>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div className="bg-body-tertiary border rounded-3 p-3" style={contentStyle}>
                                  {item.content || "-"}
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </ConditionalRender>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </ConditionalRender>
      </Container>
    </>
  );
}
