"use client";

import { createEmployee, updateEmploye } from "@/app/actions/employee-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Branch, Department, Employee, Position } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { TInputsEmployee } from "../definition";
import { formatDate } from "date-fns";
import { Button, Col, Form, Table } from "react-bootstrap";

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
}: {
  employee: Employee | null;
  id: number;
  departments: Department[];
  branches: Branch[];
  employees: Employee[];
}) {
  const {
    watch,
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputsEmployee>();

  const {
    append: appContacts,
    fields: fieldsContacts,
    remove: removeContacts,
  } = useFieldArray({
    control,
    name: "emergencyContacts",
  });

  const [deps] = watch(["idDepartment.id"]);

  const { modalError } = useModals();

  const originalValuesRef = useRef<TInputsEmployee | null>(null);
  const router = useRouter();

  const [puestos, setPuestos] = useState<Position[]>([]);

  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    console.log("FORMULARIO");
    if (isNaN(id)) {
      const res = await createEmployee({ data });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
      router.back();
      console.log("MODO CREATE");
    } else {
      const res = await updateEmploye({ data, id });
      if (!res.success) {
        modalError(res.message);
        return;
      }

      toast.success(res.message);
    }
    console.log("MODO UPDATE");
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
        emailPersonal: null,
        phonePersonal: "",
        idCheck: 0,
        passwordCheck: null,
        entryOffice: null,
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
          country: "",
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
        dischargeDate: "",
        dischargeReason: "",
        role: [],
      };
      setPuestos([]);
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputsEmployee = {
        name: employee.name || "",
        lastName: employee.lastName || "",
        emailPersonal: employee.emailPersonal,
        phonePersonal: employee.phonePersonal?.internationalNumber || "",
        idCheck: employee.idCheck || 0,
        passwordCheck: employee.passwordCheck,
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
        admissionDate: formatDate(employee.admissionDate, "yyy-MM-dd"),
        anniversaryLetter: employee.anniversaryLetter,
        visibleRecords: employee.visibleRecords,
        dischargeDate: formatDate(employee.dischargeDate, "yyy-MM-dd"),
        dischargeReason: employee.dischargeReason,
        role: employee.role || [],
      };
      reset(values);
      originalValuesRef.current = values;
      const department = employee.idDepartment as unknown as Department;
      setPuestos(department?.positions || []);
    }
  }, [employee, reset]);

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
    <FormView
      title="Empleado"
      reverse={handleReverse}
      onSubmit={handleSubmit(onSubmit)}
      name={`${employee?.name || ""} ${employee?.lastName || ""}` || null}
      isDirty={isDirty}
      id={id}
      disabled={isSubmitting}
      cleanUrl="/app/employee?view_type=form&id=null"
      state={employeeStatus[employee?.status as keyof typeof employeeStatus]}
      formStates={[
        { name: "activo", decoration: "success", label: "Activo" },
        { name: "baja", decoration: "danger", label: "baja" },
      ]}
    >
      <FormBook dKey="personalInfo">
        <FormPage title="Información Personal" eventKey="personalInfo">
          <FormSheet className="g-2">
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
                <Entry register={register("phonePersonal")} label="Celuar:" />
                {!isNaN(id) && (
                  <Entry
                    register={register("homePhone")}
                    label="Teléfono fijo:"
                  />
                )}
              </FieldGroup.Stack>
            </FieldGroup>
            {!isNaN(id) && (
              <>
                <FieldGroup>
                  <Entry register={register("address.street")} label="Calle:" />
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.numberOut")}
                      label="No. Exterior:"
                    />
                    <Entry
                      register={register("address.numberIn")}
                      label="No. Interior:"
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.neighborhood")}
                      label="Colonia:"
                    />
                    <Entry
                      register={register("address.zipCode")}
                      label="C.P."
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("address.state")}
                      label="Estado:"
                    />
                    <Entry
                      register={register("address.country")}
                      label="País:"
                    />
                  </FieldGroup.Stack>
                </FieldGroup>
                <FieldGroup>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("birthDate")}
                      type="date"
                      label="Nacimiento:"
                    />
                    <Entry
                      register={register("nationality")}
                      label="Nacionalidad:"
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("socialSecurityNumber")}
                      label="NSS:"
                    />
                    <Entry
                      register={register("rfc")}
                      label="R.F.C."
                      className="text-uppercase"
                    />
                  </FieldGroup.Stack>
                  <FieldGroup.Stack>
                    <Entry
                      register={register("curp")}
                      label="CURP:"
                      className="text-uppercase"
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
                      register={register("gender")}
                    />
                    <Entry
                      register={register("bloodType")}
                      label="Grupo sanguíneo:"
                      className="text-center"
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
                      Obersevaciones generales:
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      {...register("comments")}
                      rows={8}
                    />
                  </Form.Group>
                </FieldGroup>
              </>
            )}
          </FormSheet>
        </FormPage>
        <FormPage title="Información Laboral" eventKey="jobInfo">
          <FormSheet className="g-2">
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
                  register={register("idDepartment.id")}
                  options={departments.map((d) => ({
                    id: d.id || 0,
                    displayName: d.nameDepartment,
                    name: d.nameDepartment,
                  }))}
                  label="Departamento:"
                  control={control}
                  callBackMode="id"
                  className="text-uppercase"
                />
                <RelationField
                  options={puestos.map((p) => ({
                    id: p.id || 0,
                    displayName: p.namePosition,
                    name: p.namePosition,
                  }))}
                  register={register("idPosition")}
                  control={control}
                  callBackMode="id"
                  label="Puesto:"
                  className="text-uppercase"
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
                register={register("branch")}
                options={branches.map((b) => ({
                  id: b.id || 0,
                  displayName: b.name,
                  name: b.name,
                }))}
                callBackMode="id"
                label="Sucursal"
                className="text-uppercase"
              />
              {/* <Entry register={register("policies")} label="Políticas:" /> */}
            </FieldGroup>
            <FieldGroup>
              <FieldGroup.Stack>
                <Entry register={register("idCheck")} label="ID Checador:" />
                <Entry
                  register={register("passwordCheck")}
                  label="Clave checador:"
                />
              </FieldGroup.Stack>
              <FieldGroup.Stack>
                <Entry register={register("entryOffice")} label="Entrada:" />
                <Entry register={register("exitOffice")} label="Salida:" />
              </FieldGroup.Stack>
              <FieldGroup.Stack>
                <Entry
                  register={register("exitLunch")}
                  label="Salida comedor:"
                />
                <Entry
                  register={register("entryLunch")}
                  label="Entrada comedor:"
                />
              </FieldGroup.Stack>
              <FieldGroup.Stack>
                <Entry
                  register={register("entrySaturdayOffice")}
                  label="Entrada sabatina:"
                />
                <Entry
                  register={register("exitSaturdayOffice")}
                  label="Salida sabatina:"
                />
              </FieldGroup.Stack>
              <Entry
                register={register("scheduleDescription")}
                label="Descripción del horario:"
              />
              {/* <Entry register={register("group")} label="Grupo:" /> */}
            </FieldGroup>
            <FieldGroup>
              <FieldGroup.Stack>
                <Entry
                  type="date"
                  register={register("admissionDate")}
                  label="Inicio de relación:"
                />
                <Entry
                  type="date"
                  register={register("dischargeDate")}
                  label="Fin de relación:"
                />
              </FieldGroup.Stack>
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
          </FormSheet>
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
      </FormBook>
    </FormView>
  );
}

export default EmployeeFormView;
