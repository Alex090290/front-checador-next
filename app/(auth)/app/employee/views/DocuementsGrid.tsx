import { Button, Card, Col, Spinner } from "react-bootstrap";
import { useRef, useState } from "react";
import {
  createDocument,
  getViewDocument,
} from "@/app/actions/documents-actions";
import toast from "react-hot-toast";
import { useModals } from "@/context/ModalContext";
import PDFViewerModal from "./PDFViewer";
import { IPeriodDocument } from "@/lib/definitions";

function DocumentsGrid({
  doc,
  idEmployee,
}: {
  doc: IPeriodDocument;
  idEmployee: number;
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
    setLoading(true);
    const toastId = toast.loading("Subiendo archivo...");
    if (selectedFiles.length > 0) {
      const formData = new FormData();

      // Agregar cada archivo al FormData
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      //   onFilesChange(formData);

      const res = await createDocument({
        formData,
        idEmployee,
        idDocument: doc.id,
        idPeriod: doc.idPeriod,
      });

      if (!res.success) return modalError(res.message);

      toast.success(res.message, { id: toastId });

      // Opcional: resetear el estado después de subir
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setLoading(false);
  };

  const handleGetDocument = async () => {
    const res = await getViewDocument({
      idDocument: doc.id,
      idEmployee,
      idPeriod: doc.idPeriod,
    });
    if (!res.success) return modalError(res.message);
    setPdfUrl(res.data || "");
    setShowPdfModal(true);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Col md="3">
        <Card
          className="rounded shadow-sm bg-body-tertiary"
          style={{ height: "200px" }}
        >
          <Card.Header className="py-2">
            <Card.Title
              className="text-center text-uppercase mb-0"
              style={{ fontSize: "0.9rem" }}
            >
              {doc.titleView}
            </Card.Title>
          </Card.Header>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "200px" }}
            >
              <Spinner animation="border" />
            </div>
          ) : (
            <Card.Body className="p-2 d-flex flex-column justify-content-between">
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
              <div className="d-flex flex-column gap-1">
                {selectedFiles.length === 0 ? (
                  <>
                    <Button onClick={handleButtonClick}>
                      {doc.exist ? "Reemplazar" : "Cargar"}
                    </Button>
                    {doc.exist && (
                      <Button variant="warning" onClick={handleGetDocument}>
                        Visualizar
                      </Button>
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
        </Card>
      </Col>
      <PDFViewerModal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        pdfBase64Url={pdfUrl}
      />
    </>
  );
}

export default DocumentsGrid;
