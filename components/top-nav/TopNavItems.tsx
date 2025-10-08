"use client";

import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

function TopNavItems() {
  return (
    <NavDropdown
      title={
        <>
          <i className="bi bi-journal-album me-1"></i>
          <span>Catálogos</span>
        </>
      }
    >
      <NavDropdown.Item as={Link} href="/app/users?view_type=list&id=null">
        <i className="bi bi-people-fill me-1"></i>
        <span>Usuarios</span>
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} href="/app/employee?view_type=list&id=null">
        <i className="bi bi-person-bounding-box me-1"></i>
        <span>Empleados</span>
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} href="/app/companies?view_type=list&id=null">
        <i className="bi bi-building me-1"></i>
        <span>Sucursales</span>
      </NavDropdown.Item>
    </NavDropdown>
  );
}

export default TopNavItems;
