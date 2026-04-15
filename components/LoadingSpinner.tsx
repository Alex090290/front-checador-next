"use client";

import { MouseEvent } from "react";
import { Spinner } from "react-bootstrap";

export default function Loading({
  message = "Cargando...",
}: {
  message?: string;
}) {
  const blockEvent = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 2000,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        pointerEvents: "auto",
      }}
      aria-busy="true"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
      onClick={blockEvent}
      onMouseDown={blockEvent}
      onMouseUp={blockEvent}
    >
      <div
        className="bg-body rounded-3 shadow px-4 py-3 d-flex align-items-center gap-3"
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
      >
        <Spinner animation="border" variant="primary" role="status" />
        <div className="fw-semibold text-muted">{message}</div>
      </div>
    </div>
  );
}