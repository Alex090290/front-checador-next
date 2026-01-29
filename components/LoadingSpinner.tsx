"use client";

import { ProgressBar, Spinner } from "react-bootstrap";

export default function Loading({
  message = "Cargando...",
}: {
  message?: string;
}) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 2000,
        background: "rgba(0,0,0,0.25)", // oscurece
        backdropFilter: "blur(6px)",    // difumina (blur)
        WebkitBackdropFilter: "blur(6px)", // safari
      }}
      aria-busy="true"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-body rounded-3 shadow px-4 py-3 d-flex align-items-center gap-3">
        <Spinner animation="border" variant="primary" role="status" />
        <div className="fw-semibold text-muted">{message}</div>
      </div>
    </div>
  );
}
