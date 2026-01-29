"use client";

import React, { useEffect } from "react";

type ModalProps = {
  onClose?: () => void;
  children: React.ReactNode;
  locked?: boolean;
  closeOnEsc?: boolean;
  zIndex?: number;
};

export default function Modal({
  onClose,
  children,
  locked = false,
  closeOnEsc = true,
  zIndex = 2000,
}: ModalProps) {
  const handleClose = () => {
    if (locked) return;
    onClose?.();
  };

  // ✅ lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ✅ cerrar con ESC
  useEffect(() => {
    if (!closeOnEsc) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOnEsc, locked]);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        zIndex,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // ✅ click afuera
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-100 px-3" style={{ maxWidth: 900, maxHeight: "90vh" }}>
        <div
          className="bg-body rounded-3 shadow"
          style={{ maxHeight: "90vh", overflow: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
