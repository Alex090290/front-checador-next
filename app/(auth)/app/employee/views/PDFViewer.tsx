"use client";

import { Modal } from "react-bootstrap";

interface PdfViewerModalProps {
  show: boolean;
  onHide: () => void;
  pdfBase64Url: string;
}

function PDFViewerModal({ show, onHide, pdfBase64Url }: PdfViewerModalProps) {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body style={{ padding: 0, height: "80vh" }}>
        <iframe
          src={pdfBase64Url}
          width="100%"
          height="100%"
          style={{ border: "none" }}
          title="PDF Viewer"
        />
      </Modal.Body>
    </Modal>
  );
}

export default PDFViewerModal;
