"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import {
  FieldGroup,
  FieldGroupFluid,
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Branch,
  Department,
  Employee,
  ModalBasicProps,
  Position,
} from "@/lib/definitions";

import { formatDate } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { TInputsEmployee } from "../../definition";

type ModalAction = {
  sendData: (data: TInputsEmployee) => Promise<ActionResponse<boolean | null>>;
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
    weight: employee?.weight || "",
    height: employee?.height || "",
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
  };
}

export default function FormUpdateEmployee({
  onHide,
  sendData,
  employee,
  departments = [],
  branches = [],
  employees = [],
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

  const { modalError } = useModals();
  const [loading, setLoading] = useState(false);
  const [puestos, setPuestos] = useState<Position[]>([]);

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

  const managerOptions = useMemo(
    () =>
      employees.map((em) => ({
        id: em.id || 0,
        displayName: `${em.name} ${em.lastName}`,
        name: `${em.name} ${em.lastName}`,
      })),
    [employees]
  );

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        id: b.id || 0,
        displayName: b.name,
        name: b.name,
      })),
    [branches]
  );

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        id: d.id || 0,
        displayName: d.nameDepartment,
        name: d.nameDepartment,
      })),
    [departments]
  );

  const positionOptions = useMemo(
    () =>
      puestos.map((p) => ({
        id: p.id || 0,
        displayName: p.namePosition,
        name: p.namePosition,
      })),
    [puestos]
  );

  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
    const res = await sendData(data);

    if (!res.success) {
      modalError(res.message);
      return;
    }

    onHide();
  };

  return <>
        <ConditionalRender cond={loading}>
            <Loading message="Cargando..." />
        </ConditionalRender>

        <ConditionalRender cond={isSubmitting}>
            <Loading message="Guardando..." />
        </ConditionalRender>
    
        <div className="">
            <Form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={loading || isSubmitting}>
            <FormBook dKey="personalInfo">
                <FormPage title="Información Personal" eventKey="personalInfo">
                <FieldGroupFluid>
                    <Entry
                    register={register("name", { required: "Nombre requerido" })}
                    label="Nombre:"
                    invalid={!!errors.name}
                    feedBack={errors.name?.message}
                    />

                    <Entry
                    register={register("lastName", {
                        required: "Apellidos requeridos",
                    })}
                    label="Apellidos:"
                    invalid={!!errors.lastName}
                    feedBack={errors.lastName?.message}
                    />

                    <Entry
                    register={register("emailPersonal")}
                    label="Correo personal:"
                    invalid={!!errors.emailPersonal}
                    />

                    <Entry
                    register={register("phonePersonal", {
                        required: "Celular requerido",
                    })}
                    label="Celular:"
                    invalid={!!errors.phonePersonal}
                    feedBack={errors.phonePersonal?.message}
                    />

                    <Entry
                    register={register("homePhone")}
                    label="Teléfono fijo:"
                    />

                    <Entry
                    register={register("address.street", {
                        required: "Calle requerida",
                    })}
                    label="Calle:"
                    invalid={!!errors.address?.street}
                    feedBack={errors.address?.street?.message}
                    />

                    <Entry
                    register={register("address.numberOut", {
                        required: "No. exterior requerido",
                    })}
                    label="No. Exterior:"
                    invalid={!!errors.address?.numberOut}
                    feedBack={errors.address?.numberOut?.message}
                    />

                    <Entry
                    register={register("address.numberIn")}
                    label="No. Interior:"
                    />

                    <Entry
                    register={register("address.neighborhood", {
                        required: "Colonia requerida",
                    })}
                    label="Colonia:"
                    invalid={!!errors.address?.neighborhood}
                    feedBack={errors.address?.neighborhood?.message}
                    />

                    <Entry
                    register={register("address.zipCode", {
                        required: "C.P. requerido",
                    })}
                    label="C.P.:"
                    invalid={!!errors.address?.zipCode}
                    feedBack={errors.address?.zipCode?.message}
                    />

                    <Entry
                    register={register("address.municipality")}
                    label="Municipio:"
                    />

                    <Entry
                    register={register("address.state", {
                        required: "Estado requerido",
                    })}
                    label="Estado:"
                    invalid={!!errors.address?.state}
                    feedBack={errors.address?.state?.message}
                    />

                    <Entry
                    register={register("address.country", {
                        required: "País requerido",
                    })}
                    label="País:"
                    invalid={!!errors.address?.country}
                    feedBack={errors.address?.country?.message}
                    />

                    <Entry
                    register={register("birthDate", {
                        required: "Fecha de nacimiento requerida",
                    })}
                    type="date"
                    label="Nacimiento:"
                    invalid={!!errors.birthDate}
                    feedBack={errors.birthDate?.message}
                    />

                    <Entry
                    register={register("nationality", {
                        required: "Nacionalidad requerida",
                    })}
                    label="Nacionalidad:"
                    invalid={!!errors.nationality}
                    feedBack={errors.nationality?.message}
                    />

                    <Entry
                    register={register("socialSecurityNumber", {
                        required: "NSS requerido",
                    })}
                    label="NSS:"
                    invalid={!!errors.socialSecurityNumber}
                    feedBack={errors.socialSecurityNumber?.message}
                    />

                    <Entry
                    register={register("rfc", { required: "RFC requerido" })}
                    label="R.F.C.:"
                    invalid={!!errors.rfc}
                    feedBack={errors.rfc?.message}
                    className="text-uppercase"
                    />

                    <Entry
                    register={register("curp", { required: "CURP requerido" })}
                    label="CURP:"
                    invalid={!!errors.curp}
                    feedBack={errors.curp?.message}
                    className="text-uppercase"
                    />

                    <FieldSelect
                    register={register("gender", {
                        required: "Género requerido",
                    })}
                    options={[
                        { value: "MASCULINO", label: "MASCULINO" },
                        { value: "FEMENINO", label: "FEMENINO" },
                    ]}
                    label="Género:"
                    invalid={!!errors.gender}
                    feedBack={errors.gender?.message}
                    />

                    <Entry
                    register={register("bloodType")}
                    label="Grupo sanguíneo:"
                    />

                    <Entry register={register("weight")} label="Peso:" />
                    <Entry register={register("height")} label="Altura:" />
                    <Entry
                    register={register("constitution")}
                    label="Constitución:"
                    />
                    <Entry
                    register={register("healthStatus")}
                    label="Estado de salud:"
                    />
                    <Entry
                    register={register("education")}
                    label="Formación académica:"
                    />
                    <Entry register={register("skills")} label="Habilidades:" />
                    <Entry register={register("sons")} label="Hijos:" />
                    <Entry register={register("daughters")} label="Hijas:" />

                    <Col xs={12}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                        Observaciones generales:
                        </Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={5}
                        {...register("comments")}
                        />
                    </Form.Group>
                    </Col>
                </FieldGroupFluid>
                </FormPage>

                <FormPage title="Información Laboral" eventKey="jobInfo">
                <FieldGroupFluid>
                    <Entry
                    register={register("phoneCompany")}
                    label="Teléfono de oficina:"
                    />

                    <Entry
                    register={register("phoneExtCompany")}
                    label="Extensión:"
                    />

                    <Entry
                    register={register("emailCompany")}
                    label="Correo:"
                    />

                    <RelationField
                    register={register("idDepartment.id", {
                        required: "Departamento requerido",
                    })}
                    options={departmentOptions}
                    label="Departamento:"
                    control={control}
                    callBackMode="id"
                    invalid={!!errors.idDepartment}
                    />

                    <RelationField
                    register={register("idPosition", {
                        required: "Puesto requerido",
                    })}
                    options={positionOptions}
                    label="Puesto:"
                    control={control}
                    callBackMode="id"
                    invalid={!!errors.idPosition}
                    />

                    <RelationField
                    register={register("idDepartment.idLeader")}
                    options={managerOptions}
                    label="Gerente:"
                    control={control}
                    callBackMode="id"
                    />

                    <RelationField
                    register={register("branch", {
                        required: "Sucursal requerida",
                    })}
                    options={branchOptions}
                    label="Sucursal:"
                    control={control}
                    callBackMode="id"
                    invalid={!!errors.branch}
                    />

                    <Entry
                    register={register("idCheck", {
                        required: "ID checador requerido",
                    })}
                    label="ID Checador:"
                    invalid={!!errors.idCheck}
                    feedBack={errors.idCheck?.message}
                    />

                    <Entry
                    register={register("passwordCheck", {
                        required: "Contraseña requerida",
                    })}
                    label="Contraseña de checador:"
                    invalid={!!errors.passwordCheck}
                    feedBack={errors.passwordCheck?.message}
                    />

                    <Entry
                    register={register("entryOffice", {
                        required: "Entrada requerida",
                    })}
                    label="Entrada:"
                    invalid={!!errors.entryOffice}
                    feedBack={errors.entryOffice?.message}
                    />

                    <Entry
                    register={register("exitOffice", {
                        required: "Salida requerida",
                    })}
                    label="Salida:"
                    invalid={!!errors.exitOffice}
                    feedBack={errors.exitOffice?.message}
                    />

                    <Entry
                    register={register("entryLunch", {
                        required: "Entrada comedor requerida",
                    })}
                    label="Entrada comedor:"
                    invalid={!!errors.entryLunch}
                    feedBack={errors.entryLunch?.message}
                    />
                    <Entry
                    register={register("exitLunch", {
                        required: "Salida comedor requerida",
                    })}
                    label="Salida comedor:"
                    invalid={!!errors.exitLunch}
                    feedBack={errors.exitLunch?.message}
                    />



                    <Entry
                    register={register("entrySaturdayOffice", {
                        required: "Entrada sabatina requerida",
                    })}
                    label="Entrada sabatina:"
                    invalid={!!errors.entrySaturdayOffice}
                    feedBack={errors.entrySaturdayOffice?.message}
                    />

                    <Entry
                    register={register("exitSaturdayOffice", {
                        required: "Salida sabatina requerida",
                    })}
                    label="Salida sabatina:"
                    invalid={!!errors.exitSaturdayOffice}
                    feedBack={errors.exitSaturdayOffice?.message}
                    />

                    <Entry
                    register={register("scheduleDescription")}
                    label="Descripción del horario:"
                    />

                    <Entry
                    register={register("dailyWage")}
                    label="Salario diario:"
                    />

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
                        { value: 2, label: "Baja" },
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
                </FieldGroupFluid>
                </FormPage>

                <FormPage title="Contactos" eventKey="contacts">
                <Col xs={12}>
                    <Table size="sm" borderless hover responsive>
                    <thead>
                        <tr className="border-bottom table-active">
                        <th className="border-end">Nombre</th>
                        <th className="border-end">Parentezco</th>
                        <th className="border-end">Contacto</th>
                        <th className="border-end text-center">
                            <i className="bi bi-trash"></i>
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        {contactFields.map((contact, index) => (
                        <tr key={contact.id}>
                            <td className="border-bottom">
                            <Form.Control
                                {...register(`emergencyContacts.${index}.name`, {
                                required: true,
                                })}
                                size="sm"
                                className="border-0 shadow-none"
                            />
                            </td>
                            <td className="border-bottom">
                            <Form.Control
                                {...register(`emergencyContacts.${index}.kinship`, {
                                required: true,
                                })}
                                size="sm"
                                className="border-0 shadow-none"
                            />
                            </td>
                            <td className="border-bottom">
                            <Form.Control
                                {...register(
                                `emergencyContacts.${index}.phone.internationalNumber`,
                                { required: true }
                                )}
                                size="sm"
                                className="border-0 shadow-none"
                            />
                            </td>
                            <td className="border-bottom text-center">
                            <Button
                                type="button"
                                size="sm"
                                variant="link"
                                onClick={() => removeContact(index)}
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
                                appendContact({
                                name: "",
                                kinship: "",
                                phone: "",
                                } as never)
                            }
                            >
                            Agregar
                            </Button>
                        </td>
                        </tr>
                    </tbody>
                    </Table>
                </Col>
                </FormPage>

                <FormPage title="Ingresos y Bajas" eventKey="historical">
                <FieldGroupFluid>
                    <Entry
                    register={register("admissionDate")}
                    label="Inicio de relación:"
                    type="date"
                    />

                    <Entry
                    register={register("dischargeDate")}
                    label="Fin de relación:"
                    type="date"
                    />

                    <Entry
                    register={register("typeOfDischarge")}
                    label="Tipo de baja:"
                    />

                    <Col xs={12}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                        Motivo / detalle de baja:
                        </Form.Label>
                        <Form.Control
                        as="textarea"
                        rows={4}
                        {...register("dischargeReason")}
                        />
                    </Form.Group>
                    </Col>
                </FieldGroupFluid>
                </FormPage>
            </FormBook>

            <div className="mt-4 d-flex gap-2">
                <Button type="submit" variant="primary">
                Guardar
                </Button>

                <Button type="button" variant="secondary" onClick={onHide}>
                Cancelar
                </Button>
            </div>
            </fieldset>
            </Form>
        </div>
    </>
}