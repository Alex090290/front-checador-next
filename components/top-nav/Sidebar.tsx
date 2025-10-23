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
    if (userRole === "CHECADOR" || userRole === "EMPLOYEE") return null;
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
        className="d-none d-lg-block border-0 h-100 me-1"
        style={{ minWidth: "180px" }}
      >
        {/* <Card.Header>
          <Card.Title>Menú Principal</Card.Title>
        </Card.Header> */}
        <Card.Body className="p-0">{renderMenu()}</Card.Body>
      </Card>
    </>
  );
}
