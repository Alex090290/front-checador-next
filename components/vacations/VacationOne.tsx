"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PeriodVacation, Vacations } from "@/lib/definitions";
import { Badge, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { formatDate } from "date-fns";

import SignaturesVacationView from "@/app/(auth)/app/vacations/views/SignaturesVacationView";
import { FormBook, FormPage } from "../templates/FormView";

import ApproveVacationLeaderModal from "@/app/(auth)/app/vacations/views/ApproveVacationLeaderModal";
import SignatureVacationDohModal from "@/app/(auth)/app/vacations/views/SignatureDohModal";
import VacationPDFownload from "@/app/(auth)/app/vacations/views/VacationPDFownload";

import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { fetchPeriods } from "@/app/actions/vacations-actions";
import DeleteleVacation from "./DeleteVacation";

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

export default function ShowInfoVacation({
  vacation,
}: {
  vacation: Vacations | null;
}) {
  const session = useSessionSnapshot();

  const [approveModal, setApproveModal] = useState(false);
  const [signatureDohModal, setSignatureDohModal] = useState(false);
  const [vacationPDFModal, setVacationPDFModal] = useState(false);
  const [periods, setPeriods] = useState<PeriodVacation[]>([]);

  if (!vacation) {
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

  const overallStatus = vacation.status ?? "PENDING";
  const createdAt = safeDate(vacation.createdAt, "dd/MM/yyyy HH:mm");

  const daysList = Array.isArray(vacation.daysdaysBrokenDown)
    ? vacation.daysdaysBrokenDown
    : [];

  const getSignatureEmployee = () => {
    const sign = vacation?.signatures?.filter(
      (f) => f.idSignatory === Number(session?.uid?.idEmployee)
    )?.[0];

    return sign?.url !== "";
  };

  const showLeaderApprove =
    vacation?.idLeader === Number(session?.uid?.idEmployee) &&
    vacation.leaderApproval !== "APPROVED";
  
  const showDohApprove = session?.uid?.idEmployee === vacation?.idPersonDoh && vacation.dohApproval !== 'APPROVED';

  const showEmployeeSign = session?.uid?.idEmployee === vacation?.employee?.id && !getSignatureEmployee();

  const handleApprove = () => setApproveModal(true);
  const handleSignatureDoh = () => setSignatureDohModal(true);
  const handleDownloadPDF = () => setVacationPDFModal(true);

  // si tienes modal/flujo de firma empleado, aquí lo conectas
  const handleEmployeeSignature = () => {
    // TODO: conectar flujo de firma empleado
  };

  const signatures = Array.isArray(vacation.signatures) ? vacation.signatures : [];

  const showAnyActions = useMemo(() => {
    return showLeaderApprove || showDohApprove || showEmployeeSign || true; // Descargar siempre
  }, [showLeaderApprove, showDohApprove, showEmployeeSign]);

  const getPeriods = useCallback(async () => {
    try {
      if (!vacation.idEmployee) {
        setPeriods([]);
        return;
      }

      const res = await fetchPeriods({
        idEmployee: Number(vacation.idEmployee),
      });

      const nextPeriods = (res ?? []) as PeriodVacation[];
      setPeriods(nextPeriods);

    } catch (error) {
      console.error(error);
      setPeriods([]);
    }
  }, []);

    useEffect(() => {
      getPeriods();
    }, [getPeriods]);
  
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
                    Solicitud #{vacation.id}
                  </h5>

                  <Badge bg={statusVariant(overallStatus)}>
                    {statusLabel(overallStatus)}
                  </Badge>
                </div>

                <div className="text-muted mt-2">
                  <div className="text-uppercase fw-semibold">
                    {vacation.holidayName ?? "Solicitada por el empleado"}
                  </div>
                  <div className="small">Creada: {createdAt}</div>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <Card className="border-0 table-active">
                  <Card.Body className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small text-uppercase">
                        Periodo Vacacional
                      </div>
                      <div className="fw-semibold text-uppercase">
                        {formatDate(vacation.period.dateInitPeriod, "dd/MM/yyyy")} - {formatDate(vacation.period.dateEndPeriod, "dd/MM/yyyy")}
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
                        <DeleteleVacation idRequest={vacation.id} idPeriod={Number(vacation.idPeriod)}/>

                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Main info */}
            <Row className="g-3 mt-1">
              {/* izquierda */}
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
                              {fullName(vacation.employee)}
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
                              {fullName(vacation.createForPerson)}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="text-muted small text-uppercase">
                                  Líder
                                </div>
                                <div className="fw-semibold">
                                  {fullName(vacation.leader)}
                                </div>
                              </div>
    
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} md={6}>
                        <Card className="border-0 table-active h-100">
                          <Card.Body className="py-3 px-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="text-muted small text-uppercase">
                                  D.O.H.
                                </div>
                                <div className="fw-semibold">
                                  {fullName(vacation.personDoh)}
                                </div>
                              </div>
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
                                  Días solicitados
                                </div>
                                <div className="fw-bold fs-5">
                                  {vacation.daysRequest ?? 0}
                                </div>
                              </Col>

                              <Col xs={12} md={4}>
                                <div className="text-muted small text-uppercase">
                                  Inicio
                                </div>
                                <div className="fw-semibold">
                                  {safeDate(vacation.dateInit)}
                                </div>
                              </Col>

                              <Col xs={12} md={4}>
                                <div className="text-muted small text-uppercase">
                                  Fin
                                </div>
                                <div className="fw-semibold">
                                  {safeDate(vacation.dateEnd)}
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

              {/* derecha */}
              <Col xs={12} lg={4}>
                <Card className="border-0 h-100">
                  <Card.Header className="table-active border-0">
                    <div className="fw-semibold text-uppercase">Días solicitados</div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {daysList.length === 0 ? (
                      <div className="p-3 text-muted">Sin desglose.</div>
                    ) : (
                      <Table responsive hover borderless className="m-0">
                        <thead className="text-uppercase">
                          <tr>
                            <th className="text-muted small">Día</th>
                            <th className="text-muted small text-end">
                              Periodo catorcenal
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {daysList.map((d: any) => (
                            <tr key={d.id}>
                              <td className="fw-semibold">{safeDate(d.day)}</td>
                              <td className="text-end">{d.fortnightlyPeriod ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
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
                        <SignaturesVacationView
                          key={sign.id}
                          idSolicitud={vacation.id}
                          idPeriod={vacation.period.id}
                          idEmployee={sign.idSignatory}
                          name={sign.name}
                          status={sign.status}
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

      <ApproveVacationLeaderModal
        id={String(vacation.id)}
        idPeriod={Number(vacation?.idPeriod)}
        show={approveModal}
        onHide={() => setApproveModal(false)}
      />

      <SignatureVacationDohModal
        show={signatureDohModal}
        onHide={() => setSignatureDohModal(false)}
        id={String(vacation.id)}
        idPeriod={Number(vacation?.idPeriod)}
      />

      <VacationPDFownload
        show={vacationPDFModal}
        onHide={() => setVacationPDFModal(false)}
        id={String(vacation.id)}
      />
    </>
  );
}
