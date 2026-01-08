"use client";

import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

function DocumentsUploader() {
  const [modalDocuments, setModalDocuments] = useState(false);
  return (
    <Container fluid className="mt-2">
      <Row>
        <Col md="12">
          <Button onClick={() => setModalDocuments(!modalDocuments)}>
            Nuevo
          </Button>
        </Col>
      </Row>
      <Row></Row>
    </Container>
  );
}

export default DocumentsUploader;
