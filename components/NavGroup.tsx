"use client";

import React, { useContext } from "react";
import { Accordion, AccordionContext, useAccordionButton, Nav } from "react-bootstrap";

type Props = {
  eventKey: string;
  iconClass: string;
  label: string;
};

export default function NavGroup({ eventKey, iconClass, label }: Props) {
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = Array.isArray(activeEventKey)
    ? activeEventKey.includes(eventKey)
    : activeEventKey === eventKey;

  const onClick = useAccordionButton(eventKey);

  return (
    <Nav.Link
      onClick={onClick}
      role="button"
      aria-expanded={isOpen}
      className="d-flex align-items-center justify-content-between nav-group-toggle"
    >
      <span className="d-flex align-items-center">
        <i className={iconClass}></i>
        <span>{label}</span>
      </span>

      <i className={`bi bi-chevron-down ms-2 chevron ${isOpen ? "open" : ""}`} />
    </Nav.Link>
  );
}
