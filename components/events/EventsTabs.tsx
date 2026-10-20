"use client"

import { Badge, Nav } from "react-bootstrap";

type EventsTab = "registros" | "pendientes";

//Pestañas del módulo Checador: registros y la bandeja de DOH de checadas por validar
export default function EventsTabs({
    active,
    pendingCount,
    onNavigate,
}: {
    active: EventsTab;
    pendingCount: number;
    onNavigate: (url: string) => void;
}) {
    return (
        <Nav
            variant="tabs"
            activeKey={active}
            className="mb-4 flex-nowrap overflow-auto"
            onSelect={(key) => {
                if (!key || key === active) return;
                onNavigate(key === "pendientes" ? "/app/eventos?tab=pendientes" : "/app/eventos");
            }}
        >
            <Nav.Item>
                <Nav.Link eventKey="registros" className="text-nowrap fw-semibold">
                    <i className="bi bi-list-check me-2" />
                    Registros
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="pendientes" className="text-nowrap fw-semibold d-flex align-items-center">
                    <i className="bi bi-hourglass-split me-2" />
                    Checadas por validar
                    {pendingCount > 0 && (
                        <Badge
                            bg="warning-subtle"
                            text="warning-emphasis"
                            className="rounded-pill ms-2 border border-warning-subtle"
                        >
                            {pendingCount}
                        </Badge>
                    )}
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );
}
