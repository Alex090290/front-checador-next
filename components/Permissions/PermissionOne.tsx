"use client";

import { useMemo, useState } from "react";
import { IPermissionRequest } from "@/lib/definitions";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import { formatDate } from "date-fns";

import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { FormBook, FormPage } from "../templates/FormView";
import SignaturesView from "@/app/(auth)/app/permissions/views/SignaturesView";
import ApproveLeaderModal from "@/app/(auth)/app/permissions/views/ApproveLeaderModal";
import SignatureDohModal from "@/app/(auth)/app/permissions/views/SignatureDohModal";
import EmployeeSignatureModal from "@/app/(auth)/app/permissions/views/EmployeeSignatureModal";
import PermissionPDFownload from "@/app/(auth)/app/permissions/views/PermissionPDFownload";

function fullName(p?: { name?: string; lastName?: string } | null) {
  if (!p) return "—";
  return `${p.lastName ?? ""} ${p.name ?? ""}`.trim().toUpperCase();
}

function statusLabel(status?: string | null) {
  switch ((status ?? "").toUpperCase()) {
    case "APPROVED":
      return "APROBADO";
    case "PENDING":
      return "PENDIENTE";
    case "REFUSED":
      return "RECHAZADO";
    default:
      return status ? status.toUpperCase() : "—";
  }
}

function statusVariant(status?: string | null) {
  switch ((status ?? "").toUpperCase()) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REFUSED":
      return "danger";
    default:
      return "secondary";
  }
}

function safeDate(date?: string | Date | null, fmt = "dd/MM/yyyy") {
  if (!date) return "—";
  try {
    return formatDate(new Date(date), fmt);
  } catch {
    return "—";
  }
}

export default function ShowInfoPermissionRequest({
  permission,
  id,
}: {
  permission: IPermissionRequest | null;
  id: string;
}) {
  const session = useSessionSnapshot();

  const [approveModal, setApproveModal] = useState(false);
  const [signatureModal, setSignatureModal] = useState(false);
  const [employeeSignatureModal, setEmployeeSignatureModal] = useState(false);
  const [permissionPDFModal, setPermissionPDFModal] = useState(false);

  const signatures = Array.isArray(permission?.signatures)
    ? permission!.signatures
    : [];

  const getSignatureEmployee = () => {
    const sign = permission?.signatures?.filter(
      (f) => f.idSignatory === Number(session?.uid?.idEmployee)
    )?.[0];

    return sign?.url !== "";
  };

  const showLeaderApprove =
    permission?.leader.id === Number(session?.uid?.idEmployee) &&
    permission.leaderApproval !== "APPROVED";

  const showDohApprove =
    session?.uid?.idEmployee === permission?.personDoh.id &&
    permission?.dohApproval !== "APPROVED";

  const showEmployeeSign =
    session?.uid?.idEmployee === permission?.employee.id &&
    !getSignatureEmployee();

  const showAnyActions = useMemo(() => {
    return showLeaderApprove || showDohApprove || showEmployeeSign || true;
  }, [showLeaderApprove, showDohApprove, showEmployeeSign]);

  if (!permission) {
    return (
      <Card className="border-0">
        <Card.Body className="py-3">
          <div className="text-muted">
            Selecciona una solicitud para ver el detalle.
          </div>
        </Card.Body>
      </Card>
    );
  }

  const overallStatus = permission.status ?? "PENDING";
  const createdAt = safeDate(permission.createdAt, "dd/MM/yyyy HH:mm");

  const handleApprove = () => setApproveModal(true);
  const handleSignatureDoh = () => setSignatureModal(true);
  const handleEmployeeSignature = () => setEmployeeSignatureModal(true);
  const handleDownloadPDF = () => setPermissionPDFModal(true);

  return (
    <>
    
      <Card className="border-0 h-100">
        <Card.Body className="p-3 p-md-4">
          <Container fluid className="px-0">
            {/* Header */}
            <Row className="g-3 align-items-start align-items-md-center">
              <Col xs={12} md={8}>
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <h5 className="m-0 fw-bold text-uppercase">
                    Solicitud #{permission.id}
                  </h5>

                  <Badge bg={statusVariant(overallStatus)}>
                    {statusLabel(overallStatus)}
                  </Badge>
                </div>

                <div className="text-muted mt-2">
                  <div className="text-uppercase fw-semibold">
                    {permission.type ?? "PERMISO"}
                  </div>
                  <div className="small">Creada: {createdAt}</div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <Card className="border-0 table-active">
                  <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small text-uppercase">
                        Vigencia
                      </div>
                      <div className="fw-semibold text-uppercase">
                        {safeDate(permission.dateInit)} -{" "}
                        {safeDate(permission.dateEnd)}
                      </div>
                    </div>

                    {showAnyActions && (
                      <div className="d-flex justify-content-end gap-2 flex-wrap mt-2">
                        {showLeaderApprove && (
                          <Button
                            size="sm"
                            variant="warning"
                            className="fw-semibold"
                            onClick={handleApprove}
                          >
                            Aprobar
                          </Button>
                        )}

                        {showDohApprove && (
                          <Button
                            size="sm"
                            variant="success"
                            className="fw-semibold"
                            onClick={handleSignatureDoh}
                          >
                            Aprobar
                          </Button>
                        )}

                        {showEmployeeSign && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="fw-semibold"
                            onClick={handleEmployeeSignature}
                          >
                            Firmar
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="primary"
                          className="fw-semibold"
                          onClick={handleDownloadPDF}
                        >
                          <i className="bi bi-filetype-pdf me-2" />
                          Descargar
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Main info */}
            <Row className="g-3 mt-1">
              <Col xs={12} lg={8}>
                <Card className="border-0">
                  <Card.Body className="p-0">
                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="text-muted small text-uppercase">
                              Empleado
                            </div>
                            <div className="fw-semibold">
                              {fullName(permission.employee)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="text-muted small text-uppercase">
                              Creada por
                            </div>
                            <div className="fw-semibold">
                              {fullName(permission.createForPerson)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="text-muted small text-uppercase">
                              Líder
                            </div>
                            <div className="fw-semibold">
                              {fullName(permission.leader)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="text-muted small text-uppercase">
                              D.O.H.
                            </div>
                            <div className="fw-semibold">
                              {fullName(permission.personDoh)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12}>
                        <Card className="border-0 table-active">
                          <Card.Body className="py-3 px-3">
                            <Row className="g-3">
                              <Col xs={12} md={4}>
                                <div className="text-muted small text-uppercase">
                                  Tipo
                                </div>
                                <div className="fw-semibold text-uppercase">
                                  {permission.type ?? "—"}
                                </div>
                              </Col>

                              <Col xs={12} md={8}>
                                <div className="text-muted small text-uppercase">
                                  Motivo
                                </div>
                                <div className="fw-semibold">
                                  {permission.motive ?? "—"}
                                </div>
                              </Col>

                              <Col xs={12} md={6}>
                                <div className="text-muted small text-uppercase">
                                  Fecha inicio / fin
                                </div>
                                <div className="fw-semibold">
                                  {safeDate(permission.dateInit)} -{" "}
                                  {safeDate(permission.dateEnd)}
                                </div>
                              </Col>

                              <Col xs={12} md={6}>
                                <div className="text-muted small text-uppercase">
                                  Hora inicio / fin
                                </div>
                                <div className="fw-semibold">
                                  {permission.hourInt ?? "—"} -{" "}
                                  {permission.hourEnd ?? "—"}
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Firmas */}
            <FormBook dKey="signatures">
              {signatures.length > 0 && (
                <FormPage title="Firmas" eventKey="signatures">
                  <Container>
                    <Row className="g-2 py-2">
                      {signatures.map((sign) => (
                        <SignaturesView
                          key={sign._id}
                          idPermission={String(permission.id)}
                          idEmployee={String(sign.idSignatory)}
                          name={sign.name}
                          dateApproved={sign.dateApproved}
                          status={sign.status}
                          dateApprove={permission.dateApprove}
                          dateApproveDoh={permission.dateApproveDoh}
                        />
                      ))}
                    </Row>
                  </Container>
                </FormPage>
              )}
            </FormBook>
          </Container>
        </Card.Body>
      </Card>

      {/* Modales */}
      <ApproveLeaderModal
        show={approveModal}
        onHide={() => setApproveModal(false)}
        id={id}
      />

      <SignatureDohModal
        show={signatureModal}
        onHide={() => setSignatureModal(false)}
        id={id}
      />

      <EmployeeSignatureModal
        show={employeeSignatureModal}
        onHide={() => setEmployeeSignatureModal(false)}
        id={id}
      />

      <PermissionPDFownload
        id={id}
        show={permissionPDFModal}
        onHide={() => setPermissionPDFModal(false)}
      />
    </>
  );
}
