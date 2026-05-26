"use client";

import {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
  PageSheet,
} from "@/components/templates/FormView";
import {
  Accordion,
  Button,
  Col,
  Container,
  ListGroup,
  Nav,
  Row,
  Table,
} from "react-bootstrap";
import {
  ActionResponse,
  Branch,
  Department,
  Employee,
  IPeriod,
  Vacations,
} from "@/lib/definitions";
import { formatDate } from "date-fns";
import DocumentsGrid from "@/app/(auth)/app/employee/views/DocuementsGrid";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ModalBlur from "../ModalBlur";
import FormUpdateEmployee from "@/app/(auth)/app/employee/views/updateEmplyee/update";
import { TInputsEmployee } from "@/app/(auth)/app/employee/definition";
import {
  deleteEmployee,
  reEntry,
  updateEmploye,
} from "@/app/actions/employee-actions";
import { useModals } from "@/context/ModalContext";
import toast from "react-hot-toast";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import RegisterBiometricModal from "./rekognition";
import UnsubscribeEmployeeComponent from "./Unsubscribe";
import NewDocumentEmployeeComponent from "./NewDocument";


function formatDateValue(value?: string | Date | null, pattern = "dd/MM/yyyy") {
  if (!value) return "-";

  try {
    return formatDate(value, pattern);
  } catch {
    return String(value);
  }
}

function formatText(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatPhone(
  value?:
    | string
    | {
        internationalNumber?: string | null;
      }
    | null
) {
  if (!value) return "-";
  if (typeof value === "string") return value || "-";
  return value.internationalNumber || "-";
}

function InfoItem({
  label,
  value,
  className = "",
  uppercase = true,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}) {
  return (
    <div className={className}>
      <div className="text-secondary-emphasis fw-semibold mb-1">{label}</div>
      <div className={uppercase ? "fw-medium text-uppercase" : "fw-medium"}>
        {value ?? "-"}
      </div>
    </div>
  );
}

function InfoTextArea({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-secondary-emphasis fw-semibold mb-1">{label}</div>
      <div
        className="fw-medium"
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}

type Props = {
  employee: Employee | null;
  id: string;
  departments: Department[];
  branches: Branch[];
  employees: Employee[];
  documents: IPeriod[];
  vacations: Vacations[];
};

export default function EmployeeDetailsView({
  employee,
  id,
  departments,
  branches,
  employees,
  documents,
  vacations,
}: Props) {
  const { modalError, modalConfirm } = useModals();
  const { data: session } = useSession();
  const [showRegisterBiometricModal, setShowRegisterBiometricModal] = useState(false);
  const [showUpdateEmployeeModal, setShowUpdateEmployeeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUnsubscribeEmployeeModal, setShowUnsubscribeEmployeeModal] = useState(false);
  const [showNewDocumentEmployeeModal, setShowNewDocumentEmployeeModal] = useState(false);

  const department =
    departments.find((d) => d.id === employee?.department?.id) ||
    employee?.department ||
    null;

  const branch =
    branches.find((b) => b.id === employee?.branch?.id) || employee?.branch;

  const leader = employees.find(
    (em) => em.id === (employee?.department as unknown as Department)?.idLeader
  );

  const departmentLeader = (employee?.department as Department | null)?.leader;

  const handleUpdateEmployee = async (
    data: TInputsEmployee
  ): Promise<ActionResponse<boolean | null>> => {
    if (!employee?.id) {
      return {
        success: false,
        message: "No se encontró el empleado",
        data: null,
      };
    }

    return await updateEmploye({
      id: employee.id,
      data,
    });
  };


const handleReEntry = async () => {
  if (!employee?.id) {
    modalError("No se encontró el empleado");
    return;
  }

  modalConfirm("Confirma el reingreso del empleado", async () => {
    try {
      setLoading(true);

      const res = await reEntry({ id: Number(employee.id) });

      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
    } finally {
      setLoading(false);
    }
  });
};

  return (
    <>
        <ConditionalRender cond={loading}>
            <Loading message="Cargando..." />
        </ConditionalRender>
      <div className="mb-4">
        <h1 className="mb-0 text-white">
          {`${employee?.name || ""} ${employee?.lastName || ""}`.trim() ||
            "Empleado"}
        </h1>
      </div>

      <div className="mb-4 d-flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowUpdateEmployeeModal(true)}
        >
          <i className="bi bi-pencil me-2" />
          Actualizar Empleado
        </Button>

        {employee?.status === 1 && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowUnsubscribeEmployeeModal(true)}
          >
            <i className="bi bi-arrow-down me-2" />
            Dar de baja
          </Button>
        )}

        {employee?.status === 2 && (
          <Button size="sm" variant="success" onClick={handleReEntry}>
            <i className="bi bi-arrow-up me-2" />
            Reingreso
          </Button>
        )}
        <Button
          size="sm"
          variant="warning"
          onClick={() => setShowRegisterBiometricModal(true)}
        >
          <i className="bi bi-person-bounding-box me-2" />
          Registrar biométricos
        </Button>
      </div>

      <FormBook dKey="personalInfo">
        <FormPage title="Información Personal" eventKey="personalInfo">
          <PageSheet>
            <FieldGroup>
              <InfoItem label="Nombre:" value={formatText(employee?.name)} />
              <InfoItem
                label="Apellidos:"
                value={formatText(employee?.lastName)}
              />
              <InfoItem
                label="Correo personal:"
                value={formatText(employee?.emailPersonal)}
                uppercase={false}
              />

              <FieldGroup.Stack>
                <InfoItem
                  label="Celular:"
                  value={formatPhone(employee?.phonePersonal)}
                  uppercase={false}
                />
                <InfoItem
                  label="Teléfono fijo:"
                  value={formatPhone(employee?.homePhone)}
                  uppercase={false}
                />
              </FieldGroup.Stack>
            </FieldGroup>

            <>
              <FieldGroup>
                <InfoItem
                  label="Calle:"
                  value={formatText(employee?.address?.street)}
                />

                <FieldGroup.Stack>
                  <InfoItem
                    label="No. Exterior:"
                    value={formatText(employee?.address?.numberOut)}
                  />
                  <InfoItem
                    label="No. Interior:"
                    value={formatText(employee?.address?.numberIn)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="Colonia:"
                    value={formatText(employee?.address?.neighborhood)}
                  />
                  <InfoItem
                    label="C.P."
                    value={formatText(employee?.address?.zipCode)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="Municipio:"
                    value={formatText(employee?.address?.municipality)}
                  />
                  <InfoItem
                    label="Estado:"
                    value={formatText(employee?.address?.state)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="País:"
                    value={formatText(employee?.address?.country)}
                  />
                </FieldGroup.Stack>
              </FieldGroup>

              <FieldGroup>
                <FieldGroup.Stack>
                  <InfoItem
                    label="Nacimiento:"
                    value={formatDateValue(employee?.birthDate)}
                    uppercase={false}
                  />
                  <InfoItem
                    label="Nacionalidad:"
                    value={formatText(employee?.nationality)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="NSS:"
                    value={formatText(employee?.socialSecurityNumber)}
                    uppercase={false}
                  />
                  <InfoItem
                    label="R.F.C."
                    value={formatText(employee?.rfc)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="CURP:"
                    value={formatText(employee?.curp)}
                  />
                </FieldGroup.Stack>
              </FieldGroup>

              <FieldGroup>
                <FieldGroup.Stack>
                  <InfoItem
                    label="Género:"
                    value={formatText(employee?.gender)}
                  />
                  <InfoItem
                    label="Grupo sanguíneo:"
                    value={formatText(employee?.bloodType)}
                  />
                </FieldGroup.Stack>

                <FieldGroup.Stack>
                  <InfoItem
                    label="Peso:"
                    value={formatText(employee?.weight)}
                    uppercase={false}
                  />
                  <InfoItem
                    label="Altura:"
                    value={formatText(employee?.height)}
                    uppercase={false}
                  />
                </FieldGroup.Stack>

                <InfoItem
                  label="Constitución:"
                  value={formatText(employee?.constitution)}
                />
                <InfoItem
                  label="Estado de salud:"
                  value={formatText(employee?.healthStatus)}
                  uppercase={false}
                />
              </FieldGroup>

              <FieldGroup>
                <InfoItem
                  label="Formación académica:"
                  value={formatText(employee?.education)}
                  uppercase={false}
                />
                <InfoItem
                  label="Habilidades:"
                  value={formatText(employee?.skills)}
                  uppercase={false}
                />
                <FieldGroup.Stack>
                  <InfoItem
                    label="Hijos:"
                    value={formatText(employee?.sons)}
                    uppercase={false}
                  />
                  <InfoItem
                    label="Hijas:"
                    value={formatText(employee?.daughters)}
                    uppercase={false}
                  />
                </FieldGroup.Stack>
              </FieldGroup>

              <FieldGroup>
                <InfoTextArea
                  label="Observaciones generales:"
                  value={formatText(employee?.comments)}
                />
              </FieldGroup>
            </>
          </PageSheet>
        </FormPage>

        <FormPage title="Información Laboral" eventKey="jobInfo">
          <PageSheet>
            <FieldGroup>
              <FieldGroup.Stack>
                <InfoItem
                  label="Teléfono de oficina:"
                  value={formatPhone(employee?.phoneCompany)}
                  uppercase={false}
                />
                <InfoItem
                  label="Extensión:"
                  value={formatText(employee?.phoneExtCompany)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <InfoItem
                label="Correo:"
                value={formatText(employee?.emailCompany)}
                uppercase={false}
              />

              <FieldGroup.Stack>
                <InfoItem
                  label="Departamento:"
                  value={formatText(department?.nameDepartment)}
                />
                <InfoItem
                  label="Puesto:"
                  value={formatText(employee?.position?.namePosition)}
                />
              </FieldGroup.Stack>

              <InfoItem
                label="Gerente:"
                value={
                  leader
                    ? `${leader.name} ${leader.lastName}`
                    : departmentLeader
                    ? `${departmentLeader.name} ${departmentLeader.lastName}`
                    : "-"
                }
              />

              <InfoItem
                label="Sucursal"
                value={formatText(branch?.name)}
              />
            </FieldGroup>

            <FieldGroup>
              <FieldGroup.Stack>
                <InfoItem
                  label="ID Checador:"
                  value={formatText(employee?.idCheck)}
                  uppercase={false}
                />
                <InfoItem
                  label="Contraseña de checador:"
                  value={formatText(employee?.passwordCheck)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="Entrada Oficina:"
                  value={formatText(employee?.scheduleOffice?.entry)}
                  uppercase={false}
                />
                <InfoItem
                  label="Salida Oficina:"
                  value={formatText(employee?.scheduleOffice?.exit)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="Entrada comedor:"
                  value={formatText(employee?.scheduleLunch?.entry)}
                  uppercase={false}
                />
                <InfoItem
                  label="Salida comedor:"
                  value={formatText(employee?.scheduleLunch?.exit)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="Entrada sabatina:"
                  value={formatText(employee?.scheduleSaturday?.entry)}
                  uppercase={false}
                />
                <InfoItem
                  label="Salida sabatina:"
                  value={formatText(employee?.scheduleSaturday?.exit)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <InfoItem
                label="Descripción del horario:"
                value={formatText(employee?.scheduleDescription)}
                uppercase={false}
              />

              {session?.user?.permissions.some(
                (p) => p.text === "visualizar_salario"
              ) && (
                <FieldGroup.Stack>
                  <InfoItem
                    label="Salario diario:"
                    value={formatText(employee?.dailyWage)}
                    uppercase={false}
                  />
                </FieldGroup.Stack>
              )}
            </FieldGroup>

            <FieldGroup>
              <FieldGroup.Stack>
                <InfoItem
                  label="Carta de aniversario:"
                  value={formatText(employee?.anniversaryLetter)}
                />
                <InfoItem
                  label="Status:"
                  value={
                    employee?.status === 1
                      ? "Activo"
                      : employee?.status === 2
                      ? "Baja"
                      : "-"
                  }
                />
              </FieldGroup.Stack>

              <FieldGroup.Stack>
                <InfoItem
                  label="keyCONTPAQi:"
                  value={formatText(employee?.keyCONTPAQi)}
                  uppercase={false}
                />
                <InfoItem
                  label="keyAspelNOI:"
                  value={formatText(employee?.keyAspelNOI)}
                  uppercase={false}
                />
              </FieldGroup.Stack>

              <InfoItem
                label="Motivo de la baja:"
                value={formatText(employee?.dischargeReason)}
                uppercase={false}
              />
            </FieldGroup>
          </PageSheet>
        </FormPage>

        <FormPage title="Contactos" eventKey="contacts">
          <FormSheet>
            <Col md="12">
              <Table size="sm" borderless hover responsive>
                <thead>
                  <tr className="border-bottom table-active">
                    <th className="border-end">Name</th>
                    <th className="border-end">Parentezco</th>
                    <th className="border-end">Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {employee?.emergencyContacts?.length ? (
                    employee.emergencyContacts.map((contact, index) => (
                      <tr key={`${contact.name}-${index}`}>
                        <td valign="middle" className="border-bottom">
                          {formatText(contact.name)}
                        </td>
                        <td valign="middle" className="border-bottom">
                          {formatText(contact.kinship)}
                        </td>
                        <td valign="middle" className="border-bottom">
                          {formatPhone(contact.phone)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-3">
                        Sin contactos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
          </FormSheet>
        </FormPage>

        <FormPage title="Ingresos y Bajas" eventKey="historical">
          <Container>
            <Row className="py-1">
              <FieldGroup>
                <FieldGroup.Stack>
                  <InfoItem
                    label="Inicio de relación:"
                    value={formatDateValue(employee?.admissionDate, "yyyy-MM-dd")}
                    uppercase={false}
                  />
                  <InfoItem
                    label="Fin de relación:"
                    value={formatDateValue(employee?.dischargeDate, "yyyy-MM-dd")}
                    uppercase={false}
                  />
                </FieldGroup.Stack>
              </FieldGroup>

              <FieldGroup>
                <InfoItem
                  label="Tipo de baja:"
                  value={formatText(employee?.typeOfDischarge)}
                  uppercase={false}
                />
                <InfoTextArea
                  label=""
                  value={formatText(employee?.dischargeReason)}
                />
              </FieldGroup>
            </Row>

            <Row className="py-1">
              <Col md="12">
                <Table borderless hover className="text-uppercase">
                  <thead>
                    <tr>
                      <th className="border-end border-bottom table-active">
                        Reingreso
                      </th>
                      <th className="border-end border-bottom table-active">
                        Baja
                      </th>
                      <th className="border-end border-bottom table-active">
                        Razón
                      </th>
                      <th className="border-end border-bottom table-active">
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee?.reEntry?.length ? (
                      employee.reEntry.map((re) => (
                        <tr key={re._id}>
                          <td className="border-bottom text-center">
                            {re.reEntryDate
                              ? formatDate(re.reEntryDate, "MM/dd/yyyy")
                              : "-"}
                          </td>
                          <td className="border-bottom text-center">
                            {re.dischargeDate
                              ? formatDate(re.dischargeDate, "MM/dd/yyyy")
                              : "-"}
                          </td>
                          <td className="border-bottom text-nowrap">
                            {formatText(re.dischargeReason)}
                          </td>
                          <td className="border-bottom text-nowrap">
                            {formatText(re.typeOfDischarge)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-3">
                          Sin historial
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Container>
        </FormPage>

        <FormPage title="Documentos" eventKey="documents">
          <Container className="mt-1">
            <Row className="mb-2">
              <Col md="12">
                <Nav>
                  {session?.user?.permissions.some(
                    (p) => p.text === "crear_plantilla_de_documento"
                  ) && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowNewDocumentEmployeeModal(true)}
                    >
                      <i className="bi bi-file-earmark-plus me-2 mt-2" />
                      Nueva plantilla
                    </Button>
                  )}
                </Nav>
              </Col>
            </Row>

            <Accordion>
              {documents.map((period, index) => (
                <Accordion.Item
                  eventKey={String(period.idPeriod)}
                  key={`${period.idPeriod}-docs`}
                >
                  <Accordion.Header>Periodo {index + 1}</Accordion.Header>
                  <Accordion.Body>
                    <Row className="g-2">
                      {period.documents.map((doc) => (
                        <DocumentsGrid
                          key={doc.title}
                          doc={doc}
                          idEmployee={Number(id)}
                        />
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </FormPage>

       {/* Pestaña de vacaciones (A reciclar) */}
        <FormPage title="Vacaciones" eventKey="vacations">
          <Container className="mt-1">
            <Row>
              <Col md="12">
                <Accordion>
                  {vacations.map((v) => (
                    <Accordion.Item
                      key={v.id}
                      eventKey={v.periodDescription}
                      className="bg-secondary"
                    >
                      <Accordion.Header>{v.periodDescription}</Accordion.Header>
                      <Accordion.Body>
                        <ListGroup horizontal className="mb-3">
                          <ListGroup.Item>
                            <strong>Días totales: </strong>
                            {v.totalDaysPeriod}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Fecha inicio: </strong>
                            {formatDate(v.dateInitPeriod, "dd/MM/yyyy")}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <strong>Fecha final: </strong>
                            {formatDate(v.dateEndPeriod, "dd/MM/yyyy")}
                          </ListGroup.Item>
                        </ListGroup>

                        <Accordion>
                          {v.vacationsRequestsData.map((vr) => (
                            <Accordion.Item
                              key={vr._id}
                              eventKey={String(vr.id)}
                            >
                              <Accordion.Header>
                                <h6>{vr.holidayName}</h6>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div>
                                  <div className="d-flex justify-content-around align-items-center mb-3">
                                    <div>
                                      <strong>Fecha inicio: </strong>
                                      {formatDate(vr.dateInit, "dd/MM/yyyy")}
                                    </div>
                                    <div>
                                      <strong>Fecha final: </strong>
                                      {formatDate(vr.dateEnd, "dd/MM/yyyy")}
                                    </div>
                                  </div>

                                  <div className="d-flex justify-content-around align-items-center">
                                    <div>
                                      <strong>Status líder: </strong>
                                      {vr.leaderApproval === "APPROVED"
                                        ? "APROBADO"
                                        : vr.leaderApproval === "REJECTED"
                                        ? "RECHAZADO"
                                        : "PENDIENTE"}
                                    </div>
                                    <div>
                                      <strong>Status D.O.H. </strong>
                                      {vr.dohApproval === "APPROVED"
                                        ? "ENTERADO"
                                        : "NO ENTERADO"}
                                    </div>
                                  </div>
                                </div>
                              </Accordion.Body>
                            </Accordion.Item>
                          ))}
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Col>
            </Row>
          </Container>
        </FormPage>
        {/* =============== Aqui termina ================  */}
      </FormBook>

      {showUpdateEmployeeModal && (
        <ModalBlur onClose={() => setShowUpdateEmployeeModal(false)}>
          <FormUpdateEmployee
            show={showUpdateEmployeeModal}
            onHide={() => setShowUpdateEmployeeModal(false)}
            sendData={handleUpdateEmployee}
            employee={employee}
            departments={departments}
            branches={branches}
            employees={employees}
          />
        </ModalBlur>
      )}
      {showRegisterBiometricModal && employee?.id && (
        <ModalBlur onClose={() => setShowRegisterBiometricModal(false)}>
          <RegisterBiometricModal
            employeeId={Number(employee.id)}
            employeeName={`${employee.name || ""} ${employee.lastName || ""}`.trim()}
            onClose={() => setShowRegisterBiometricModal(false)}
            onSuccess={() => {
              setShowRegisterBiometricModal(false);
            }}
          />
        </ModalBlur>
      )}
      {showUnsubscribeEmployeeModal && employee?.id && (
      <ModalBlur onClose={() => setShowUnsubscribeEmployeeModal(false)}>
        <UnsubscribeEmployeeComponent
          employeeId={Number(employee.id)}
          employeeName={`${employee.name || ""} ${employee.lastName || ""}`.trim()}
          onClose={() => setShowUnsubscribeEmployeeModal(false)}
          onSuccess={() => {
            setShowUnsubscribeEmployeeModal(false);
          }}
        />
      </ModalBlur>
    )}
    {showNewDocumentEmployeeModal && (
      <ModalBlur onClose={() => setShowNewDocumentEmployeeModal(false)}>
        <NewDocumentEmployeeComponent
          onClose={() => setShowNewDocumentEmployeeModal(false)}
          onSuccess={() => {
            setShowNewDocumentEmployeeModal(false);
          }}
        />
      </ModalBlur>
    )}
    </>
  );
}