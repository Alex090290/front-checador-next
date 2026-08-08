"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
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
  ModalBasicProps,
  Position,
} from "@/lib/definitions";

import { formatDate } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import {
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { TInputsEmployee } from "../../definition";
import { useRouter } from "next/navigation";
import { updateEmploye } from "@/app/actions/employee-actions";
import SuccessOverlay from "@/components/SuccessOverlay";
import ErrorOverlay from "@/components/ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type ModalAction = {
  id: number;
  employee?: Employee | null;
  departments?: Department[];
  branches?: Branch[];
  employees?: Employee[];
};

function formatEmployeeValues(employee?: Employee | null): TInputsEmployee {
  return {
    name: employee?.name || "",
    lastName: employee?.lastName || "",
    emailPersonal: employee?.emailPersonal || "",
    phonePersonal: employee?.phonePersonal?.internationalNumber || "",
    idCheck: Number(employee?.idCheck) || 0,
    passwordCheck: Number(employee?.passwordCheck) || 0,
    entryOffice: employee?.scheduleOffice?.entry || "",
    entrySaturdayOffice: employee?.scheduleSaturday?.entry || "",
    exitOffice: employee?.scheduleOffice?.exit || "",
    exitSaturdayOffice: employee?.scheduleSaturday?.exit || "",
    exitLunch: employee?.scheduleLunch?.exit || "",
    entryLunch: employee?.scheduleLunch?.entry || "",
    idDepartment: employee?.department || null,
    branch: employee?.branch?.id || null,
    idPosition: employee?.position?.id || null,
    gender: employee?.gender || "MASCULINO",
    status: employee?.status || 1,
    phoneCompany: employee?.phoneCompany?.internationalNumber || "",
    phoneExtCompany: employee?.phoneExtCompany || 0,
    address: {
      street: employee?.address?.street || "",
      country: employee?.address?.country || "México",
      municipality: employee?.address?.municipality || "",
      neighborhood: employee?.address?.neighborhood || "",
      numberIn: employee?.address?.numberIn || "",
      numberOut: employee?.address?.numberOut || "",
      state: employee?.address?.state || "",
      zipCode: String(employee?.address?.zipCode || ""),
    },
    emailCompany: employee?.emailCompany || "",
    scheduleDescription: employee?.scheduleDescription || "",
    policies: employee?.policies || "",
    group: employee?.group || "",
    homePhone: employee?.homePhone?.internationalNumber || "",
    sons: employee?.sons || 0,
    daughters: employee?.daughters || 0,
    birthDate: employee?.birthDate
      ? formatDate(employee.birthDate, "yyyy-MM-dd")
      : "",
    nationality: employee?.nationality || "",
    socialSecurityNumber: employee?.socialSecurityNumber || "",
    rfc: employee?.rfc || "",
    curp: employee?.curp || "",
    weight: employee?.weight || null,
    height: employee?.height || null,
    bloodType: employee?.bloodType || "",
    constitution: employee?.constitution || "",
    healthStatus: employee?.healthStatus || "",
    education: employee?.education || "",
    skills: employee?.skills || "",
    comments: employee?.comments || "",
    emergencyContacts: employee?.emergencyContacts || [],
    keyAspelNOI: employee?.keyAspelNOI || "",
    keyCONTPAQi: employee?.keyCONTPAQi || "",
    admissionDate: employee?.admissionDate
      ? formatDate(employee.admissionDate, "yyyy-MM-dd")
      : "",
    anniversaryLetter: employee?.anniversaryLetter || "",
    visibleRecords: employee?.visibleRecords || false,
    dischargeDate: employee?.dischargeDate
      ? formatDate(employee.dischargeDate, "yyyy-MM-dd")
      : null,
    dischargeReason: employee?.dischargeReason || "",
    typeOfDischarge: employee?.typeOfDischarge || "",
    role: employee?.role || [],
    dailyWage: employee?.dailyWage || 0,
    foodBaucher: employee?.foodBaucher ?? {
      uiid: "",
      cardNumber: "",
    },
  };
}

export default function FormUpdateEmployee({
  onHide,
  id,
  employee,
  departments = [],
  branches = [],
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TInputsEmployee>({
    defaultValues: formatEmployeeValues(employee),
  });

  const { modalError, modalConfirm } = useModals();
  const [loading, setLoading] = useState(false);
  const [puestos, setPuestos] = useState<Position[]>([]);
  const router = useRouter();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const {
    append: appendContact,
    fields: contactFields,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const departmentId = watch("idDepartment.id");

  useEffect(() => {
    setLoading(true);
    try {
      reset(formatEmployeeValues(employee));
    } catch {
      modalError("No se pudo cargar la información del empleado");
    } finally {
      setLoading(false);
    }
  }, [employee, reset, modalError]);

  useEffect(() => {
    if (!departmentId) {
      setPuestos([]);
      return;
    }

    const positions =
      departments.find((dep) => dep.id === departmentId)?.positions || [];
    setPuestos(positions);
  }, [departmentId, departments]);

  // const managerOptions = useMemo(
  //   () =>
  //     employees.map((em) => ({
  //       id: em.id || 0,
  //       displayName: `${em.name.toUpperCase()} ${em.lastName.toUpperCase()}`,
  //       name: `${em.name.toUpperCase} ${em.lastName.toUpperCase}`,
  //     })),
  //   [employees]
  // );


  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        id: b.id || 0,
        displayName: `${b.name.toUpperCase()}`,
        name: `${b.name.toUpperCase()}`,
      })),
    [branches]
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        id: d.id || 0,
        displayName: `${d.nameDepartment.toUpperCase()}`,
        name: `${d.nameDepartment.toUpperCase()}`,
      })),
    [departments]
  );

  const positionOptions = useMemo(
    () =>
      puestos.map((p) => ({
        id: p.id || 0,
        displayName: `${p.namePosition.toUpperCase()}`,
        name: `${p.namePosition.toUpperCase()}`,
      })),
    [puestos]
  );

  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar el usuario?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Actualizando empleado...");

        const res = await updateEmploye({ data, id });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo actualizar el empleado");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Empleado actualizado correctamente");
        setFeedback("success");
          router.refresh();      
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      }
    });
  };

  const onError: SubmitErrorHandler<TInputsEmployee> = () => {
    alert("Faltan campos");
    // modalError("Faltan campos requeridos por llenar");
  };

  return (
    <>
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Guardando..."} />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "success"}>
        <SuccessOverlay
          message={feedbackMsg}
          onDone={() => {
            setFeedback(null);
            onHide();
          }}
        />
      </ConditionalRender>

      <ConditionalRender cond={feedback === "error"}>
        <ErrorOverlay
          message={feedbackMsg}
          onDone={() => setFeedback(null)}
        />
      </ConditionalRender>

      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Empleado</h4>
            <p className="text-muted mb-0">
              Administra la información personal, laboral y de contacto del empleado.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Editar
          </span>
        </div>

        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <fieldset disabled={loading || isSubmitting}>
            <FormBook dKey="personalInfo">

              {/* =============== Información Personal ===================*/}
              <FormPage title="Información Personal" eventKey="personalInfo">

                <Card className="border rounded-4 mb-3 mt-1">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-person text-primary" />
                      <h6 className="mb-0 fw-bold">Datos generales</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry
                          register={register("name", { required: "Nombre requerido" })}
                          label="Nombre:"
                          invalid={!!errors.name}
                          feedBack={errors.name?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("lastName", { required: "Apellidos requeridos" })}
                          label="Apellidos:"
                          invalid={!!errors.lastName}
                          feedBack={errors.lastName?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("birthDate", { required: "Fecha de nacimiento requerida" })}
                          type="date"
                          label="Nacimiento:"
                          invalid={!!errors.birthDate}
                          feedBack={errors.birthDate?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("nationality", { required: "Nacionalidad requerida" })}
                          label="Nacionalidad:"
                          invalid={!!errors.nationality}
                          feedBack={errors.nationality?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <FieldSelect
                          register={register("gender", { required: "Género requerido" })}
                          options={[
                            { value: "MASCULINO", label: "MASCULINO" },
                            { value: "FEMENINO", label: "FEMENINO" },
                          ]}
                          label="Género:"
                          invalid={!!errors.gender}
                          feedBack={errors.gender?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-telephone text-success" />
                      <h6 className="mb-0 fw-bold">Contacto</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry
                          register={register("emailPersonal")}
                          label="Correo personal:"
                          invalid={!!errors.emailPersonal}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("phonePersonal", { required: "Celular requerido" })}
                          label="Celular:"
                          invalid={!!errors.phonePersonal}
                          feedBack={errors.phonePersonal?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("homePhone")}
                          label="Teléfono fijo:"
                          className="border"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-house text-warning" />
                      <h6 className="mb-0 fw-bold">Domicilio</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={8}>
                        <Entry
                          register={register("address.street", { required: "Calle requerida" })}
                          label="Calle:"
                          invalid={!!errors.address?.street}
                          feedBack={errors.address?.street?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={4}>
                        <Entry
                          register={register("address.numberOut", { required: "No. exterior requerido" })}
                          label="No. Exterior:"
                          invalid={!!errors.address?.numberOut}
                          feedBack={errors.address?.numberOut?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={4}>
                        <Entry
                          register={register("address.numberIn")}
                          label="No. Interior:"
                          className="border"
                        />
                      </Col>
                      <Col md={4}>
                        <Entry
                          register={register("address.neighborhood", { required: "Colonia requerida" })}
                          label="Colonia:"
                          invalid={!!errors.address?.neighborhood}
                          feedBack={errors.address?.neighborhood?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={4}>
                        <Entry
                          register={register("address.zipCode", { required: "C.P. requerido" })}
                          label="C.P.:"
                          invalid={!!errors.address?.zipCode}
                          feedBack={errors.address?.zipCode?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("address.municipality")}
                          label="Municipio:"
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("address.state", { required: "Estado requerido" })}
                          label="Estado:"
                          invalid={!!errors.address?.state}
                          feedBack={errors.address?.state?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                      <Col md={12}>
                        <Entry
                          register={register("address.country", { required: "País requerido" })}
                          label="País:"
                          invalid={!!errors.address?.country}
                          feedBack={errors.address?.country?.message}
                          className="border text-uppercase"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-card-checklist text-info" />
                      <h6 className="mb-0 fw-bold">Identificación</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry
                          register={register("socialSecurityNumber", { required: "NSS requerido" })}
                          label="NSS:"
                          invalid={!!errors.socialSecurityNumber}
                          feedBack={errors.socialSecurityNumber?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={3}>
                        <Entry
                          register={register("rfc", { required: "RFC requerido" })}
                          label="R.F.C.:"
                          invalid={!!errors.rfc}
                          feedBack={errors.rfc?.message}
                          className="text-uppercase border"
                        />
                      </Col>
                      <Col md={3}>
                        <Entry
                          register={register("curp", { required: "CURP requerido" })}
                          label="CURP:"
                          invalid={!!errors.curp}
                          feedBack={errors.curp?.message}
                          className="text-uppercase border"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-heart-pulse text-danger" />
                      <h6 className="mb-0 fw-bold">Salud y complementarios</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={4}>
                        <Entry register={register("bloodType")} label="Grupo sanguíneo:" className="border text-uppercase" />
                      </Col>
                      <Col md={4}>
                        <Entry register={register("weight")} label="Peso:" className="border" />
                      </Col>
                      <Col md={4}>
                        <Entry register={register("height")} label="Altura:" className="border" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("constitution")} label="Complexión:" className="border text-uppercase" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("healthStatus")} label="Estado de salud:" className="border text-uppercase" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("education")} label="Formación académica:" className="border text-uppercase" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("skills")} label="Habilidades:" className="border text-uppercase" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("sons")} label="Hijos:" className="border" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("daughters")} label="Hijas:" className="border" />
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Observaciones generales:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            className="border text-uppercase"
                            {...register("comments")}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </FormPage>

              {/* =============== Información Laboral ===================*/}
              <FormPage title="Información Laboral" eventKey="jobInfo">

                <Card className="border rounded-4 mb-3 mt-1">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-diagram-3 text-primary" />
                      <h6 className="mb-0 fw-bold">Puesto y organización</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <RelationField
                          register={register("idDepartment.id", { required: "Departamento requerido" })}
                          options={departmentOptions}
                          label="Departamento:"
                          control={control}
                          callBackMode="id"
                          invalid={!!errors.idDepartment}
                          className="text-uppercase"
                        />
                      </Col>
                      <Col md={6}>
                        <RelationField
                          register={register("idPosition", { required: "Puesto requerido" })}
                          options={positionOptions}
                          label="Puesto:"
                          control={control}
                          callBackMode="id"
                          invalid={!!errors.idPosition}
                          className="text-uppercase"
                        />
                      </Col>
                      {/* <Col md={6}>
                        <RelationField
                          register={register("idDepartment.idLeader")}
                          options={managerOptions}
                          label="Líder:"
                          control={control}
                          callBackMode="id"
                          className="text-uppercase"
                        />
                      </Col> */}
                      <Col md={6}>
                        <RelationField
                          register={register("branch", { required: "Sucursal requerida" })}
                          options={branchOptions}
                          label="Sucursal:"
                          control={control}
                          callBackMode="id"
                          invalid={!!errors.branch}
                          className="text-uppercase"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-envelope text-success" />
                      <h6 className="mb-0 fw-bold">Contacto de oficina</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={4}>
                        <Entry register={register("phoneCompany")} label="Teléfono de oficina:" className="border" />
                      </Col>
                      <Col md={4}>
                        <Entry register={register("phoneExtCompany")} label="Extensión:" className="border" />
                      </Col>
                      <Col md={4}>
                        <Entry register={register("emailCompany")} label="Correo:" className="border" />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-fingerprint text-warning" />
                      <h6 className="mb-0 fw-bold">Checador</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry
                          register={register("idCheck", { required: "ID checador requerido" })}
                          label="ID Checador:"
                          invalid={!!errors.idCheck}
                          feedBack={errors.idCheck?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("passwordCheck", { required: "Contraseña requerida" })}
                          label="Contraseña de checador:"
                          invalid={!!errors.passwordCheck}
                          feedBack={errors.passwordCheck?.message}
                          className="border"
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-clock text-info" />
                      <h6 className="mb-0 fw-bold">Horario</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry
                          register={register("entryOffice", { required: "Entrada requerida" })}
                          label="Hora Entrada:"
                          type="time"
                          invalid={!!errors.entryOffice}
                          feedBack={errors.entryOffice?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("exitOffice", { required: "Salida requerida" })}
                          label="Hora Salida:"
                          type="time"
                          invalid={!!errors.exitOffice}
                          feedBack={errors.exitOffice?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("entryLunch", { required: "Entrada comedor requerida" })}
                          label="Hora Entrada Comedor:"
                          type="time"
                          invalid={!!errors.entryLunch}
                          feedBack={errors.entryLunch?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("exitLunch", { required: "Salida comedor requerida" })}
                          label="Hora Salida Comedor:"
                          type="time"
                          invalid={!!errors.exitLunch}
                          feedBack={errors.exitLunch?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("entrySaturdayOffice", { required: "Entrada sabatina requerida" })}
                          label="Hora Entrada Sabatina:"
                          type="time"
                          invalid={!!errors.entrySaturdayOffice}
                          feedBack={errors.entrySaturdayOffice?.message}
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <Entry
                          register={register("exitSaturdayOffice", { required: "Salida sabatina requerida" })}
                          label="Hora Salida Sabatina:"
                          type="time"
                          invalid={!!errors.exitSaturdayOffice}
                          feedBack={errors.exitSaturdayOffice?.message}
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
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4 mb-3">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-cash-coin text-danger" />
                      <h6 className="mb-0 fw-bold">Nómina y status</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry register={register("dailyWage")} label="Salario diario:" className="border" />
                      </Col>
                      <Col md={6}>
                        <FieldSelect
                          register={register("status")}
                          options={[
                            { value: 1, label: "ACTIVO" },
                            { value: 2, label: "BAJA" },
                          ]}
                          label="Status:"
                          className="border"
                        />
                      </Col>
                      <Col md={6}>
                        <FieldSelect
                          register={register("anniversaryLetter")}
                          options={[
                            { label: "PENDIENTE", value: "pending" },
                            { label: "ENTREGADA", value: "ENTREGADA" },
                          ]}
                          label="Carta de aniversario:"
                          className="border"
                        />
                      </Col>
                      {/* <Col md={6}>
                        <Entry register={register("dischargeReason")} label="Motivo de la baja:" className="border" />
                      </Col> */}
                      <Col md={6}>
                        <Entry register={register("keyCONTPAQi")} label="keyCONTPAQi:" className="border" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("keyAspelNOI")} label="keyAspelNOI:" className="border" />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border rounded-4">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-credit-card-2-front text-secondary" />
                      <h6 className="mb-0 fw-bold">Vales de despensa</h6>
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
              </FormPage>

              {/* =============== Contactos ===================*/}
              <FormPage title="Contactos" eventKey="contacts">

                <Card className="border rounded-4 mb-3 mt-1">
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
                              <i className="bi bi-trash" />
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {contactFields.map((contact, index) => (
                            <tr key={contact.id}>
                              <td valign="middle" className="border-bottom">
                                <Form.Control
                                  {...register(`emergencyContacts.${index}.name`, { required: true })}
                                  className="border-0 shadow-none text-uppercase"
                                  isInvalid={!!errors.emergencyContacts?.[index]?.name}
                                />
                              </td>

                              <td valign="middle" className="border-bottom">
                                <Form.Control
                                  {...register(`emergencyContacts.${index}.kinship`, { required: true })}
                                  className="border-0 shadow-none text-uppercase"
                                  isInvalid={!!errors.emergencyContacts?.[index]?.kinship}
                                />
                              </td>

                              <td valign="middle" className="border-bottom">
                                <Form.Control
                                  {...register(`emergencyContacts.${index}.phone.internationalNumber`, { required: true })}
                                  className="border-0 shadow-none"
                                  isInvalid={!!errors.emergencyContacts?.[index]?.phone}
                                />
                              </td>

                              <td valign="middle" className="border-bottom text-center">
                                <Button
                                  type="button"
                                  variant="link"
                                  onClick={() => removeContact(index)}
                                >
                                  <i className="bi bi-trash text-danger" />
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
                                  appendContact({
                                    name: "",
                                    kinship: "",
                                    phone: { internationalNumber: "" },
                                  } as never)
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
              </FormPage>

              {/* =============== Ingresos y Bajas ===================*/}
              <FormPage title="Ingresos y Bajas" eventKey="historical">
                <Card className="border rounded-4 mt-1">
                  <Card.Body>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <i className="bi bi-calendar-range text-warning" />
                      <h6 className="mb-0 fw-bold">Historial laboral</h6>
                    </div>

                    <Row className="g-3">
                      <Col md={6}>
                        <Entry register={register("admissionDate")} label="Inicio de relación:" type="date" className="border text-uppercase" />
                      </Col>
                      <Col md={6}>
                        <Entry register={register("dischargeDate")} label="Fin de relación:" type="date" className="border text-uppercase" />
                      </Col>
                      <Col md={12}>
                        <Entry register={register("typeOfDischarge")} label="Tipo de baja:" className="border text-uppercase" />
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Motivo / detalle de baja:</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            className="border text-uppercase"
                            {...register("dischargeReason")}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </FormPage>
            </FormBook>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onHide}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>

          </fieldset>
        </Form>
      </div>
    </>
  )
}