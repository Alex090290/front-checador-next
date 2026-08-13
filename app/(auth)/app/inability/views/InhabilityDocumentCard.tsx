"use client";

import { useModals } from "@/context/ModalContext";
import { useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  DropdownButton,
  ProgressBar,
} from "react-bootstrap";
import PDFViewerModal from "../../employee/views/PDFViewer";
import {
  getInhabilityDocument,
  updateInabilityModal,
} from "@/app/actions/inability-actions";
import { formatDate } from "date-fns";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import ErrorOverlay from "@/components/ErrorOverlay";
import ModalBlur from "@/components/ModalBlur";
import FormUpdateDocumenstInhability from "@/components/inability/FormUpdateDocumenstInhability";
import { IdocumentsInability } from "@/lib/inhability/interface";
import { formatCreatedAt } from "@/lib/helpers";


type FeedbackState = "loading" | "success" | "error" | null;

function InhabilityDocCard({
  doc,
  selfId,
  idDoc,
  urlDocument,
  dateInit,
  dateEnd,
  folio,
  getData
}: {
  doc: IdocumentsInability;
  selfId: string | null;
  idDoc: string;
  urlDocument: string | null;
  dateInit: string;
  dateEnd: string;
  folio: string;
  getData?: () => void | Promise<void>;
}) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading] = useState(false);
  const { modalConfirm } = useModals();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const hasDocument = !!urlDocument;


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
  

  //SUBIR
  const handleUpload = async () => {
    modalConfirm("¿Deseas subir este archivo?", async () => {
      if (selectedFiles.length === 0) return;

      try {
        setFeedback("loading");
        setFeedbackMsg("Subiendo documento...");
        const formData = new FormData();

        // Agregar cada archivo al FormData
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const res = await updateInabilityModal({ formData, idDoc, selfId, folio });


        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo subir");
          setFeedback("error");
          return;
        }

        setFeedbackMsg("Archivo cargado correctamente");
        setFeedback("success");

        // Opcional: resetear el estado después de subir
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  const handleGetDocument = async () => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");

    const res = await getInhabilityDocument({ idDoc, selfId });

    if (!res.success) {
      setFeedbackMsg(res.message || "No se pudo subir");
      setFeedback("error");
    }

    setPdfUrl(res.data || "");
    setShowPdfModal(true);
    setFeedback(null)
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <Col xs={12} sm={6} md={4} xl={3}>
        <Card className="rounded shadow-sm bg-body-tertiary h-100">
          <Card.Header className="d-flex justify-content-end align-items-end">
            <DropdownButton
              size="sm"
              variant="secondary"
              title={<i className="bi bi-gear-fill"></i>}
            >
              <Dropdown.Item>
                <Button
                  type="button"
                  onClick={() => setShowUpdateModal(true)}>
                  <i className="bi bi-pencil me-1" />
                  Actualizar
                </Button>
              </Dropdown.Item>
            </DropdownButton>
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
                      <div className="mb-3 text-center">
                        <p className="mb-1">
                          <span className="fw-semibold">Folio: </span> 
                          {folio || "Sin folio"}
                        </p>
                        <p className="mb-0">
                          <span className="fw-semibold">Expira: </span>
                          {doc.expirationDateDocument ? formatCreatedAt(doc.expirationDateDocument) : "Sin fecha"}
                        </p>
                      </div>

                      <div className="d-flex flex-column align-items-center gap-2">
                        <Button
                          onClick={handleButtonClick}
                          variant={hasDocument ? "primary" : "success"}
                          style={{ width: "80%" }}
                        >
                          {hasDocument ? "Reemplazar" : "Cargar"}
                        </Button>

                        {hasDocument && (
                          <Button
                            variant="secondary"
                            onClick={handleGetDocument}
                            style={{ width: "80%" }}
                          >
                            Visualizar
                          </Button>
                        )}
                      </div>
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

          <Card.Footer>
            <div className="d-flex justify-content-center gap-2">
              <p>{formatDate(dateInit, "yyyy/MM/dd")}</p>
              <span> - </span>
              <p>{formatDate(dateEnd, "yyyy/MM/dd")}</p>
            </div>
          </Card.Footer>

        </Card>
        <PDFViewerModal
          show={showPdfModal}
          onHide={() => setShowPdfModal(false)}
          pdfBase64Url={pdfUrl}
        />
      </Col>

      <ConditionalRender cond={showUpdateModal}>
        <ModalBlur onClose={() => setShowUpdateModal(false)}>
          <FormUpdateDocumenstInhability
            doc={doc}
            show={showUpdateModal}
            onHide={() => setShowUpdateModal(false)}
            id={Number(idDoc)}
            selfId={Number(selfId)}
            getData={getData}
          />
        </ModalBlur>
      </ConditionalRender>
    </>
  );
}

export default InhabilityDocCard;
