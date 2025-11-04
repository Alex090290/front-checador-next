"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Nav } from "react-bootstrap";

function TopNavItems() {
  const { data: session } = useSession();
  return (
    <Nav className="flex-column" defaultActiveKey="/app/users" variant="pills">
      <Nav.Item>
        <Nav.Link as={Link} href="/app">
          <i className="bi bi-speedometer me-1"></i>
          <span>Dashboard</span>
        </Nav.Link>
      </Nav.Item>
      {session?.user?.role === "SUPER_ADMIN" && (
        <Nav.Link as={Link} href="/app/users?view_type=list&id=null">
          <i className="bi bi-people-fill me-1"></i>
          <span>Usuarios</span>
        </Nav.Link>
      )}
      <Nav.Link
        eventKey="/app/employee"
        as={Link}
        href="/app/employee?view_type=list&id=null"
      >
        <i className="bi bi-person-bounding-box me-1"></i>
        <span>Empleados</span>
      </Nav.Link>
      <Nav.Link
        eventKey="/app/companies"
        as={Link}
        href="/app/branches?view_type=list&id=null"
      >
        <i className="bi bi-building me-1"></i>
        <span>Sucursales</span>
      </Nav.Link>
      <Nav.Link
        eventKey="/app/departments"
        as={Link}
        href="/app/departments?view_type=list&id=null"
      >
        <i className="bi bi-columns-gap me-1"></i>
        <span>Departamentos</span>
      </Nav.Link>
      <Nav.Link
        eventKey="/app/eventos"
        as={Link}
        href="/app/eventos?view_type=list&id=null"
      >
        <i className="bi bi-list-columns-reverse me-1"></i>
        <span>Checador</span>
      </Nav.Link>
    </Nav>
  );
}

export default TopNavItems;
