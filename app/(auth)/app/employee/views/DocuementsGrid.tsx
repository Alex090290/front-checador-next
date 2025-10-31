import {
  Button,
  Card,
  Col,
  Dropdown,
  DropdownButton,
  ProgressBar,
} from "react-bootstrap";
import { useRef, useState } from "react";
import {
  createDocument,
  getViewDocument,
} from "@/app/actions/documents-actions";
import toast from "react-hot-toast";
import { useModals } from "@/context/ModalContext";
import PDFViewerModal from "./PDFViewer";
import { IPeriodDocument } from "@/lib/definitions";
import ModalExpirationDate from "./ModalExpirationDate";
import { formatDate } from "date-fns";

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
  const [modalExpirationDate, setModalExpirationDate] = useState(false);

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
      setLoading(false);
    }
  };

  const handleGetDocument = async () => {
    setLoading(true);
    const res = await getViewDocument({
      idDocument: doc.id,
      idEmployee,
      idPeriod: doc.idPeriod,
    });
    if (!res.success) return modalError(res.message);
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
    <>
      <Col md="3">
        <Card
          className="rounded shadow-sm bg-body-tertiary"
          style={{ height: "200px" }}
        >
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ height: "50px" }}
          >
            <Card.Title
              className="text-center text-uppercase mb-0"
              style={{ fontSize: "0.9rem" }}
            >
              {doc.titleView}
            </Card.Title>
            {doc.exist && (
              <DropdownButton
                size="sm"
                variant="info"
                title={<i className="bi bi-gear-fill"></i>}
              >
                <Dropdown.Item
                  as={Button}
                  onClick={() => setModalExpirationDate(!modalExpirationDate)}
                >
                  <i className="bi bi-calendar-minus me-1"></i>
                  Fecha de expiración
                </Dropdown.Item>
              </DropdownButton>
            )}
          </Card.Header>
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
                      {doc.exist ? "Reemplazar" : "Cargar"}
                    </Button>
                    {doc.exist && (
                      <>
                        <Button variant="warning" onClick={handleGetDocument}>
                          Visualizar
                        </Button>
                        {doc.dateExpiration && (
                          <div
                            className="fw-semibold text-center"
                            style={{ fontSize: "0.9rem" }}
                          >
                            Expira:{" "}
                            {formatDate(doc.dateExpiration, "dd/MM/yyyy")}
                          </div>
                        )}
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
        </Card>
      </Col>
      <PDFViewerModal
        show={showPdfModal}
        onHide={() => setShowPdfModal(false)}
        pdfBase64Url={pdfUrl}
      />
      <ModalExpirationDate
        show={modalExpirationDate}
        onHide={() => setModalExpirationDate(!modalExpirationDate)}
        idPeriod={doc.idPeriod}
        idDocument={doc.id}
        idEmpleado={idEmployee}
        title={doc.titleView}
      />
    </>
  );
}

export default DocumentsGrid;
