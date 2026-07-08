"use client";

import { ActionResponse, Employee, IInability } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import ST7V1Card from "@/app/(auth)/app/inability/views/ST7V1Card";
import ST7V2Card from "@/app/(auth)/app/inability/views/ST7V2Card";
import ST2Card from "@/app/(auth)/app/inability/views/ST2Card";
import ModalAddDocuments from "@/app/(auth)/app/inability/views/ModalUploadDocuments";
import InhabilityDocCard from "@/app/(auth)/app/inability/views/InhabilityDocumentCard";
import ModalBlur from "@/components/ModalBlur";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import FormUpdateInability from "./inabilityFormUpdate";
import { deleteInability, updateInability } from "@/app/actions/inability-actions";
import toast from "react-hot-toast";
import { useModals } from "@/context/ModalContext";
import OverLay from "../templates/OverLay";

type TInputs = {
  idEmployee: number | null;
  disabilityCategory: string;
  folio: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

function fullName(p?: { name?: string; lastName?: string } | null) {
  if (!p) return "—";
  return `${p.lastName ?? ""} ${p.name ?? ""}`.trim().toUpperCase();
}

function formatText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatDateValue(value?: string | Date | null, pattern = "dd/MM/yyyy") {
  if (!value) return "-";

  try {
    return formatDate(new Date(value), pattern);
  } catch {
    return String(value);
  }
}


export default function InfoOneInability({
  inhability,
  employees = [],
  id,
}: {
  inhability: IInability | null;
  employees?: Employee[];
  id: string;
}) {
  const [modalUploadDoc, setModalUploadDoc] = useState(false);
  const [showUpdateInabilityModal, setShowUpdateInabilityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  if (!inhability) {
    return (
      <div className="py-4">
        <h4 className="mb-0">Incapacidad no encontrada</h4>
      </div>
    );
  }

  const employee =
    employees.find((em) => Number(em.id) === Number(inhability.idEmployee)) ??
    inhability.employee;



  const firstDocument = inhability.documentsInability?.[0];
  const createdAt = formatDateValue(inhability?.createdAt ?? "dd/MM/yyyy HH:mm");

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/inability/create");
  };

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando datos...");
    router.push("/app/inability");
  }

  const handleDeleteInability = async () => {
        if (!inhability?.id) {
            modalError("No se encontró el registro");
            return;
        }

        modalConfirm("¿Deseas eliminar este registro?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Eliminando registro...");

                const res = await deleteInability({ id: Number(inhability.id) });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/inability");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

  const handleUpdateInability = async (
    data: TInputs
  ): Promise<ActionResponse<boolean | null>> => {
    if (!inhability?.id) {
      return {
        success: false,
        message: "No se encontró la incapacidad",
        data: null,
      };
    }

    const res = await updateInability(Number(inhability.id), data);

    if (!res.success) {
      modalError(res.message);
      return {
        success: false,
        message: res.message,
        data: null,
      };
    }

    toast.success(res.message);

    return {
      success: true,
      message: res.message,
      data: true,
    };
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Cargando..."} />
      </ConditionalRender>

      <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

        {/* Header con acciones */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex gap-2 flex-wrap">

            <OverLay string="Crear incapacidad">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="primary"
                onClick={handleCreate}
                disabled={loading}
              >
                <i className="bi bi-plus-lg" />
                <span className="d-none d-md-inline ms-2">
                  Crear Incapacidad
                </span>
              </Button>
            </OverLay>

            <ConditionalRender cond={id !== "null"}>
              <OverLay string="Actualizar incapacidad">
                <Button
                  className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                  variant="primary"
                  onClick={() => setShowUpdateInabilityModal(true)}
                  disabled={loading}
                >
                  <i className="bi bi-pencil" />
                  <span className="d-none d-md-inline ms-2">
                    Actualizar Incapacidad
                  </span>
                </Button>
              </OverLay>
            </ConditionalRender>

            <OverLay string="Eliminar registro">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="danger"
                onClick={handleDeleteInability}
                disabled={loading}
              >
                <i className="bi bi-trash" />

                <span className="d-none d-md-inline ms-2">
                  Eliminar incapacidad
                </span>
              </Button>
            </OverLay>
          </div>

          <div className=" d-md-flex flex-wrap">
            <Button
              variant="outline-secondary"
              onClick={handleBack}
              disabled={loading}
              className="d-inline-flex align-items-center gap-2 fw-semibold px-2 px-md-3"
            >
              <i className="bi bi-arrow-left" />
              Regresar
            </Button>
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="mb-1 ms-1 text-uppercase">{employee
            ? `${employee.lastName ?? ""} ${employee.name ?? ""}`.trim()
            : "-"}
          </h1>
          <p className="text-muted mb-0 ms-1">
            Información de la incapacidad registrada.
          </p>
        </div>

        <Card className="border shadow-sm rounded-4 mt-2">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h5 className="mb-1 fw-bold">
                  Solicitud #{id !== "null" ? id : "—"}
                </h5>
                <p className="text-muted mb-0">
                  INCAPACIDAD
                </p>
              </div>

              <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle text-uppercase">
                {formatText(inhability.status)}
              </span>
            </div>

            <Row className="g-4 mb-4">
              {/* RESUMEN */}
              <Col xs={12} lg={4}>
                <Card className="border rounded-4 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h6 className="mb-0 fw-bold">Resumen</h6>
                      <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        General
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-calendar-plus text-primary" />
                          <span className="text-muted">Creada</span>
                        </div>
                        <span className="fw-semibold text-end">
                          {createdAt}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person text-success" />
                          <span className="text-muted">Creada por</span>
                        </div>

                        <span className="fw-semibold text-end text-uppercase">
                          {fullName(inhability.createForPerson)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-folder2 text-primary" />
                          <span className="text-muted">Categoría</span>
                        </div>
                        <span className="fw-semibold text-end text-uppercase">
                          {formatText(inhability.disabilityCategory)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-tag text-warning" />
                          <span className="text-muted">Tipo</span>
                        </div>
                        <span className="fw-semibold text-end text-uppercase">
                          {formatText(inhability.typeOfDisability)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-check-circle text-info" />
                          <span className="text-muted">Estatus</span>
                        </div>
                        <span className="fw-semibold text-end">
                          {formatText(inhability.status)}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* DETALLES */}
              <Col xs={12} lg={8}>
                <Card className="border rounded-4 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h6 className="mb-1 fw-bold">Detalles del registro</h6>
                        <p className="text-muted mb-0 small">
                          Consulta las fechas y el folio de la incapacidad.
                        </p>
                      </div>
                      <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Registro
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-4">
                      <div className="border rounded-3 p-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-upc-scan text-primary" />
                          <span className="text-muted fw-semibold">
                            Folio CITT
                          </span>
                        </div>
                        <div className="text-uppercase">
                          {formatText(inhability.folio || firstDocument?.folio)}
                        </div>
                      </div>

                      <Row className="g-3">
                        <Col xs={12} md={6} xl={3}>
                          <div className="border rounded-3 p-3 text-center h-100">
                            <i className="bi bi-calendar-event text-success fs-5 mb-2 d-block" />
                            <div className="text-muted small">Fecha inicio</div>
                            <div className="fw-semibold">
                              {formatDateValue(firstDocument?.dateInit, "yyyy-MM-dd")}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6} xl={3}>
                          <div className="border rounded-3 p-3 text-center h-100">
                            <i className="bi bi-calendar-x text-danger fs-5 mb-2 d-block" />
                            <div className="text-muted small">Fecha fin</div>
                            <div className="fw-semibold">
                              {formatDateValue(firstDocument?.dateEnd, "yyyy-MM-dd")}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6} xl={3}>
                          <div className="border rounded-3 p-3 text-center h-100">
                            <i className="bi bi-folder2-open text-warning fs-5 mb-2 d-block" />
                            <div className="text-muted small">Categoría</div>
                            <div className="fw-semibold text-uppercase">
                              {formatText(inhability.disabilityCategory)}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12} md={6} xl={3}>
                          <div className="border rounded-3 p-3 text-center h-100">
                            <i className="bi bi-tag-fill text-info fs-5 mb-2 d-block" />
                            <div className="text-muted small">Tipo</div>
                            <div className="fw-semibold text-uppercase">
                              {formatText(inhability.typeOfDisability)}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* FORMATOS */}
            <ConditionalRender cond={id !== "null"}>
              <Card className="border rounded-4 mb-4">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0 fw-bold">Formatos</h6>
                    <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                      CITT
                    </span>
                  </div>

                  <Row className="g-3">
                    <ST7V1Card
                      st2v1Doc={inhability?.sT7FillingDocumentv1}
                      idDoc={id}
                    />
                    <ST7V2Card
                      st2v2Doc={inhability?.sT7FillingDocumentv2}
                      idDoc={id}
                    />
                    <ST2Card
                      st2Doc={inhability?.sT2DischargeDocument}
                      idDoc={id}
                    />
                  </Row>
                </Card.Body>
              </Card>
            </ConditionalRender>

            {/* DOCUMENTOS CITT */}
            <ConditionalRender cond={id !== "null" && inhability?.documentsInability?.length > 0}>
              <Card className="border rounded-4">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0 fw-bold">Documentos CITT</h6>
                    <Button
                      onClick={() => setModalUploadDoc(!modalUploadDoc)}
                      variant="success"
                    >
                      <i className="bi bi-plus-lg me-2" />
                      Nuevo documento CITT
                    </Button>
                  </div>

                  <Row className="g-2">
                    {inhability?.documentsInability?.map((doc) => (
                      <InhabilityDocCard
                        key={doc.id}
                        selfId={String(doc.id)}
                        idDoc={id}
                        urlDocument={doc.urlDocument}
                        dateInit={doc.dateInit}
                        dateEnd={doc.dateEnd}
                        folio={doc.folio}
                      />
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </ConditionalRender>
          </Card.Body>
        </Card>
      </Container>

      <ConditionalRender cond={showUpdateInabilityModal}>
        <ModalBlur onClose={() => setShowUpdateInabilityModal(false)}>
          <FormUpdateInability
            show={showUpdateInabilityModal}
            onHide={() => setShowUpdateInabilityModal(false)}
            sendData={handleUpdateInability}
            inhability={inhability}
            employees={employees}
          />
        </ModalBlur>
      </ConditionalRender>

      <ConditionalRender cond={modalUploadDoc}>
        <ModalBlur onClose={() => setModalUploadDoc(false)}>
          <ModalAddDocuments
            onHide={() => setModalUploadDoc(false)}
            idDoc={id}
          />
        </ModalBlur>
      </ConditionalRender>
    </>
  );
}