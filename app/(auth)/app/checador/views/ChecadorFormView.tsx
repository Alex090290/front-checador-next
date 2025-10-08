"use client";

import ChecadorEntryForm from "@/components/forms/ChecadorEntryForm";
import Clock from "@/components/top-nav/Clock";
import { formatDate } from "@/lib/helpers";
import { Card, Col, Container, Row } from "react-bootstrap";

function ChecadorFormView() {
  return (
    <Row className="h-100 overflow-auto">
      <Col md="12" className="h-100">
        <Card className="d-flex flex-column shadow h-100">
          <Card.Header>
            <h3 className="text-end fw-bolder">
              <span className="shadow-sm px-2 rounded">
                {formatDate(new Date())}
              </span>
            </h3>
            <Row>
              <Col md="6">
                <ChecadorEntryForm />
              </Col>
              <Col md="6" className="text-center text-uppercase fw-semibold">
                <div style={{ fontSize: "4rem" }}>
                  <Clock />
                </div>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="flex-fill overflow-auto p-1">
            <Container fluid className="h-100">
              <Row className="h-100">
                <Col md="6" className="overflow-auto h-100 bg-body-tertiary">
                  Eventos
                </Col>
                <Col md="6" className="h-100">
                  Anuncios
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default ChecadorFormView;
