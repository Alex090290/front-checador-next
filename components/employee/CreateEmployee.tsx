"use client";

import { createEmployee } from "@/app/actions/employee-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import {
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  Branch,
  Department,
  Employee,
  Position,
} from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { useSession } from "next-auth/react";
import { TInputsEmployee } from "@/app/(auth)/app/employee/definition";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type Props = {
  departments: Department[];
  branches: Branch[];
  employees: Employee[];
};

const DEFAULT_VALUES: TInputsEmployee = {
  name: "",
  lastName: "",
  emailPersonal: "",
  phonePersonal: "",
  idCheck: null,
  passwordCheck: null,
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
  sons: null,
  daughters: null,
  birthDate: "",
  nationality: "",
  socialSecurityNumber: "",
  rfc: "",
  curp: "",
  weight: null,
  height: null,
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
  foodBaucher: {
    uiid: "",
    cardNumber: "",
  }
};

export default function CreateEmployeeComponent({
  departments,
  branches,
}: Props) {
  const {
    watch,
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputsEmployee>({
    defaultValues: DEFAULT_VALUES,
  });

  const { data: session } = useSession();
  const { modalConfirm } = useModals();
  const router = useRouter();


  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const {
    append: appContacts,
    fields: fieldsContacts,
    remove: removeContacts,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const [deps] = watch(["idDepartment.id"]);
  const [puestos, setPuestos] = useState<Position[]>([]);
  const { replace } = useFieldArray({ control, name: "emergencyContacts" });

  useEffect(() => {
    if (deps) {
      const positions: Position[] =
        departments.find((dep) => dep.id === deps)?.positions || [];
      setPuestos(positions);
    } else {
      setPuestos([]);
    }
  }, [deps, departments]);

  const handleBack = () => {
    router.push("/app/employee");
  };

  const handleClear = () => {
    reset(DEFAULT_VALUES);
    replace([]); // fuerza que el array visual se vacíe también
  };

  //Alerta para antes de guardar 
  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar el empleado?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando empleado...");

        const res = await createEmployee({ data });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo crear al empleado");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Empleado creado correctamente");
        setFeedback("success");
        router.push("/app/employee");
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Actualizando..."} />
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

      <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
        <Row className="m-2">
          <Col xs={12} md={12} lg={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                {/* ENCABEZADO */}
                <div>
                  <h1 className="mb-1">Crear empleado</h1>
                  <p className="text-muted mb-0">
                    Registra la información personal, laboral y de contacto.
                  </p>
                </div>

                {/* BOTONES PRINCIPALES */}
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="outline-secondary"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleBack}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleClear}
                    disabled={isSubmitting || !isDirty}
                  >
                    Limpiar
                  </Button>

                  <Button
                    type="submit"
                    className="bg-success border-success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>

              <Card className="rounded-4 shadow-sm border">
                <Card.Body className="p-3 p-md-5">
                  <FormBook dKey="personalInfo">

                    {/* ================== INFORMACION PERSONAL ======================*/}
                    <FormPage title="Información personal" eventKey="personalInfo">
                      <div className="mb-4">
                        <h5 className="fw-semibold mt-3">Información personal</h5>
                        <p className="text-muted mb-1">
                          Captura los datos generales, domicilio y documentación del empleado.
                        </p>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-person text-primary" />
                              <h6 className="mb-0 fw-bold">Información personal</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry
                                  register={register("name", { required: true })}
                                  label="Nombre:"
                                  invalid={!!errors.name}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("lastName", { required: true })}
                                  label="Apellidos:"
                                  invalid={!!errors.lastName}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("emailPersonal")}
                                  label="Correo personal:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("birthDate", { required: true })}
                                  type="date"
                                  label="Nacimiento:"
                                  invalid={!!errors.birthDate}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("phonePersonal", { required: true })}
                                  label="Celular:"
                                  invalid={!!errors.phonePersonal}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("homePhone")}
                                  label="Teléfono fijo:"
                                  className="border text-uppercase"
                                />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-geo-alt text-success" />
                              <h6 className="mb-0 fw-bold">Domicilio</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={12}>
                                <Entry
                                  register={register("address.street", { required: true })}
                                  label="Calle:"
                                  invalid={!!errors.address?.street}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.numberOut", { required: true })}
                                  label="No. Exterior:"
                                  invalid={!!errors.address?.numberOut}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.numberIn")}
                                  label="No. Interior:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.neighborhood", { required: true })}
                                  label="Colonia:"
                                  invalid={!!errors.address?.neighborhood}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.zipCode", { required: true })}
                                  label="C.P."
                                  invalid={!!errors.address?.zipCode}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.municipality", { required: true })}
                                  label="Municipio:"
                                  invalid={!!errors.address?.municipality}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.state", { required: true })}
                                  label="Estado:"
                                  invalid={!!errors.address?.state}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("address.country", { required: true })}
                                  label="País:"
                                  invalid={!!errors.address?.country}
                                  className="border text-uppercase"
                                />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-file-earmark-text text-warning" />
                              <h6 className="mb-0 fw-bold">Datos oficiales</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry
                                  register={register("nationality", { required: true })}
                                  label="Nacionalidad:"
                                  invalid={!!errors.nationality}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("socialSecurityNumber", { required: "El NSS debe contener exactamente 11 dígitos" })}
                                  label="NSS:"
                                  invalid={!!errors.socialSecurityNumber}
                                  feedBack={errors.socialSecurityNumber?.message}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("rfc", { required: true })}
                                  label="R.F.C."
                                  className="border text-uppercase"
                                  invalid={!!errors.rfc}
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("curp", { required: true })}
                                  label="CURP:"
                                  className="border text-uppercase"
                                  invalid={!!errors.curp}
                                  feedBack={errors.curp?.message}
                                />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-heart-pulse text-danger" />
                              <h6 className="mb-0 fw-bold">Datos físicos y de salud</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <FieldSelect
                                  options={[
                                    { value: "MASCULINO", label: "MASCULINO" },
                                    { value: "FEMENINO", label: "FEMENINO" },
                                  ]}
                                  label="Género:"
                                  register={register("gender", { required: true })}
                                  invalid={!!errors.gender}
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("bloodType", { required: true })}
                                  label="Grupo sanguíneo:"
                                  className="border text-uppercase"
                                  invalid={!!errors.bloodType}
                                />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("weight", { setValueAs: (v) => (v === "" ? null : Number(v)) })} label="Peso:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("height", { setValueAs: (v) => (v === "" ? null : Number(v)) })} label="Altura:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("constitution")} label="Complexión:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("healthStatus")} label="Estado de salud:" className="border text-uppercase" />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-mortarboard text-info" />
                              <h6 className="mb-0 fw-bold">Formación y familia</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={12}>
                                <Entry register={register("education")} label="Formación académica:" className="border text-uppercase" />
                              </Col>

                              <Col md={12}>
                                <Entry register={register("skills")} label="Habilidades:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("sons")} label="Hijos:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("daughters")} label="Hijas:" className="border text-uppercase" />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-chat-square-text text-secondary" />
                              <h6 className="mb-0 fw-bold">Observaciones</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="fw-semibold">Observaciones generales:</Form.Label>
                                  <Form.Control as="textarea" {...register("comments")} rows={6} className="border text-uppercase" />
                                </Form.Group>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </div>
                    </FormPage>

                    {/* ============= INFORMACION LABORAL =============== */}
                    <FormPage title="Información laboral" eventKey="jobInfo">
                      <div className="mb-4">
                        <h5 className="fw-semibold mt-3">Información laboral</h5>
                        <p className="text-muted mb-1">
                          Captura los datos de oficina, puesto, horario y control interno.
                        </p>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-building text-primary" />
                              <h6 className="mb-0 fw-bold">Datos laborales</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry
                                  register={register("phoneCompany")}
                                  label="Teléfono de oficina:"
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("phoneExtCompany")}
                                  label="Extensión:"
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("emailCompany")}
                                  label="Correo:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
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
                                  invalid={!!errors.idDepartment}
                                />
                              </Col>

                              <Col md={6}>
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
                              </Col>

                              {/* <Col md={6}>
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
        />
      </Col> */}

                              <Col md={6}>
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
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-clock-history text-success" />
                              <h6 className="mb-0 fw-bold">Checador y horario</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry
                                  register={register("idCheck", { required: "El ID de check debe ser mayor a 0" })}
                                  label="ID Checador:"
                                  invalid={!!errors.idCheck}
                                  feedBack={errors.idCheck?.message}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("passwordCheck", { required: "El password de check debe tener al menos 4 dígitos" })}
                                  label="Contraseña de checador:"
                                  invalid={!!errors.passwordCheck}
                                  feedBack={errors.passwordCheck?.message}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("entryOffice", { required: true })}
                                  label="Hora Entrada:"
                                  type="time"
                                  invalid={!!errors.entryOffice}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("exitOffice", { required: true })}
                                  label="Hora Salida:"
                                  type="time"
                                  invalid={!!errors.exitOffice}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("entryLunch", { required: true })}
                                  label="Hora Entrada Comedor:"
                                  type="time"
                                  invalid={!!errors.entryLunch}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("exitLunch", { required: true })}
                                  label="Hora Salida Comedor:"
                                  type="time"
                                  invalid={!!errors.exitLunch}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("entrySaturdayOffice", { required: true })}
                                  label="Hora Entrada sabatina:"
                                  type="time"
                                  invalid={!!errors.entrySaturdayOffice}
                                  className="border"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("exitSaturdayOffice", { required: true })}
                                  label="Hora Salida sabatina:"
                                  type="time"
                                  invalid={!!errors.exitSaturdayOffice}
                                  className="border"
                                />
                              </Col>

                              <Col md={12}>
                                <Entry
                                  register={register("scheduleDescription")}
                                  label="Descripción del horario:"
                                  className="border"
                                />
                              </Col>

                              {session?.user?.permissions.some(
                                (p) => p.text === "visualizar_salario"
                              ) && (
                                  <Col md={6}>
                                    <Entry
                                      className="border"
                                      register={register("dailyWage", { required: true })}
                                      label="Salario diario:"
                                      invalid={!!errors.dailyWage}
                                      prefix="$"
                                    />
                                  </Col>
                                )}
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-gear text-warning" />
                              <h6 className="mb-0 fw-bold">Administración</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <FieldSelect
                                  register={register("anniversaryLetter")}
                                  options={[
                                    { label: "Pendiente", value: "pending" },
                                    { label: "Entregada", value: "ENTREGADA" },
                                  ]}
                                  label="Carta de aniversario:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <FieldSelect
                                  register={register("status")}
                                  options={[
                                    { value: 1, label: "Activo" },
                                    { label: "Baja", value: 2 },
                                  ]}
                                  label="Status:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("keyCONTPAQi")} label="keyCONTPAQi:" className="border text-uppercase" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("keyAspelNOI")} label="keyAspelNOI:" className="border text-uppercase" />
                              </Col>

                              {/* <Col md={12}>
                                <Entry type="hidden" register={register("dischargeReason")} label="Motivo de la baja:" className="border text-uppercase" />
                              </Col> */}
                            </Row>
                          </Card.Body>
                        </Card>

                        <Card className="border rounded-4">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-credit-card text-info" />
                              <h6 className="mb-0 fw-bold">Vale de despensa</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry register={register("foodBaucher.uiid")} label="UIID:" className="border" />
                              </Col>

                              <Col md={6}>
                                <Entry register={register("foodBaucher.cardNumber")} label="Número de tarjeta:" className="border" />
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </div>
                    </FormPage>

                    {/* ============= INFORMACION DE CONTACTOS =============== */}
                    <FormPage title="Contactos" eventKey="contacts">
                      <div className="mb-4">
                        <h5 className="fw-semibold mt-3">Contactos de emergencia</h5>
                        <p className="text-muted mb-1">
                          Agrega los contactos relacionados al empleado.
                        </p>

                        <Card className="border rounded-4 mb-3">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-person-lines-fill text-danger" />
                              <h6 className="mb-0 fw-bold">Contactos de emergencia</h6>
                            </div>

                            <div className="border rounded-2 overflow-hidden">
                              <Table size="sm" borderless hover responsive className="mb-0">
                                <thead>
                                  <tr className="border-bottom table-active">
                                    <th className="border-end">Nombre</th>
                                    <th className="border-end">Parentesco</th>
                                    <th className="border-end">Contacto</th>
                                    <th className="border-end text-center">
                                      <i className="bi bi-trash"></i>
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {fieldsContacts.map((contact, index) => (
                                    <tr key={contact.id}>
                                      <td valign="middle" className="border-bottom">
                                        <Form.Control
                                          {...register(`emergencyContacts.${index}.name`, {
                                            required: true,
                                          })}
                                          className="border-0 shadow-none text-uppercase"
                                          isInvalid={!!errors.emergencyContacts?.[index]?.name}
                                        />
                                      </td>

                                      <td valign="middle" className="border-bottom">
                                        <Form.Control
                                          {...register(`emergencyContacts.${index}.kinship`, {
                                            required: true,
                                          })}
                                          className="border-0 shadow-none text-uppercase"
                                          isInvalid={!!errors.emergencyContacts?.[index]?.kinship}
                                        />
                                      </td>

                                      <td valign="middle" className="border-bottom">
                                        <Form.Control
                                          {...register(
                                            `emergencyContacts.${index}.phone.internationalNumber`,
                                            { required: true }
                                          )}
                                          className="border-0 shadow-none"
                                          isInvalid={!!errors.emergencyContacts?.[index]?.phone}
                                          prefix="+52"
                                        />
                                      </td>

                                      <td valign="middle" className="border-bottom text-center">
                                        <Button
                                          type="button"
                                          variant="link"
                                          onClick={() => removeContacts(index)}
                                        >
                                          <i className="bi bi-trash text-danger"></i>
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}

                                  <tr>
                                    <td colSpan={4}>
                                      <Button
                                        type="button"
                                        variant="link"
                                        onClick={() =>
                                          appContacts({
                                            name: "",
                                            kinship: "",
                                            phone: "",
                                          })
                                        }
                                      >
                                        <i className="bi bi-plus-lg me-1" />
                                        Agregar
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    </FormPage>

                    {/* ============= INFORMACION DE INGRESOS Y BAJAS =============== */}
                    <FormPage title="Ingresos y bajas" eventKey="historical">
                      <div>
                        <h5 className="fw-semibold mt-3">Ingresos y bajas</h5>
                        <p className="text-muted mb-1">
                          Captura la información de relación laboral y baja.
                        </p>

                        <Card className="border rounded-4">
                          <Card.Body>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <i className="bi bi-calendar-x text-primary" />
                              <h6 className="mb-0 fw-bold">Relación laboral</h6>
                            </div>

                            <Row className="g-3">
                              <Col md={6}>
                                <Entry
                                  register={register("admissionDate")}
                                  label="Inicio de relación:"
                                  className="border text-uppercase"
                                  type="date"
                                />
                              </Col>

                              {/* <Col md={6}>
                                <Entry
                                  register={register("dischargeDate")}
                                  label="Fin de relación:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  register={register("typeOfDischarge")}
                                  label="Tipo de baja:"
                                  className="border text-uppercase"
                                />
                              </Col>

                              <Col md={6}>
                                <Entry
                                  label="Motivo de baja:"
                                  register={register("dischargeReason")}
                                  as="textarea"
                                  rows={1}
                                  className="border text-uppercase"
                                />
                              </Col> */}
                            </Row>
                          </Card.Body>
                        </Card>
                      </div>
                    </FormPage>
                  </FormBook>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}