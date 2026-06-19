"use client";

import { useState } from "react";
import { Offcanvas, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import TopNavItems from "../top-nav/TopNavItems";

export default function Sidebar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const [show, setShow] = useState(false);
  const [collapsed] = useState(false);

  const toggleShow = () => setShow(!show);
  const closeMenu = () => setShow(false);

  const renderMenu = () => {
    if (userRole === "CHECADOR") return null;
    return <TopNavItems onNavigate={closeMenu} />;
  };

  return (
    <>
      {/* Botón menú */}
      <div className="p-2 border-bottom">
        <Button variant="outline-primary" onClick={toggleShow}>
          <i className="bi bi-list" />
        </Button>
      </div>

      <Offcanvas
        show={show}
        onHide={toggleShow}
        placement="start"
        style={{ width: collapsed ? "48px" : "180px" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {!collapsed && "Menú"}
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0">
          <div
            className="flex-grow-1 overflow-auto"
            style={{
              display: collapsed ? "none" : "block",
            }}
          >
            {renderMenu()}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}