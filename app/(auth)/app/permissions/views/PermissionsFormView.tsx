"use client";

import { createPermission } from "@/app/actions/permissions-actions";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, IPermissionRequest } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Container, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import SignaturesView from "./SignaturesView";
import ApproveLeaderModal from "./ApproveLeaderModal";
import SignatureDohModal from "./SignatureDohModal";
import EmployeeSignatureModal from "./EmployeeSignatureModal";
import PermissionPDFownload from "./PermissionPDFownload";
import useSWR from "swr";
import { IConfigSystem } from "@/app/actions/configSystem-actions";
import { findEmployeeById } from "@/app/actions/employee-actions";

type TInputs = {
  motive: string;
  type: string;
  forHours: boolean;
  forDays: boolean;
  incidence: string;
  dateInit: string;
  dateEnd: string;
  hourInit: string;
  hourEnd: string;
  idEmployee: number | null;
  idLeader: number | null;
  idPersonDoh: number | null;
  modeSelect: string;
  signature: string;
};
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function PermissionsFormView({
  id,
  employees,
  permission,
}: {
  id: string;
  permission: IPermissionRequest | null;
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TInputs>();

  const { data: session } = useSession();
  const { data } = useSWR("/api/configsystem", fetcher);

  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const [modeSelect, dateInit] = watch(["modeSelect", "dateInit"]);
  const idEmployeeSelected = watch("idEmployee");

  const { modalError } = useModals();

  const router = useRouter();

  const originalValuesRef = useRef<TInputs | null>(null);

  const [approveModal, setApproveModal] = useState(false);
  const [signatureModal, setSignatureModal] = useState(false);
  const [employeeSignatureModal, setEmployeeSignatureModal] = useState(false);
  const [permissionPDFModal, setPermissionPDFModal] = useState(false);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (id && id === "null") {
      const newData = {
        ...data,
        forDays: data.modeSelect === "forDays" ? true : false,
        forHours: data.modeSelect === "forHours" ? true : false,
        hourInit: data.modeSelect === "forDays" ? "" : data.hourInit,
        hourEnd: data.modeSelect === "forDays" ? "" : data.hourEnd,
      };
      const res = await createPermission({ data: newData });
      if (!res.success) return modalError(res.message);
      toast.success(res.message);
      router.back();
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (dateInit !== "") {
      setValue("dateEnd", dateInit);
    }
  }, [dateInit, setValue]);

  const handleApprove = () => {
    setApproveModal(!approveModal);
  };

  const handleSignatureDoh = () => {
    setSignatureModal(!signatureModal);
  };

  const handleEmployeeSignature = () => {
    setEmployeeSignatureModal(!employeeSignatureModal);
  };

  const handleDownloadPDF = () => {
    setPermissionPDFModal(!permissionPDFModal);
  };

  useEffect(() => {
    if (!permission) {
      const values: TInputs = {
        dateEnd: "",
        dateInit: "",
        forDays: false,
        forHours: false,
        hourEnd: "",
        hourInit: "",
        incidence: "PERMISOS",
        motive: "",
        type: "",
        idEmployee: Number(session?.user?.id),
        idLeader:
          employees.find((e) => e.id === Number(session?.user?.id))?.leader
            ?.id || null,
        idPersonDoh: null,
        modeSelect: "",
        signature: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        dateEnd: formatDate(permission.informationDate.dateEnd, "yyyy-MM-dd"),
        dateInit: formatDate(permission.informationDate.dateInit, "yyyy-MM-dd"),
        forDays: permission.forDays,
        forHours: permission.forHours,
        hourEnd: permission.informationDate.hourEnd,
        hourInit: permission.informationDate.hourInit,
        incidence: "PERMISOS",
        motive: permission.motive,
        type: permission.type,
        idEmployee: permission.employee.id || null,
        idLeader: permission.leader.id || null,
        idPersonDoh: permission.personDoh.id || null,
        modeSelect: permission.forDays ? "forDays" : "forHours",
        signature: "",
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, permission, employees, session?.user]);

  useEffect(() => {
    if (id !== "null") return; // solo creando
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await findEmployeeById({ id: Number(idEmployeeSelected) });

        if (cancelled) return;

        // 👇 tu API regresa { message, status, data: {...} }
        const emp = res;
        if (!emp) return;

        const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;

        // ✅ si ES líder → setea el líder desde config
        if (emp.isLeader) {
          if (!leaderFromConfig) return;
          setValue("idLeader", Number(leaderFromConfig), { shouldDirty: true });
          return;
        }

        // ✅ si NO es líder → setea el líder real del empleado (viene en emp.leader)
        const leaderId = emp?.leader?.id ?? null;
        setValue("idLeader", leaderId ? Number(leaderId) : null, {
          shouldDirty: true,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log(e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [id, idEmployeeSelected, config, setValue]);

  useEffect(() => {
    if (id !== "null") return;

    const dohFromConfig = config?.permissions?.approvalDoh?.idPerson;
    if (!dohFromConfig) return;

    const currentDoh = watch("idPersonDoh");
    if (currentDoh) return;

    setValue("idPersonDoh", Number(dohFromConfig), { shouldDirty: false });
  }, [id, config, setValue, watch]);

  const getSignatureEmployee = () => {
    let result = false;
    const sign = permission?.signatures.filter(
      (f) => f.idSignatory === Number(session?.user?.idEmployee)
    )[0];

    if (sign?.url === "") {
      result = false;
    } else {
      result = true;
    }

    return result;
  };

  return (
    <>
      <FormView
        disabled={isSubmitting}
        id={Number(id)}
        isDirty={isDirty}
        name={permission?.motive || null}
        reverse={handleReverse}
        onSubmit={handleSubmit(onSubmit)}
        cleanUrl="/app/permissions?view_type=form&id=null"
        actions={[
          {
            action: handleApprove,
            string: "Aprobar",
            variant: "warning",
            invisible:
              permission?.leader.id !== Number(session?.user?.idEmployee) ||
              permission.leaderApproval === "APPROVED",
          },
          {
            action: handleSignatureDoh,
            string: "Aprobar",
            variant: "success",
            invisible: session?.user?.idEmployee !== permission?.personDoh.id,
          },
          {
            action: handleEmployeeSignature,
            string: "Firmar",
            variant: "primary",
            invisible:
              session?.user?.idEmployee !== permission?.employee.id ||
              getSignatureEmployee(),
          },
          {
            action: handleDownloadPDF,
            variant: "primary",
            string: (
              <>
                <i className="bi bi-filetype-pdf me-2"></i>
                <span>Descargar</span>
              </>
            ),
          },
        ]}
      >
        <fieldset disabled={id !== "null"}>
          <FieldGroup>
            <RelationField
              register={register("idEmployee")}
              options={employees?.map((e) => ({
                id: e.id ?? 0,
                displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
              }))}
              label="Empleado:"
              callBackMode="id"
              control={control}
              readonly={
                session?.user?.role === "EMPLOYEE" &&
                session.user.isDoh === false
              }
            />
            <FieldGroup.Stack>
              <RelationField
                register={register("idLeader")}
                options={employees?.map((e) => ({
                  id: e.id ?? 0,
                  displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                  name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                }))}
                label="Líder:"
                callBackMode="id"
                control={control}
                readonly={
                  session?.user?.role === "EMPLOYEE" &&
                  session.user.isDoh === false
                }
              />
              <RelationField
                register={register("idPersonDoh")}
                options={employees?.map((e) => ({
                  id: e.id ?? 0,
                  displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                  name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                }))}
                label="D.O.H."
                callBackMode="id"
                control={control}
              />
            </FieldGroup.Stack>
            <FieldSelect
              options={[
                {
                  label: "TRÁMITE PERSONAL",
                  value: "PERMISO POR TRÁMITE PERSONAL",
                },
                {
                  label: "SITUACIÓN VIAL",
                  value: "PERMISO POER SITUACIÓN VIAL",
                },
                {
                  label: "POR SALUD (PROPIA O DE FAMILIAR)",
                  value: "PERMISO POR SALUD",
                },
                {
                  label: "ASUNTOS ESCOLARES",
                  value: "PERMISO POR ASUSNTOS ESCOLARES",
                },
                {
                  label: "PERMISO POR PATERNIDAD",
                  value: "PERMISO PATERNIDAD",
                },
                {
                  label: "OTROS",
                  value: "PERMISO OTROS",
                },
              ]}
              register={register("type", { required: true })}
              label="Tipo:"
              invalid={!!errors.type}
            />
            <Entry
              label="Descripción del motivo:"
              register={register("motive", { required: true })}
              invalid={!!errors.motive}
            />
            <FieldGroup.Stack>
              <Form.Check
                {...register("modeSelect")}
                value="forHours"
                type="radio"
                label="Horas"
                id="forHours"
              />
              <Form.Check
                {...register("modeSelect")}
                value="forDays"
                type="radio"
                label="Días"
                id="forDays"
              />
            </FieldGroup.Stack>
            <FieldGroup.Stack>
              <Entry
                label="Fecha inicio:"
                type="date"
                register={register("dateInit")}
                min={formatDate(new Date(), "yyyy-MM-dd")}
              />
              <Entry
                label="Fecha final:"
                type="date"
                register={register("dateEnd")}
                invalid={!!errors.dateEnd}
                readonly={modeSelect === "forHours"}
                min={dateInit}
              />
            </FieldGroup.Stack>
            {modeSelect === "forHours" && (
              <FieldGroup.Stack>
                <Entry
                  register={register("hourInit")}
                  label="Hora inicial:"
                  className="text-center"
                  type="time"
                />
                <Entry
                  label="Hora final:"
                  register={register("hourEnd")}
                  className="text-center"
                  type="time"
                />
              </FieldGroup.Stack>
            )}
            {id === "null" && (
              <SignatureInput
                name="signature"
                register={register}
                control={control}
              />
            )}
          </FieldGroup>
          <FormBook dKey="signatures">
            {permission?.signatures && permission.signatures.length > 0 && (
              <FormPage title="Firmas" eventKey="signatures">
                <Container>
                  <Row className="g-2 py-2">
                    {permission?.signatures &&
                      permission?.signatures.map((sign) => {
                        return (
                          <SignaturesView
                            key={sign._id}
                            idPermission={String(permission.id)}
                            idEmployee={String(sign.idSignatory)}
                            name={sign.name}
                            dateApproved={sign.dateApproved}
                            status={sign.status}
                            dateApprove={permission.dateApprove}
                            dateApproveDoh={permission.dateApproveDoh}
                          />
                        );
                      })}
                  </Row>
                </Container>
              </FormPage>
            )}
          </FormBook>
        </fieldset>
      </FormView>
      <ApproveLeaderModal
        show={approveModal}
        onHide={() => setApproveModal(!approveModal)}
        id={id}
      />
      <SignatureDohModal
        show={signatureModal}
        onHide={() => setSignatureModal(!signatureModal)}
        id={id}
      />
      <EmployeeSignatureModal
        show={employeeSignatureModal}
        onHide={() => setEmployeeSignatureModal(!employeeSignatureModal)}
        id={id}
      />
      <PermissionPDFownload
        id={id}
        show={permissionPDFModal}
        onHide={() => setPermissionPDFModal(!permissionPDFModal)}
      />
    </>
  );
}

export default PermissionsFormView;
