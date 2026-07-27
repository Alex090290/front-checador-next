// components/feedback/ErrorOverlay.tsx
"use client";

import { useEffect, useState, MouseEvent } from "react";

export default function ErrorOverlay({
  message = "Ocurrió un error",
  onDone,
  duration = 2500,
}: {
  message?: string;
  onDone?: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  const blockEvent = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  if (!visible) return null;

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
      aria-live="assertive"
      role="alertdialog"
      aria-modal="true"
      onClick={blockEvent}
      onMouseDown={blockEvent}
      onMouseUp={blockEvent}
    >
      <div
        className="bg-body rounded-3 shadow px-4 py-4 d-flex flex-column align-items-center gap-3"
        style={{ minWidth: 220 }}
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
      >
        {/* Círculo con X animada */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--bs-danger-bg-subtle)",
            border: "3px solid var(--bs-danger-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
          >
            <line
              x1="10" y1="10" x2="26" y2="26"
              stroke="var(--bs-danger)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                strokeDasharray: 25,
                strokeDashoffset: 25,
                animation: "drawLine 0.3s ease 0.15s forwards",
              }}
            />
            <line
              x1="26" y1="10" x2="10" y2="26"
              stroke="var(--bs-danger)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                strokeDasharray: 25,
                strokeDashoffset: 25,
                animation: "drawLine 0.3s ease 0.3s forwards",
              }}
            />
          </svg>
        </div>

        <div className="fw-semibold text-danger text-center">{message}</div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}