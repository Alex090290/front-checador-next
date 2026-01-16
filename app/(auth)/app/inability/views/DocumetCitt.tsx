"use client";

import { useModals } from "@/context/ModalContext";
import { IInability } from "@/lib/definitions";
import { useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  DropdownButton,
  ProgressBar,
} from "react-bootstrap";
import toast from "react-hot-toast";
import PDFViewerModal from "../../employee/views/PDFViewer";
import { getViewSTDocument, uploadST } from "@/app/actions/st-actions";

function DocumetCitt({
  documetCitt,
  idDoc,
}: {
  documetCitt: IInability["documetCitt"] | undefined;
  idDoc: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { modalError } = useModals();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      setSelectedFiles(filesArray);

      // No llamamos a onFilesChange inmediatamente, esperamos a que el usuario haga clic en "Subir"
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      setLoading(true);
      const toastId = toast.loading("Subiendo archivo...");
      const formData = new FormData();

      // Agregar cada archivo al FormData
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await uploadST({
        formData,
        idDoc,
        version: "documetCitt",
      });

      if (!res.success) {
        setLoading(false);
        toast.error(res.message, { id: toastId });
        return modalError(res.message);
      }

      toast.success(res.message, { id: toastId });

      // Opcional: resetear el estado después de subir
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setLoading(false);
    }
  };

  const handleGetDocument = async () => {
    setLoading(true);
    const res = await getViewSTDocument({
      idDoc,
      version: "documetCitt",
    });
    if (!res.success) {
      setLoading(false);
      return modalError(res.message);
    }
    setPdfUrl(res.data || "");
    setShowPdfModal(true);
    setLoading(false);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Col md="2">
      <Card className="rounded shadow-sm bg-body-tertiary">
        <Card.Header className="d-flex justify-content-between align-items-end">
          <Card.Title
            className="text-center text-uppercase mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            CITT
          </Card.Title>
          {/* <DropdownButton
            size="sm"
            variant="info"
            title={<i className="bi bi-gear-fill"></i>}
          >
            <Dropdown.Item>
              <i className="bi bi-calendar-minus me-1"></i>
              Fecha de expiración
            </Dropdown.Item>
          </DropdownButton> */}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div
              className="text-center h-100 align-content-center"
              style={{ height: "200px" }}
            >
              <ProgressBar variant="primary" striped now={100} animated />
            </div>
          ) : (
            <Card.Body>
              {/* Input file oculto */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.webp"
                multiple
                style={{ display: "none" }}
              />

              {/* Información de archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="mb-2">
                  <small className="text-muted">
                    {selectedFiles.length} archivo(s) seleccionado(s)
                  </small>
                  {selectedFiles.slice(0, 2).map((file, index) => (
                    <div key={index} className="small text-truncate">
                      {file.name}
                    </div>
                  ))}
                  {selectedFiles.length > 2 && (
                    <div className="small text-muted">
                      +{selectedFiles.length - 2} más
                    </div>
                  )}
                </div>
              )}

              {/* Botones condicionales */}
              <div className="d-flex flex-column justify-content-center gap-1">
                {selectedFiles.length === 0 ? (
                  <>
                    <Button onClick={handleButtonClick}>
                      {documetCitt?.urlDocument ? "Reemplazar" : "Cargar"}
                    </Button>
                    {documetCitt?.urlDocument && (
                      <>
                        <Button variant="warning" onClick={handleGetDocument}>
                          Visualizar
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="success" onClick={handleUpload}>
                      Subir
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          )}
        </Card.Body>
      </Card>
      <PDFViewerModal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        pdfBase64Url={pdfUrl}
      />
    </Col>
  );
}

export default DocumetCitt;
