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
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { TInputsEmployee } from "../definition";
import { formatDate } from "date-fns";

function EmployeeFormView({
  employee,
  id,
  departments,
  branches,
}: {
  employee: Employee | null;
  id: number;
  departments: Department[];
  branches: Branch[];
}) {
  const {
    watch,
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputsEmployee>();

  const [deps] = watch(["idDepartment"]);

  const { modalError } = useModals();

  const originalValuesRef = useRef<TInputsEmployee | null>(null);
  const router = useRouter();

  const [puestos, setPuestos] = useState<Position[]>([]);

  const onSubmit: SubmitHandler<TInputsEmployee> = async (data) => {
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
        phonePersonal: null,
        idCheck: null,
        passwordCheck: null,
        entryOffice: null,
        entrySaturdayOffice: "08:30",
        exitSaturdayOffice: "14:00",
        exitLunch: null,
        entryLunch: null,
        exitOffice: null,
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
        phonePersonal: employee.phonePersonal?.internationalNumber || null,
        idCheck: employee.idCheck || null,
        passwordCheck: employee.passwordCheck,
        entryOffice: employee.scheduleOffice?.entry || null,
        entrySaturdayOffice: employee.scheduleSaturday?.entry || null,
        exitOffice: employee.scheduleOffice?.exit || null,
        exitSaturdayOffice: employee.scheduleSaturday?.exit || null,
        exitLunch: employee.scheduleLunch?.entry || null,
        entryLunch: employee.scheduleLunch?.exit || null,
        idDepartment: employee.department?.id || 0,
        branch: employee.branch?.id || null,
        idPosition: employee.position?.id || null,
        gender: employee.gender,
        status: employee.status || 1,
        phoneCompany: employee.phoneCompany?.internationalNumber || "",
        phoneExtCompany: employee.phoneExtCompany,
        address: {
          street: employee.address.street,
          country: employee.address.country,
          municipality: employee.address.municipality,
          neighborhood: employee.address.neighborhood,
          numberIn: employee.address.numberIn || "",
          numberOut: employee.address.numberOut,
          state: employee.address.state,
          zipCode: String(employee.address.zipCode) || "",
        },
        emailCompany: employee.emailCompany,
        scheduleDescription: employee.scheduleDescription,
        policies: employee.policies,
        group: employee.group,
        homePhone: employee.homePhone.internationalNumber,
        sons: employee.sons,
        daughters: employee.daughters,
        birthDate: formatDate(employee.birthDate, "yyy-MM-dd"),
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
        admissionDate: employee.admissionDate,
        anniversaryLetter: employee.anniversaryLetter,
        visibleRecords: employee.visibleRecords,
        dischargeDate: employee.dischargeDate,
        dischargeReason: employee.dischargeReason,
        role: employee.role || [],
      };
      reset(values);
      originalValuesRef.current = values;
      setPuestos(employee.department?.positions || []);
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
  }, [deps, watch]);

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
              <Entry register={register("emailPersonal")} label="Correo:" />
              <FieldGroup.Stack>
                <Entry register={register("phonePersonal")} label="Teléfono:" />
                <Entry
                  register={register("homePhone")}
                  label="Teléfono fijo:"
                />
              </FieldGroup.Stack>
            </FieldGroup>
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
                <Entry register={register("address.zipCode")} label="C.P." />
              </FieldGroup.Stack>
              <FieldGroup.Stack>
                <Entry register={register("address.state")} label="Estado:" />
                <Entry register={register("address.country")} label="País:" />
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
              <Entry register={register("comments")} label="Comentarios:" />
            </FieldGroup>
          </FormSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}
1;

export default EmployeeFormView;
