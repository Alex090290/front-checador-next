"use client";

import { Container, Nav, Navbar } from "react-bootstrap";
import NavUserInfo from "./NavUserInfo";
import { useSession } from "next-auth/react";
import TopNavItems from "./TopNavItems";
import Link from "next/link";
import OverLay from "../templates/OverLay";

function TopNav() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
        <Container>
          <Navbar.Brand as={Link} href="/app/checador?view_type=form">
            <OverLay string="Checador">
              <i className="bi bi-clock"></i>
            </OverLay>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              {userRole !== "CHECADOR" && userRole !== "EMPLOYEE" && (
                <TopNavItems />
              )}
            </Nav>
            <Nav>
              <NavUserInfo />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default TopNav;
