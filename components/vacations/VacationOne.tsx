"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PeriodVacation, Vacations } from "@/lib/definitions";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Table,
} from "react-bootstrap";
import { formatDate } from "date-fns";

import SignaturesVacationView from "@/app/(auth)/app/vacations/views/SignaturesVacationView";
import { FormBook, FormPage } from "../templates/FormView";

import ApproveVacationLeaderModal from "@/app/(auth)/app/vacations/views/ApproveVacationLeaderModal";
import SignatureVacationDohModal from "@/app/(auth)/app/vacations/views/SignatureDohModal";
import VacationPDFownload from "@/app/(auth)/app/vacations/views/VacationPDFownload";

import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { deleteVacation, fetchPeriods } from "@/app/actions/vacations-actions";
import ConditionalRender from "../ConditionalRender";
import OverLay from "../templates/OverLay";
import Loading from "../LoadingSpinner";
import { useRouter } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import toast from "react-hot-toast";

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

type DayBreakdown = {
  id: number;
  day?: string | Date | null;
  fortnightlyPeriod?: string | number | null;
};

export default function ShowInfoVacation({
  vacation,
}: {
  vacation: Vacations | null;
}) {
  const router = useRouter();
  const session = useSessionSnapshot();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const [approveModal, setApproveModal] = useState(false);
  const [signatureDohModal, setSignatureDohModal] = useState(false);
  const [vacationPDFModal, setVacationPDFModal] = useState(false);
  const [, setPeriods] = useState<PeriodVacation[]>([]);
  const { modalError, modalConfirm } = useModals();

  // ✅ Estos cálculos quedan ANTES del early return para no romper hooks
  const daysList: DayBreakdown[] = Array.isArray(vacation?.daysdaysBrokenDown)
    ? (vacation?.daysdaysBrokenDown as DayBreakdown[])
    : [];

  const signatures = Array.isArray(vacation?.signatures)
    ? vacation!.signatures
    : [];

  const getSignatureEmployee = () => {
    const sign = vacation?.signatures?.filter(
      (f) => f.idSignatory === Number(session?.uid?.idEmployee)
    )?.[0];

    return sign?.url !== "";
  };

  const showLeaderApprove =
    vacation?.idLeader === Number(session?.uid?.idEmployee) &&
    vacation?.leaderApproval !== "APPROVED";

  const showDohApprove =
    session?.uid?.idEmployee === vacation?.idPersonDoh &&
    vacation?.dohApproval !== "APPROVED";

  const showEmployeeSign =
    session?.uid?.idEmployee === vacation?.employee?.id &&
    !getSignatureEmployee();

  const showAnyActions = useMemo(() => {
    return showLeaderApprove || showDohApprove || showEmployeeSign || true; // Descargar siempre
  }, [showLeaderApprove, showDohApprove, showEmployeeSign]);

  const getPeriods = useCallback(async () => {
    try {
      const idEmp = vacation?.idEmployee;

      if (!idEmp) {
        setPeriods([]);
        return;
      }

      const res = await fetchPeriods({
        idEmployee: Number(idEmp),
      });

      const nextPeriods = (res ?? []) as PeriodVacation[];
      setPeriods(nextPeriods);
    } catch (error) {
      console.error(error);
      setPeriods([]);
    }
  }, [vacation?.idEmployee]);

  useEffect(() => {
    getPeriods();
  }, [getPeriods]);

  // ✅ Early return ahora va DESPUÉS de los hooks
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

  const handleApprove = () => setApproveModal(true);
  const handleSignatureDoh = () => setSignatureDohModal(true);
  const handleDownloadPDF = () => setVacationPDFModal(true);

  // si tienes modal/flujo de firma empleado, aquí lo conectas
  const handleEmployeeSignature = () => {
    // TODO: conectar flujo de firma empleado
  };

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/vacations/create");
  };

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando datos...");
    router.push("/app/vacations");
  }

   //Borrar
    const handleDeleteOvertime = async () => {
        if (!vacation?.id) {
            modalError("No se encontró el registro");
            return;
        }

        modalConfirm("¿Deseas eliminar este registro?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Eliminando registro...");

                const res = await deleteVacation(Number(vacation.idPeriod), Number(vacation.id));

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/vacations");
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

          {/* Izquierda: acciones */}
          <div className="d-flex gap-2 flex-wrap">
            <OverLay string="Crear registro">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="primary"
                onClick={handleCreate}
                disabled={loading}
              >
                <i className="bi bi-plus-lg" />

                <span className="d-none d-md-inline ms-2">
                  Crear registro
                </span>
              </Button>
            </OverLay>

            <ConditionalRender cond={showEmployeeSign}>
              <OverLay string="Firmar">
                <Button
                  className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                  variant="warning"
                  onClick={handleEmployeeSignature}
                >
                  <i className="bi bi-pen-fill" />
                  <span className="d-none d-md-inline ms-2">Firmar</span>
                </Button>
              </OverLay>
            </ConditionalRender>

            <ConditionalRender cond={showLeaderApprove}>
              <OverLay string="Aprobar">
                <Button
                  className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                  variant="success"
                  onClick={handleApprove}
                >
                  <i className="bi bi-check-circle" />
                  <span className="d-none d-md-inline ms-2">Aprobar</span>
                </Button>
              </OverLay>
            </ConditionalRender>

            <ConditionalRender cond={showDohApprove}>
              <OverLay string="Aprobar">
                <Button
                  className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                  variant="success"
                  onClick={handleSignatureDoh}
                >
                  <i className="bi bi-card-checklist" />
                  <span className="d-none d-md-inline ms-2">Aprobar</span>
                </Button>
              </OverLay>
            </ConditionalRender>

            <OverLay string="Descargar PDF">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="secondary"
                onClick={handleDownloadPDF}
              >
                <i className="bi bi-filetype-pdf" />
                <span className="d-none d-md-inline ms-2">Descargar</span>
              </Button>
            </OverLay>

            <ConditionalRender cond={showAnyActions}>
              <OverLay string="Eliminar registro">
                <Button
                  className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                  variant="danger"
                  onClick={handleDeleteOvertime}
                  disabled={loading}
                >
                  <i className="bi bi-trash" />

                  <span className="d-none d-md-inline ms-2">
                    Eliminar registro
                  </span>
                </Button>
              </OverLay>
              {/* <DeleteleVacation
                idRequest={vacation.id}
                idPeriod={Number(vacation.idPeriod)}
              /> */}
            </ConditionalRender>
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
        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
          <h5 className="m-0 fw-bold text-uppercase">
            Solicitud #{vacation.id}
          </h5>
          <Badge bg={statusVariant(overallStatus)}>
            {statusLabel(overallStatus)}
          </Badge>
        </div>
        <p className="text-muted mb-3">
          {vacation.holidayName ?? "Solicitada por el empleado"} · Creada: {createdAt}
        </p>

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
                    <span className="fw-semibold text-end">{createdAt}</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person text-success" />
                      <span className="text-muted">Empleado</span>
                    </div>
                    <span className="fw-semibold text-end">
                      {fullName(vacation.employee)}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-workspace text-warning" />
                      <span className="text-muted">Líder</span>
                    </div>
                    <span className="fw-semibold text-end">
                      {fullName(vacation.leader)}
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-check text-info" />
                      <span className="text-muted">D.O.H.</span>
                    </div>
                    <span className="fw-semibold text-end">
                      {fullName(vacation.personDoh)}
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
                      Consulta el periodo vacacional y los días solicitados.
                    </p>
                  </div>
                  <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                    Registro
                  </span>
                </div>

                <div className="d-flex flex-column gap-4">
                  <div className="border rounded-3 p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-calendar-range text-primary" />
                      <span className="text-muted fw-semibold">
                        Periodo vacacional
                      </span>
                    </div>
                    <div className="text-uppercase">
                      {formatDate(vacation.period.dateInitPeriod, "dd/MM/yyyy")}
                      {" "}-{" "}
                      {formatDate(vacation.period.dateEndPeriod, "dd/MM/yyyy")}
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col xs={12} md={6} xl={3}>
                      <div className="border rounded-3 p-3 text-center h-100">
                        <i className="bi bi-calendar-event text-success fs-5 mb-2 d-block" />
                        <div className="text-muted small">Inicio</div>
                        <div className="fw-semibold">
                          {safeDate(vacation.dateInit)}
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={6} xl={3}>
                      <div className="border rounded-3 p-3 text-center h-100">
                        <i className="bi bi-calendar-x text-danger fs-5 mb-2 d-block" />
                        <div className="text-muted small">Fin</div>
                        <div className="fw-semibold">
                          {safeDate(vacation.dateEnd)}
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={6} xl={3}>
                      <div className="border rounded-3 p-3 text-center h-100">
                        <i className="bi bi-hourglass-split text-info fs-5 mb-2 d-block" />
                        <div className="text-muted small">Días solicitados</div>
                        <div className="fw-bold fs-5">
                          {vacation.daysRequest ?? 0}
                        </div>
                      </div>
                    </Col>

                    <Col xs={12} md={6} xl={3}>
                      <div className="border rounded-3 p-3 text-center h-100">
                        <i className="bi bi-person-lines-fill text-secondary fs-5 mb-2 d-block" />
                        <div className="text-muted small">Creada por</div>
                        <div className="fw-semibold">
                          {fullName(vacation.createForPerson)}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DESGLOSE DE DÍAS */}
        <Card className="border rounded-4 mb-4">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h6 className="mb-0 fw-bold">Días solicitados</h6>
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                Desglose
              </span>
            </div>

            {daysList.length === 0 ? (
              <div className="text-muted">Sin desglose.</div>
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
                  {daysList.map((d) => (
                    <tr key={d.id}>
                      <td className="fw-semibold">{safeDate(d.day)}</td>
                      <td className="text-end">
                        {d.fortnightlyPeriod ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* FIRMAS */}
        <FormBook dKey="signatures">
          {signatures.length > 0 && (
            <FormPage title="" eventKey="signatures">
              <Card className="border rounded-4">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0 fw-bold">Firmas</h6>
                    <span className="badge rounded-pill px3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                      Autorizaciones
                    </span>
                  </div>

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
                </Card.Body>
              </Card>
            </FormPage>
          )}
        </FormBook>
      </Container>

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
