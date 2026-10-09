"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, Col, Container, Row } from "react-bootstrap";
import { ITermsAndConditions } from "@/lib/termsAndConditions/interface";

const EMPTY_LABELS = {
  terminos: "Aún no hay términos y condiciones publicados",
  privacidad: "Aún no hay aviso de privacidad publicado",
};

const TITLE_LABELS = {
  terminos: "Términos y condiciones",
  privacidad: "Aviso de privacidad",
};

export default function PublicTermsView({
  type,
  terms,
  message,
}: {
  type: "terminos" | "privacidad";
  terms: ITermsAndConditions | null;
  message?: string;
}) {
  return (
    <Container fluid className="min-vh-100 py-4 py-md-5"
      style={{
        background: "linear-gradient(135deg, var(--bs-danger-bg-subtle), var(--bs-body-bg))",
      }}
    >
      <Row className="justify-content-center">
        <Col xs="12" md="10" lg="8" xl="7">
          <div className="text-center mb-4">
            {/* LOGO */}
            <Image
              src="/image/icon.svg"
              alt="GAMA"
              width={56}
              height={56}
              style={{ objectFit: "contain" }}
            />
            <p className="text-muted small mb-0">Checador Digital</p>
          </div>

          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4 p-md-5">
              {terms ? (
                <>
                  <h1 className="fw-bold mb-2 text-break" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>
                    {terms.title}
                  </h1>
                  <p className="text-muted small mb-4">
                    Versión {terms.version} · Publicado el {terms.publishedAt ?? "-"}
                  </p>

                  {/* El contenido se muestra como TEXTO (nunca como HTML) */}
                  <div
                    className="lh-lg"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {terms.content}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-file-earmark-text d-block mb-2" style={{ fontSize: "2.5rem" }} />
                  <h1 className="fw-bold h4 mb-2">{TITLE_LABELS[type]}</h1>
                  <span className="fw-semibold">{message || EMPTY_LABELS[type]}</span>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <Link href="/auth" className="btn btn-outline-danger rounded-3 fw-semibold">
              <i className="bi bi-arrow-left me-2" />
              Regresar al inicio de sesión
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
