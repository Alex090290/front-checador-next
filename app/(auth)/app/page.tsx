"use client"
import GraphicOne from "@/components/graphics/graphic_1";
import GraphicTwo from "@/components/graphics/graphic_2";
import GraphicThree from "@/components/graphics/graphic_3";
import GraphicFour from "@/components/graphics/graphic_4";
import Loading from "@/components/LoadingSpinner";
import { Suspense } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

function PageApp() {
  return (
    <Suspense fallback={<Loading message="Cargando datos..." />}>

      <Container fluid className="py-3 px-4">
        <div className="mb-4">
          <h1 className="mb-1 ms-1">Administración</h1>
          <p className="text-muted mb-0 ms-1">
            Panel de indicadores y estadísticas del sistema.
          </p>
        </div>

        <Card
          className="border shadow-sm rounded-4 mt-2"
          style={{
            minHeight: "calc(100vh - 220px)",
            maxHeight: "calc(100vh - 220px)",
            // overflow: "hidden",
            overflowY: "auto",
          }}
        >
          <Card.Body className="container-fluid h-100 ">
            <Row className="h-100">
              <Col xs="12" sm="12" md="6" lg="6">
                <GraphicOne />
              </Col>

              <Col xs="12" sm="12" md="6" lg="6">
                <GraphicTwo />
              </Col>
            </Row>

            <Row className="h-100">
              <Col xs="12" sm="12" md="6" lg="6">
                <GraphicThree />
              </Col>

              <Col xs="12" sm="12" md="6" lg="6">
                <GraphicFour />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </Suspense>
  );
}

export default PageApp;
