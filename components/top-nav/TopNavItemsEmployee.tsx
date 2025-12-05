"use client";

import Link from "next/link";
import { Nav } from "react-bootstrap";

function TopNavItemsEmployee() {
  return (
    <Nav
      className="flex-column"
      defaultActiveKey="/app/permissions"
      variant="pills"
    >
      <Nav.Item>
        <Nav.Link as={Link} href="/app/permissions?view_type=list&id=null">
          <i className="bi bi-file-earmark-ruled me-1"></i>
          <span>Permisos</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} href="/app/vacations?view_type=list&id=null">
          <i className="bi bi-calendar4-week me-1"></i>
          <span>Vacaciones</span>
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default TopNavItemsEmployee;
