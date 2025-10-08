"use client";

import { ModalBasicProps } from "@/lib/definitions";
import { Button, Modal } from "react-bootstrap";

function ErrorModal({ show, onHide, string }: ModalBasicProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      keyboard={false}
      backdrop="static"
      centered
      animation={false}
    >
      <Modal.Body>
        <Modal.Title>
          <i className="bi bi-exclamation-triangle text-warning me-2"></i>
          Error
        </Modal.Title>
        <p className="px-3 py-2">{string}</p>
        <Button onClick={onHide}>Cerrar</Button>
      </Modal.Body>
    </Modal>
  );
}

export default ErrorModal;
