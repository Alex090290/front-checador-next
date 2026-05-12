// components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import { Offcanvas, Button, Card } from "react-bootstrap";
import { useSession } from "next-auth/react";
import TopNavItems from "../top-nav/TopNavItems";

export default function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  const renderMenu = () => {
    if (userRole === "CHECADOR") return null;
    return <TopNavItems />;
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <div className="d-lg-none p-2 border-bottom">
        <Button variant="outline-primary" onClick={toggleShow}>
          <i className="bi bi-list" />
        </Button>
      </div>

      {/* Sidebar Offcanvas - only for small screens */}
      <div className="d-lg-none">
        <Offcanvas show={show} onHide={toggleShow} placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>{renderMenu()}</Offcanvas.Body>
        </Offcanvas>
      </div>

      {/* Static sidebar - only for large screens */}
      <Card
        className="d-none d-lg-flex flex-column border-0 me-1"
        style={{width: "180px", minWidth: "180px", flexShrink: 0, height: "100%", minHeight: 0, overflow: "hidden",}}>
        <Card.Body
          className="p-0"
          style={{flex: "1 1 auto", minHeight: 0, overflow: "hidden",}}>
          <div
            style={{height: "90%", overflowY: "auto", overflowX: "hidden",}}>
            {renderMenu()}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
