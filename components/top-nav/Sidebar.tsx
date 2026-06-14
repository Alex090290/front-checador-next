"use client";

import { useState } from "react";
import { Offcanvas, Button, Card } from "react-bootstrap";
import { useSession } from "next-auth/react";
import TopNavItems from "../top-nav/TopNavItems";

export default function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [show, setShow] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleShow = () => setShow(!show);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  const renderMenu = () => {
    if (userRole === "CHECADOR") return null;
    return <TopNavItems />;
  };

  return (
    <>
      {/* Mobile */}
      <div className="d-lg-none p-2 border-bottom">
        <Button variant="outline-primary" onClick={toggleShow}>
          <i className="bi bi-list" />
        </Button>
      </div>

      <div className="d-lg-none">
        <Offcanvas show={show} onHide={toggleShow} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>{renderMenu()}</Offcanvas.Body>
        </Offcanvas>
      </div>

      {/* Desktop */}
      <Card
        className="d-none d-lg-flex flex-column border-0 me-1"
        style={{
          width: collapsed ? "48px" : "180px",
          minWidth: collapsed ? "48px" : "180px",
          flexShrink: 0,
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <Card.Body
          className="p-0 d-flex flex-column"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
          }}
        >
          {/* Menú */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              display: collapsed ? "none" : "block",
            }}
          >
            {renderMenu()}
          </div>

          {/* Botón colapsar */}
          <div className="border-top p-2 d-flex justify-content-center">
            <Button
              variant="primary"
              size="sm"
              onClick={toggleCollapsed}
              className="w-100"
            >
              <i
                className={`bi ${collapsed
                    ? "bi-chevron-right"
                    : "bi-chevron-left"
                  }`}
              />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}