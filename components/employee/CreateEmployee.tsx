"use client";

import { createEmployee } from "@/app/actions/employee-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import {
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
  Position,
} from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Button,
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
  foodBaucher: {
    uiid: "",
    cardNumber: "",
  }
};

export default function CreateEmployeeComponent({
  departments,
  branches,
  employees,
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
  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

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

  useEffect(() => {
    if (deps) {
      const positions: Position[] =
        departments.find((dep) => dep.id === deps)?.positions || [];
      setPuestos(positions);
    } else {
      setPuestos([]);
    }
  }, [deps, departments]);

  //Alerta para antes de guardar 
  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar el empleado?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando Empleado...");

        const res = await createEmployee({ data });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/app/constancy")
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando empleado..."} />
      </ConditionalRender>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* ============================================ */}
        {/* // Aquí inicia la pagina Empleados  */}
        {/* ============================================ */}
        <div className="d-flex justify-content-between align-items-center m-4 ms-0">
          <h1 className="mb-0">Crear empleado</h1>

          <div className="d-flex gap-2">
            <Button type="submit"
              className="btn-success"
              disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => reset(DEFAULT_VALUES)}
              disabled={isSubmitting || !isDirty}
            >
              Limpiar
            </Button>
          </div>
        </div>

        {/* ============================================ */}
        {/* //Apartado Información Personal */}
        {/* ============================================ */}
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

              <FieldGroup>
                <Entry
                  register={register("address.street", { required: true })}
                  label="Calle:"
                  invalid={!!errors.address?.street}
                />
                <FieldGroup.Stack>
                  <Entry
                    register={register("address.numberOut", { required: true })}
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
                    register={register("address.neighborhood", { required: true })}
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
                    invalid={!!errors.birthDate}
                  />
                  <Entry
                    register={register("nationality", { required: true })}
                    label="Nacionalidad:"
                    invalid={!!errors.nationality}
                  />
                </FieldGroup.Stack>
                <FieldGroup.Stack>
                  <Entry
                    register={register("socialSecurityNumber", { required: true })}
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
            </PageSheet>
          </FormPage>

          {/* ============================================ */}
          {/* // Apartado Información laboral  */}
          {/* ============================================ */}
          <FormPage title="Información Laboral" eventKey="jobInfo">
            <PageSheet>

              {/* ======================================== */}
              <FieldGroup>
                <Row className="g-2">
                  <Col md={12}>
                    <Entry
                      register={register("phoneCompany")}
                      label="Teléfono de oficina:"
                    />
                    <Entry
                      register={register("phoneExtCompany")}
                      label="Extensión:"
                    />

                    <Entry register={register("emailCompany")} label="Correo:" />


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
              </FieldGroup>
              {/* ======================================== */}

              <FieldGroup>
                <Row className="g-2">
                  <Col md={12}>
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

                    <Entry
                      register={register("entrySaturdayOffice", { required: true })}
                      label="Entrada sabatina:"
                      invalid={!!errors.entrySaturdayOffice}
                    />
                    <Entry
                      register={register("exitSaturdayOffice", { required: true })}
                      label="Salida sabatina:"
                      invalid={!!errors.exitSaturdayOffice}
                    />

                    <Entry
                      register={register("scheduleDescription")}
                      label="Descripción del horario:"
                    />

                    {session?.user?.permissions.some(
                      (p) => p.text === "visualizar_salario"
                    ) && (
                        <FieldGroup>
                          <Entry
                            className="text-center"
                            register={register("dailyWage", { required: true })}
                            label="Salario diario:"
                            invalid={!!errors.dailyWage}
                          />
                        </FieldGroup>
                      )}
                  </Col>
                </Row>
              </FieldGroup>

              {/* ======================================== */}

              <FieldGroup>
                <Row className="g-2">
                  <Col md={12}>
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

                    <Entry
                      register={register("keyCONTPAQi")}
                      label="keyCONTPAQi:"
                    />
                    <Entry
                      register={register("keyAspelNOI")}
                      label="keyAspelNOI:"
                    />

                    <Entry
                      register={register("dischargeReason")}
                      label="Motivo de la baja:"
                    />
                  </Col>
                </Row>
              </FieldGroup>

              {/* =========================================== */}
              <FieldGroup>
                <Row className="g-2">
                  <Col md={12}>
                    <Entry
                      register={register("foodBaucher.uiid")}
                      label="UIID: "
                    />

                    <Entry
                      register={register("foodBaucher.cardNumber")}
                      label="Número de tarjeta: " />

                  </Col>
                </Row>
              </FieldGroup>
            </PageSheet>
          </FormPage>

          {/* ============================================ */}
          {/* // Apartado contactos  */}
          {/* ============================================ */}
          <FormPage title="Contactos" eventKey="contacts">
            <FormSheet>
              <Col className="m-2">
                <div className="border rounded-2 overflow-hidden">
                  <Table size="sm" borderless hover responsive className="mb-0">
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
                      {fieldsContacts.map((contact, index) => (
                        <tr key={contact.id}>
                          <td valign="middle" className="border-bottom">
                            <Form.Control
                              {...register(`emergencyContacts.${index}.name`, {
                                required: true,
                              })}
                              size="sm"
                              className="border-0 shadow-none"
                              isInvalid={!!errors.emergencyContacts?.[index]?.name}
                            />
                          </td>
                          <td valign="middle" className="border-bottom">
                            <Form.Control
                              {...register(`emergencyContacts.${index}.kinship`, {
                                required: true,
                              })}
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
                              isInvalid={!!errors.emergencyContacts?.[index]?.phone}
                            />
                          </td>
                          <td
                            valign="middle"
                            className="border-bottom text-center"
                          >
                            <Button
                              type="button"
                              size="sm"
                              variant="link"
                              onClick={() => removeContacts(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <td colSpan={4}>
                          <Button
                            type="button"
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
                </div>
              </Col>
            </FormSheet>
          </FormPage>

          {/* ============================================ */}
          {/* //Apartado Ingresos y bajas  */}
          {/* ============================================ */}
          <FormPage title="Ingresos y Bajas" eventKey="historical">
            <Container>
              <Row className="py-1">
                <FieldGroup>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("admissionDate")}
                      label="Inicio de relación:"
                      className="text-center"
                    />
                    <Entry
                      register={register("dischargeDate")}
                      label="Fin de relación:"
                      className="text-center"
                    />
                  </FieldGroup.Stack>
                </FieldGroup>

                <FieldGroup>
                  <Entry
                    register={register("typeOfDischarge")}
                    label="Tipo de baja:"
                  />
                  <Entry
                    label=""
                    register={register("dischargeReason")}
                    as="textarea"
                  />
                </FieldGroup>
              </Row>
            </Container>
          </FormPage>
        </FormBook>
      </Form >
    </>
  );
}