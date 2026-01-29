"use client";

import { ProgressBar, Spinner } from "react-bootstrap";

export default function LoadingProgressBar({
  message = "Cargando...",
}: {
  message?: string;
}) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex: 2000,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      aria-busy="true"
      aria-live="polite"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-body rounded-3 shadow px-4 py-3">
        <div className="fw-semibold text-muted mb-2">{message}</div>
        <div style={{ width: 320 }}>
          <ProgressBar animated striped now={80} variant="primary" />
        </div>
      </div>
    </div>
  );
}
