"use client";

import { createEmployee, updateEmploye } from "@/app/actions/employee-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
  PageSheet,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  Branch,
  Department,
  Employee,
  IPeriod,
  Position,
  Vacations,
} from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { TInputsEmployee } from "../definition";
import { formatDate } from "date-fns";
import {
  Accordion,
  Button,
  Col,
  Container,
  Form,
  ListGroup,
  Nav,
  Row,
  Table,
} from "react-bootstrap";
import ModalUnsubscribe from "./ModalUnsubscribe";
import { reEntryUser } from "@/app/actions/user-actions";
import DocumentsGrid from "./DocuementsGrid";
import { useSession } from "next-auth/react";

const employeeStatus = {
  1: "activo",
  2: "baja",
};

function EmployeeFormView({
  employee,
  id,
  departments,
  branches,
  employees,
  documents,
  vacations,
}: {
  employee: Employee | null;
  id: string;
  departments: Department[];
  branches: Branch[];
  employees: Employee[];
  documents: IPeriod[];
  vacations: Vacations[];
}) {
  const {
    watch,
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputsEmployee>();

  const { data: session } = useSession();

  const {
    append: appContacts,
    fields: fieldsContacts,
    remove: removeContacts,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const [deps] = watch(["idDepartment.id"]);

  const { modalError, modalConfirm } = useModals();

  const originalValuesRef = useRef<TInputsEmployee | null>(null);
  const router = useRouter();

  const [puestos, setPuestos] = useState<Position[]>([]);
  const [modalUnsubscribe, setModalUnsubscribe] = useState(false);

  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    if (id && id === "null") {
      const res = await createEmployee({ data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      router.back();
    } else {
      const res = await updateEmploye({ data, id: Number(id) });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
    }
  };

  const handleReEntry = async () => {
    modalConfirm("Confirma el reingreso del Empleado", async () => {
      const res = await reEntryUser({ id: Number(id) });
      if (!res.success) return modalError(res.message);

      toast.success(res.message);
    });
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!employee) {
      const values: TInputsEmployee = {
        name: "",
        lastName: "",
        emailPersonal: "",
        phonePersonal: "",
        idCheck: 0,
        passwordCheck: 0,
        entryOffice: "",
        entrySaturdayOffice: "08:30",
        exitSaturdayOffice: "14:00",
        exitLunch: "",
        entryLunch: "",
        exitOffice: "",
        idDepartment: null,
        branch: null,
        idPosition: null,
        gender: "MASCULINO",
        status: 1,
        phoneCompany: "",
        phoneExtCompany: 0,
        address: {
          street: "",
          country: "México",
          municipality: "",
          neighborhood: "",
          numberIn: "",
          numberOut: "",
          state: "",
          zipCode: "",
        },
        emailCompany: "",
        scheduleDescription: "",
        policies: "",
        group: "",
        homePhone: "",
        sons: 0,
        daughters: 0,
        birthDate: "",
        nationality: "",
        socialSecurityNumber: "",
        rfc: "",
        curp: "",
        weight: "",
        height: "",
        bloodType: "",
        constitution: "",
        healthStatus: "",
        education: "",
        skills: "",
        comments: "",
        emergencyContacts: [],
        keyAspelNOI: "",
        keyCONTPAQi: "",
        admissionDate: "",
        anniversaryLetter: "",
        visibleRecords: false,
        dischargeDate: null,
        dischargeReason: "",
        typeOfDischarge: "",
        role: [],
        dailyWage: 0,
      };
      setPuestos([]);
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputsEmployee = {
        name: employee.name,
        lastName: employee.lastName,
        emailPersonal: employee.emailPersonal,
        phonePersonal: employee.phonePersonal?.internationalNumber || "",
        idCheck: Number(employee.idCheck) || 0,
        passwordCheck: Number(employee.passwordCheck) || 0,
        entryOffice: employee.scheduleOffice?.entry || "",
        entrySaturdayOffice: employee.scheduleSaturday?.entry || "",
        exitOffice: employee.scheduleOffice?.exit || "",
        exitSaturdayOffice: employee.scheduleSaturday?.exit || "",
        exitLunch: employee.scheduleLunch?.exit || "",
        entryLunch: employee.scheduleLunch?.entry || "",
        idDepartment: employee.department || null,
        branch: employee.branch?.id || null,
        idPosition: employee.position?.id || null,
        gender: employee.gender,
        status: employee.status || 1,
        phoneCompany: employee.phoneCompany?.internationalNumber || "",
        phoneExtCompany: employee.phoneExtCompany,
        address: {
          street: employee?.address?.street || "",
          country: employee?.address?.country || "",
          municipality: employee?.address?.municipality || "",
          neighborhood: employee?.address?.neighborhood || "",
          numberIn: employee?.address?.numberIn || "",
          numberOut: employee?.address?.numberOut || "",
          state: employee?.address?.state || "",
          zipCode: String(employee?.address?.zipCode) || "",
        },
        emailCompany: employee.emailCompany,
        scheduleDescription: employee.scheduleDescription,
        policies: employee.policies,
        group: employee.group,
        homePhone: employee?.homePhone?.internationalNumber || "",
        sons: employee.sons,
        daughters: employee.daughters,
        birthDate: formatDate(employee?.birthDate, "yyy-MM-dd"),
        nationality: employee.nationality,
        socialSecurityNumber: employee.socialSecurityNumber,
        rfc: employee.rfc,
        curp: employee.curp,
        weight: employee.weight,
        height: employee.height,
        bloodType: employee.bloodType,
        constitution: employee.constitution,
        healthStatus: employee.healthStatus,
        education: employee.education,
        skills: employee.skills,
        comments: employee.comments,
        emergencyContacts: employee.emergencyContacts,
        keyAspelNOI: employee.keyAspelNOI,
        keyCONTPAQi: employee.keyCONTPAQi,
        admissionDate: formatDate(employee.admissionDate, "yyyy-MM-dd"),
        anniversaryLetter: employee.anniversaryLetter,
        visibleRecords: employee.visibleRecords,
        dischargeDate: employee.dischargeDate
          ? formatDate(employee.dischargeDate, "yyyy-MM-dd")
          : null,
        dischargeReason: employee.dischargeReason,
        typeOfDischarge: employee.typeOfDischarge,
        role: employee.role || [],
        dailyWage: employee.dailyWage,
      };
      reset(values);
      originalValuesRef.current = values;
      const department = employee.idDepartment as unknown as Department;
      setPuestos(department?.positions || []);
      console.log("values: ", values);
    }
  }, [employee, reset]);

  useEffect(() => {
    console.log(
      "isDirty:",
      isDirty,
      "isSubmitting:",
      isSubmitting,
      "errors:",
      errors
    );
  }, [errors, isDirty, isSubmitting]);

  useEffect(() => {
    if (deps) {
      const positions: Position[] =
        departments.find((dep) => dep.id === deps)?.positions || [];
      setPuestos(positions);
    } else {
      setPuestos([]);
    }
  }, [deps, watch, departments]);

  return (
    <>
      <FormView
        title="Empleado"
        reverse={handleReverse}
        onSubmit={handleSubmit(onSubmit)}
        name={`${employee?.name || ""} ${employee?.lastName || ""}` || null}
        isDirty={isDirty}
        id={Number(id)}
        disabled={isSubmitting}
        cleanUrl="/app/employee?view_type=form&id=null"
        state={employeeStatus[employee?.status as keyof typeof employeeStatus]}
        superActions={[
          {
            action: () => setModalUnsubscribe(!modalUnsubscribe),
            string: (
              <>
                <i className="bi bi-arrow-down me-1"></i>
                <span>Dar de baja</span>
              </>
            ),
            invisible: employee?.status === 2,
            variant: "danger",
          },
          {
            action: handleReEntry,
            string: (
              <>
                <i className="bi bi-arrow-up me-1"></i>
                <span>Reingreso</span>
              </>
            ),
            invisible: employee?.status === 1,
            variant: "success",
          },
        ]}
      >
        <FormBook dKey="personalInfo">
          <FormPage title="Información Personal" eventKey="personalInfo">
            <PageSheet>
              <FieldGroup>
                <Entry
                  register={register("name", { required: true })}
                  label="Nombre:"
                  invalid={!!errors.name}
                />
                <Entry
                  register={register("lastName", { required: true })}
                  label="Apellidos:"
                  invalid={!!errors.lastName}
                />
                <Entry
                  register={register("emailPersonal")}
                  label="Correo personal:"
                />
                <FieldGroup.Stack>
                  <Entry
                    register={register("phonePersonal", { required: true })}
                    label="Celular:"
                    invalid={!!errors.phonePersonal}
                  />

                  <Entry
                    register={register("homePhone")}
                    label="Teléfono fijo:"
                  />
                </FieldGroup.Stack>
              </FieldGroup>

              <>
                <FieldGroup>
                  <Entry
                    register={register("address.street", { required: true })}
                    label="Calle:"
                    invalid={!!errors.address?.street}
                  />
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.numberOut", {
                        required: true,
                      })}
                      label="No. Exterior:"
                      invalid={!!errors.address?.numberOut}
                    />
                    <Entry
                      register={register("address.numberIn")}
                      label="No. Interior:"
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.neighborhood", {
                        required: true,
                      })}
                      label="Colonia:"
                      invalid={!!errors.address?.neighborhood}
                    />
                    <Entry
                      register={register("address.zipCode", { required: true })}
                      label="C.P."
                      invalid={!!errors.address?.zipCode}
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.municipality")}
                      label="Municipio:"
                    />
                    <Entry
                      register={register("address.state", { required: true })}
                      label="Estado:"
                      invalid={!!errors.address?.state}
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.country", { required: true })}
                      label="País:"
                      invalid={!!errors.address?.country}
                    />
                  </FieldGroup.Stack>
                </FieldGroup>
                <FieldGroup>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("birthDate", { required: true })}
                      type="date"
                      label="Nacimiento:"
                      invalid={!!errors?.birthDate}
                    />
                    <Entry
                      register={register("nationality", { required: true })}
                      label="Nacionalidad:"
                      invalid={!!errors.nationality}
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("socialSecurityNumber", {
                        required: true,
                      })}
                      label="NSS:"
                      invalid={!!errors.socialSecurityNumber}
                    />
                    <Entry
                      register={register("rfc", { required: true })}
                      label="R.F.C."
                      className="text-uppercase"
                      invalid={!!errors.rfc}
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("curp", { required: true })}
                      label="CURP:"
                      className="text-uppercase"
                      invalid={!!errors.curp}
                    />
                  </FieldGroup.Stack>
                </FieldGroup>
                <FieldGroup>
                  <FieldGroup.Stack>
                    <FieldSelect
                      options={[
                        { value: "MASCULINO", label: "MASCULINO" },
                        { value: "FEMENINO", label: "FEMENINO" },
                      ]}
                      label="Género:"
                      register={register("gender", { required: true })}
                      invalid={!!errors.gender}
                    />
                    <Entry
                      register={register("bloodType", { required: true })}
                      label="Grupo sanguíneo:"
                      className="text-center"
                      invalid={!!errors.bloodType}
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry register={register("weight")} label="Peso:" />
                    <Entry register={register("height")} label="Altura:" />
                  </FieldGroup.Stack>
                  <Entry
                    register={register("constitution")}
                    label="Constitución:"
                  />
                  <Entry
                    register={register("healthStatus")}
                    label="Estado de salud:"
                  />
                </FieldGroup>
                <FieldGroup>
                  <Entry
                    register={register("education")}
                    label="Formación académica:"
                  />
                  <Entry register={register("skills")} label="Habilidades:" />
                  <FieldGroup.Stack>
                    <Entry register={register("sons")} label="Hijos:" />
                    <Entry register={register("daughters")} label="Hijas:" />
                  </FieldGroup.Stack>
                </FieldGroup>
                <FieldGroup>
                  {/* <Entry register={register("comments")} label="Comentarios:" /> */}
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Observaciones generales:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      {...register("comments")}
                      rows={8}
                    />
                  </Form.Group>
                </FieldGroup>
              </>
            </PageSheet>
          </FormPage>
          <FormPage title="Información Laboral" eventKey="jobInfo">
            <PageSheet>
              <FieldGroup>
                <FieldGroup.Stack>
                  <Entry
                    register={register("phoneCompany")}
                    label="Teléfono de oficina:"
                  />
                  <Entry
                    register={register("phoneExtCompany")}
                    label="Extensión:"
                  />
                </FieldGroup.Stack>
                <Entry register={register("emailCompany")} label="Correo:" />
                <FieldGroup.Stack>
                  <RelationField
                    register={register("idDepartment.id", { required: true })}
                    options={departments.map((d) => ({
                      id: d.id || 0,
                      displayName: d.nameDepartment,
                      name: d.nameDepartment,
                    }))}
                    label="Departamento:"
                    control={control}
                    callBackMode="id"
                    className="text-uppercase"
                    invalid={!!errors?.idDepartment}
                  />
                  <RelationField
                    options={puestos.map((p) => ({
                      id: p.id || 0,
                      displayName: p.namePosition,
                      name: p.namePosition,
                    }))}
                    register={register("idPosition", { required: true })}
                    control={control}
                    callBackMode="id"
                    label="Puesto:"
                    className="text-uppercase"
                    invalid={!!errors.idPosition}
                  />
                </FieldGroup.Stack>
                <RelationField
                  register={register("idDepartment.idLeader")}
                  options={employees.map((em) => ({
                    id: em.id || 0,
                    displayName: `${em.name} ${em.lastName}`,
                    name: `${em.name} ${em.lastName}`,
                  }))}
                  control={control}
                  callBackMode="id"
                  label="Gerente:"
                  className="text-uppercase"
                  readonly
                />
                <RelationField
                  control={control}
                  register={register("branch", { required: true })}
                  options={branches.map((b) => ({
                    id: b.id || 0,
                    displayName: b.name,
                    name: b.name,
                  }))}
                  callBackMode="id"
                  label="Sucursal"
                  className="text-uppercase"
                  invalid={!!errors.branch}
                />
                {/* <Entry register={register("policies")} label="Políticas:" /> */}
              </FieldGroup>
              <FieldGroup>
                <FieldGroup.Stack>
                  <Entry
                    register={register("idCheck", { required: true })}
                    label="ID Checador:"
                    invalid={!!errors.idCheck}
                  />
                  <Entry
                    register={register("passwordCheck", { required: true })}
                    label="Contraseña de checador:"
                    invalid={!!errors.passwordCheck}
                  />
                </FieldGroup.Stack>
                <FieldGroup.Stack>
                  <Entry
                    register={register("entryOffice", { required: true })}
                    label="Entrada:"
                    invalid={!!errors.entryOffice}
                  />
                  <Entry
                    register={register("exitOffice", { required: true })}
                    label="Salida:"
                    invalid={!!errors.exitOffice}
                  />
                </FieldGroup.Stack>
                <FieldGroup.Stack>
                  <Entry
                    register={register("entryLunch", { required: true })}
                    label="Salida comedor:"
                    invalid={!!errors.entryLunch}
                  />
                  <Entry
                    register={register("exitLunch", { required: true })}
                    label="Entrada comedor:"
                    invalid={!!errors.exitLunch}
                  />
                </FieldGroup.Stack>
                <FieldGroup.Stack>
                  <Entry
                    register={register("entrySaturdayOffice", {
                      required: true,
                    })}
                    label="Entrada sabatina:"
                    invalid={!!errors.entrySaturdayOffice}
                  />
                  <Entry
                    register={register("exitSaturdayOffice", {
                      required: true,
                    })}
                    label="Salida sabatina:"
                    invalid={!!errors.exitSaturdayOffice}
                  />
                </FieldGroup.Stack>
                <Entry
                  register={register("scheduleDescription")}
                  label="Descripción del horario:"
                />
                {session?.user?.permissions.some(
                  (p) => p.text === "visualizar_salario"
                ) && (
                  <FieldGroup.Stack>
                    <Entry
                      className="text-center"
                      register={register("dailyWage", { required: true })}
                      label="Salario diario:"
                      invalid={!!errors.dailyWage}
                    />
                  </FieldGroup.Stack>
                )}
              </FieldGroup>
              <FieldGroup>
                <FieldGroup.Stack>
                  <FieldSelect
                    register={register("anniversaryLetter")}
                    options={[
                      { label: "Pendiente", value: "pending" },
                      { label: "Entregada", value: "ENTREGADA" },
                    ]}
                    label="Carta de aniversario:"
                  />
                  <FieldSelect
                    register={register("status")}
                    options={[
                      { value: 1, label: "Activo" },
                      { label: "Baja", value: 2 },
                    ]}
                    label="Status:"
                  />
                </FieldGroup.Stack>
                <FieldGroup.Stack>
                  <Entry
                    register={register("keyCONTPAQi")}
                    label="keyCONTPAQi:"
                  />
                  <Entry
                    register={register("keyAspelNOI")}
                    label="keyAspelNOI:"
                  />
                </FieldGroup.Stack>
                <Entry
                  register={register("dischargeReason")}
                  label="Motivo de la baja:"
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
                      <th className="border-end text-center">
                        <i className="bi bi-trash"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldsContacts.map((contact, index) => {
                      return (
                        <tr key={contact.id}>
                          <td valign="middle" className="border-bottom">
                            <Form.Control
                              {...register(`emergencyContacts.${index}.name`, {
                                required: true,
                              })}
                              size="sm"
                              className="border-0 shadow-none"
                              isInvalid={
                                !!errors.emergencyContacts?.[index]?.name
                              }
                            />
                          </td>
                          <td valign="middle" className="border-bottom">
                            <Form.Control
                              {...register(
                                `emergencyContacts.${index}.kinship`,
                                {
                                  required: true,
                                }
                              )}
                              size="sm"
                              className="border-0 shadow-none"
                              isInvalid={
                                !!errors.emergencyContacts?.[index]?.kinship
                              }
                            />
                          </td>
                          <td valign="middle" className="border-bottom">
                            <Form.Control
                              {...register(
                                `emergencyContacts.${index}.phone.internationalNumber`,
                                {
                                  required: true,
                                }
                              )}
                              size="sm"
                              className="border-0 shadow-none"
                              isInvalid={
                                !!errors.emergencyContacts?.[index]?.phone
                              }
                            />
                          </td>
                          <td
                            valign="middle"
                            className="border-bottom text-center"
                          >
                            <Button
                              size="sm"
                              variant="link"
                              onClick={() => removeContacts(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={4}>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() =>
                            appContacts({ name: "", kinship: "", phone: "" })
                          }
                        >
                          Agregar
                        </Button>
                      </td>
                    </tr>
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
                    <Entry
                      register={register("admissionDate")}
                      label="Inicio de relación:"
                      // invisible={id === "null"}
                      className="text-center"
                    />
                    <Entry
                      register={register("dischargeDate")}
                      label="Fin de relación:"
                      invisible={id === "null"}
                      className="text-center"
                      readonly
                    />
                  </FieldGroup.Stack>
                </FieldGroup>
                <FieldGroup>
                  <Entry
                    register={register("typeOfDischarge")}
                    label="Tipo de baja:"
                    readonly
                  />
                  <Entry
                    label=""
                    register={register("dischargeReason")}
                    as="textarea"
                    readonly
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
                      {employee?.reEntry?.map((re) => (
                        <tr key={re._id}>
                          <td className="border-bottom text-center">
                            {re.reEntryDate
                              ? formatDate(re.reEntryDate, "MM/dd/yyyy")
                              : null}
                          </td>
                          <td className="border-bottom text-center">
                            {re.dischargeDate
                              ? formatDate(re.dischargeDate, "MM/dd/yyyy")
                              : null}
                          </td>
                          <td className="border-bottom text-nowrap">
                            {re.dischargeReason}
                          </td>
                          <td className="border-bottom text-nowrap">
                            {re.typeOfDischarge}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Container>
          </FormPage>
          <FormPage title="Documentos" eventKey="documents">
            <Container className="mt-1">
              <Row>
                <Col md="12">
                  <Nav>
                    {session?.user?.permissions.some(
                      (p) => p.text === "crear_plantilla_de_documento"
                    ) && (
                      <Nav.Item>
                        <Nav.Link>Nueva plantilla</Nav.Link>
                      </Nav.Item>
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
                        <Accordion.Header>
                          {v.periodDescription}
                        </Accordion.Header>
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
        </FormBook>
      </FormView>
      <ModalUnsubscribe
        show={modalUnsubscribe}
        onHide={() => setModalUnsubscribe(!modalUnsubscribe)}
        id={Number(id)}
      />
    </>
  );
}

export default EmployeeFormView;
