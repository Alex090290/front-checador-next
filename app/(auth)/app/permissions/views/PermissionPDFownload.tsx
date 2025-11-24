"use client";
import { fetchPermissionPDF } from "@/app/actions/permissions-actions";
import { useModals } from "@/context/ModalContext";
import { useState } from "react";
import { Modal } from "react-bootstrap";

interface PermissionPDFDownloadProps {
  show: boolean;
  onHide: () => void;
  id: string | null;
}

function PermissionPDFownload({
  show,
  onHide,
  id,
}: PermissionPDFDownloadProps) {
  const { modalError } = useModals();

  const [pdfBase64Url, setPdfBase64Url] = useState<string | undefined>(
    undefined
  );

  const fetchPDF = async () => {
    const res = await fetchPermissionPDF({ id });

    if (!res.success) return modalError(res.message);

    setPdfBase64Url(res.data);
  };

  const handleEntered = () => {
    fetchPDF();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      onEntered={handleEntered}
    >
      <Modal.Body style={{ padding: 0, height: "90vh" }}>
        <iframe src={pdfBase64Url} width="100%" height="100%" title="Permiso" />
      </Modal.Body>
    </Modal>
  );
}

export default PermissionPDFownload;
