"use client"

import { Card, Col, Container, Row } from "react-bootstrap"
import GraphicOne from "../graphics/graphic_1"
import GraphicTwo from "../graphics/graphic_2"
import GraphicThree from "../graphics/graphic_3"
import GraphicFour from "../graphics/graphic_4"
import ConditionalRender from "../ConditionalRender"
import Loading from "../LoadingSpinner"
import { useState } from "react"

export default function DashboardViewClient() {

    const [loading] = useState(false);
    const [messageLoading] = useState('Cargando datos...');

    // const baseItems = [
    //     { label: "Permisos solicitados", icon: "file-earmark-ruled", value: 10, view: "permissions" },
    //     { label: "Vacaciones solicitadas", icon: "calendar4-week", value: 12, accent: "pink" },
    //     { label: "Incapacidades", icon: "clipboard2-pulse", value: 4, accent: "orange" },
    //     { label: "Horas extra", icon: "clock-history", value: 2, accent: "info" },
    //     { label: "Penalizaciones", icon: "exclamation-octagon", value: 2, accent: "danger" },
    //     { label: "Faltas justificadas", icon: "calendar-check", value: 2, accent: "success" },
    //     { label: "Faltas injustificadas", icon: "calendar-x", value: 2, accent: "purple" },
    // ];

    return (
        <>

            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <Container fluid className="py-3 px-4">
                <div className="mb-4">
                    <h1 className="mb-1 ms-1">Administración</h1>
                    <p className="text-muted mb-0 ms-1">
                        Panel de indicadores y estadísticas del sistema.
                    </p>
                </div>

                <Card
                    className="border shadow-sm rounded-4"
                    style={{ minHeight: "calc(100vh - 220px)" }}
                >
                    <Card.Body className="p-3">
                        <Row className="g-2">
                            <Col xs={12} md={6} className="h-50">
                                <div className="border rounded-3" style={{ height: "350px" }}>
                                    <GraphicOne />
                                    {/* <StatCardCarousel items={baseItems} /> */}
                                </div>
                            </Col>

                            <Col xs={12} md={6} className="h-50">
                                <div className="border rounded-3" style={{ height: "350px" }}>
                                    <GraphicTwo />
                                </div>
                            </Col>

                            <Col xs={12} md={6} className="h-50">
                                <div className="border rounded-3" style={{ height: "350px" }}>
                                    <GraphicThree />
                                </div>
                            </Col>

                            <Col xs={12} md={6} className="h-50">
                                <div className="border rounded-3" style={{ height: "350px" }}>
                                    <GraphicFour />
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    )
}