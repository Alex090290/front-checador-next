"use client";

import { createPermission } from "@/app/actions/permissions-actions";
import { findEmployeeById } from "@/app/actions/employee-actions";
import { IConfigSystem } from "@/app/actions/configSystem-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { Employee } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useSWR from "swr";

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

const DEFAULT_VALUES: TInputs = {
  dateEnd: "",
  dateInit: "",
  forDays: false,
  forHours: false,
  hourEnd: "",
  hourInit: "",
  incidence: "PERMISOS",
  motive: "",
  type: "",
  idEmployee: null,
  idLeader: null,
  idPersonDoh: null,
  modeSelect: "",
  signature: "",
};

export default function CreatePermissionComponent({
  employees = [],
}: {
  employees?: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });

  const session = useSessionSnapshot();
  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const modeSelect = watch("modeSelect");
  const dateInit = watch("dateInit");
  const idEmployeeSelected = watch("idEmployee");
  const currentDoh = watch("idPersonDoh");

  const { data } = useSWR("/api/configsystem", fetcher);

  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar este permiso?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando permiso...");

        const newData = {
          ...data,
          forDays: data.modeSelect === "forDays",
          forHours: data.modeSelect === "forHours",
          hourInit: data.modeSelect === "forDays" ? "" : data.hourInit,
          hourEnd: data.modeSelect === "forDays" ? "" : data.hourEnd,
        };

        const res = await createPermission({ data: newData });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.back();
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  useEffect(() => {
    const employeeId = Number(session?.uid?.id);
    if (!employeeId) return;

    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee: employeeId,
      idLeader:
        employees.find((e) => Number(e.id) === Number(employeeId))?.leader?.id || null,
    };

    reset(values);
  }, [reset, employees, session]);

  useEffect(() => {
    if (dateInit) {
      setValue("dateEnd", dateInit);
    }
  }, [dateInit, setValue]);

  useEffect(() => {
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const employeeId = Number(idEmployeeSelected);
        if (!employeeId || Number.isNaN(employeeId)) return;

        const emp = await findEmployeeById({ id: employeeId });
        console.log("emp: ", emp);

        if (cancelled || !emp) return;

        const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;

        if (emp.isLeader) {
          if (!leaderFromConfig) return;

          setValue("idLeader", Number(leaderFromConfig), {
            shouldDirty: true,
            shouldValidate: true,
          });
          return;
        }

        const leaderId = emp?.leader?.id ?? null;

        console.log("leaderId: ", leaderId);

        setValue("idLeader", leaderId ? Number(leaderId) : null, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } catch (error) {
        console.log(error);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [idEmployeeSelected, config, setValue]);

  useEffect(() => {
    const dohFromConfig = config?.permissions?.approvalDoh?.idPerson;
    if (!dohFromConfig) return;
    if (currentDoh) return;

    setValue("idPersonDoh", Number(dohFromConfig), {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [config, currentDoh, setValue]);

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/permissions");
  };

  //   console.log("employees: ",employees);

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando permiso..."} />
      </ConditionalRender>

      <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
        <Row className="m-2">
          <Col xs={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting || loading}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                  <div>
                    <h1 className="mb-1">Crear permiso</h1>
                    <p className="text-muted mb-0">
                      Registra la información de la solicitud de permiso.
                    </p>
                  </div>

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
                      type="button"
                      variant="secondary"
                      disabled={isSubmitting || loading || !isDirty}
                      onClick={() => reset(DEFAULT_VALUES)}
                    >
                      Limpiar
                    </Button>

                    <Button
                      className="bg-success border-success"
                      type="submit"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </div>

                <Card className="rounded-4 shadow-sm border">
                  <Card.Body className="p-3 p-md-5">
                    <div className="mb-4">
                      <h5 className="fw-semibold mb-1">Datos del empleado</h5>
                      <p className="text-muted mb-3">
                        Selecciona el empleado, líder y responsable D.O.H.
                      </p>

                      <Row className="g-4">
                        <Col xs={12}>
                          <RelationField
                            register={register("idEmployee")}
                            options={employees.map((e) => ({
                              id: e.id ?? 0,
                              displayName:
                                `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                              name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                            }))}
                            label="Empleado:"
                            callBackMode="id"
                            control={control}
                            readonly={
                              session?.uid?.role === "EMPLOYEE" &&
                              session.uid.isDoh === false
                            }
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <RelationField
                            register={register("idLeader")}
                            options={employees.map((e) => ({
                              id: e.id ?? 0,
                              displayName:
                                `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                              name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                            }))}
                            label="Líder:"
                            callBackMode="id"
                            control={control}
                            readonly={
                              session?.uid?.role === "EMPLOYEE" &&
                              session.uid.isDoh === false
                            }
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <RelationField
                            register={register("idPersonDoh")}
                            options={employees.map((e) => ({
                              id: e.id ?? 0,
                              displayName:
                                `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                              name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                            }))}
                            label="D.O.H."
                            callBackMode="id"
                            control={control}
                          />
                        </Col>
                      </Row>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-4">
                      <h5 className="fw-semibold mb-1">Motivo del permiso</h5>
                      <p className="text-muted mb-3">
                        Indica el tipo de permiso y describe el motivo.
                      </p>

                      <Row className="g-4">
                        <Col xs={12}>
                          <FieldSelect
                            options={[
                              {
                                label: "TRÁMITE PERSONAL",
                                value: "PERMISO POR TRÁMITE PERSONAL",
                              },
                              {
                                label: "SITUACIÓN VIAL",
                                value: "PERMISO POR SITUACIÓN VIAL",
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
                            className="border"
                          />
                        </Col>

                        <Col xs={12}>
                          <Entry
                            label="Descripción del motivo:"
                            register={register("motive", { required: true })}
                            invalid={!!errors.motive}
                            className="border"
                          />
                        </Col>
                      </Row>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-4">
                      <h5 className="fw-semibold mb-1">Fecha y horario</h5>
                      <p className="text-muted mb-3">
                        Define si el permiso será por horas o por días.
                      </p>

                      <Row className="g-4">
                        <Col xs={12}>
                          <div className="d-flex flex-wrap gap-4">
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
                          </div>
                        </Col>

                        <Col xs={12} md={6}>
                          <Entry
                            label="Fecha inicio:"
                            type="date"
                            register={register("dateInit")}
                            min={formatDate(new Date(), "yyyy-MM-dd")}
                            className="border"
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <Entry
                            label="Fecha final:"
                            type="date"
                            register={register("dateEnd")}
                            invalid={!!errors.dateEnd}
                            readonly={modeSelect === "forHours"}
                            min={dateInit}
                            className="border"
                          />
                        </Col>

                        {modeSelect === "forHours" && (
                          <>
                            <Col xs={12} md={6}>
                              <Entry
                                register={register("hourInit")}
                                label="Hora inicial:"
                                className="text-center"
                                type="time"
                              />
                            </Col>

                            <Col xs={12} md={6}>
                              <Entry
                                label="Hora final:"
                                register={register("hourEnd")}
                                className="text-center"
                                type="time"
                              />
                            </Col>
                          </>
                        )}
                      </Row>
                    </div>

                    <hr className="my-4" />

                    <div>
                      <h5 className="fw-semibold mb-1">Firma</h5>
                      <p className="text-muted mb-3">
                        Agrega la firma para confirmar la solicitud.
                      </p>

                      <div className="w-100 overflow-hidden">
                        <SignatureInput
                          name="signature"
                          register={register}
                          control={control}
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </fieldset>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}