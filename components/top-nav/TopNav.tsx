// components/layout/TopNav.tsx
"use client";

import { Container, Navbar, Nav } from "react-bootstrap";
import NavUserInfo from "../top-nav/NavUserInfo";
import Link from "next/link";
import OverLay from "../templates/OverLay";
import { Suspense } from "react";
import { useSession } from "next-auth/react";

function TopNav() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm" sticky="top">
      <Container>
        {userRole === "EMPLOYEE" ? null : (
          <Navbar.Brand as={Link} href="/app/checador?view_type=form">
            <OverLay string="Checador">
              <i className="bi bi-clock"></i>
            </OverLay>
          </Navbar.Brand>
        )}
        <Nav className="ms-auto">
          <Suspense fallback={<div>Loading user info...</div>}>
            <NavUserInfo />
          </Suspense>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopNav;
