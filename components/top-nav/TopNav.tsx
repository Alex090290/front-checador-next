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
    <Navbar
      expand="lg"
      className="bg-body-tertiary shadow-sm w-100"
      sticky="top"
    >
      <Container fluid className="px-2 px-md-3">
        {userRole !== "EMPLOYEE" && (
          <Navbar.Brand
            as={Link}
            href="/app/checador?view_type=form"
            className=" flex-shrink-0 ms-5"
          >
            <OverLay string="Checador">
              <i className="bi bi-clock"></i>
            </OverLay>
          </Navbar.Brand>
        )}

        <Nav className="ms-auto flex-row align-items-center min-w-0">
          <Suspense fallback={<div>Loading user info...</div>}>
            <NavUserInfo />
          </Suspense>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopNav;
