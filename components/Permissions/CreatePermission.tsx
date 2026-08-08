"use client";

import { createPermission } from "@/app/actions/permissions-actions";
import { findEmployeeById } from "@/app/actions/employee-actions";
import { EmployeeRef, IConfigSystem } from "@/app/actions/configSystem-actions";
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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWR from "swr";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

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
  const [, setMessageLoading] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const modeSelect = watch("modeSelect");
  const dateInit = watch("dateInit");
  const currentDoh = watch("idPersonDoh");
  const { data } = useSWR("/api/configsystem", fetcher);
  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const idEmployeeSelected = watch("idEmployee");
  const roles = session?.uid?.roles;
  const dohMap = config?.permissions.approvalDoh;

  const readInput = !roles?.isLeader
    && !roles?.isExtra
    && !roles?.isDoh
    && !roles?.isApproverLeaders
    && !roles?.isApproverDoh;

  const readOnlyDoh = !roles?.isLeader
    && !roles?.isExtra
    && roles?.isDoh
    && !roles?.isApproverLeaders
    && !roles?.isApproverDoh
    && Number(session?.uid?.idEmployee) === Number(config?.permissions.approvalDoh.idPerson);

  const idEmployee = Number(session?.uid?.idEmployee);


  const directionList: EmployeeRef[] | undefined = config?.permissions.extra?.employees;


  // Este sirve para filtrar el empleado al que se le asignara el registro
  useEffect(() => {
    if (roles?.isLeader && !roles.isExtra!) {

      const filtrados = employees.filter(
        (el: Employee) => Number(el.department?.idLeader) === Number(session?.uid?.idEmployee)
      );
      setFilteredEmployees(filtrados);
    } else {
      setFilteredEmployees(employees);
    }
  }, [session, roles, idEmployee, employees]);

  useEffect(() => {
    if (session?.uid?.role === "EMPLOYEE") setValue("idEmployee", session?.uid?.idEmployee);

  }, [session, setValue]);

  // Este sirve para filtrar las opciones de idLeader
  useEffect(() => {
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const employeeId = Number(idEmployeeSelected);
        if (!employeeId || Number.isNaN(employeeId)) return;

        const isDohSession = !!roles?.isDoh;
        const ownId = Number(session?.uid?.idEmployee);
        const isLeaderNotExtra = roles?.isLeader && !roles?.isExtra;

        if (isLeaderNotExtra && !isDohSession && employeeId === ownId) {
          setValue("idLeader", Number(directionList?.[0]?.id) || null, {
            shouldDirty: true,
            shouldValidate: true,
          });
          return;
        }

        const emp = await findEmployeeById({ id: employeeId });

        if (cancelled || !emp) return;

        const empIsLeader = !!emp?.role?.includes("LEADER");

        if (empIsLeader) {
          if (isDohSession) {
            setValue("idLeader", Number(directionList?.[0]?.id) || null, {
              shouldDirty: true,
              shouldValidate: true,
            });
            return;
          }

          const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;
          if (!leaderFromConfig) return;

          setValue("idLeader", Number(leaderFromConfig), {
            shouldDirty: true,
            shouldValidate: true,
          });
          return;
        }

        const leaderId = emp?.leader?.id ?? null;

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
  }, [idEmployeeSelected, config, setValue, session, directionList, roles]);

  const leaderOptions = useMemo(() => {
    const mapToOption = (e: Employee | EmployeeRef) => ({
      id: e.id!,
      displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
      name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`
    });

    function hasId<T extends Employee | EmployeeRef>(e: T): e is T & { id: number } {
      return e.id !== undefined;
    }

    const directionOptions = (directionList ?? []).filter(hasId).map(mapToOption);
    const isDohSession = !!roles?.isDoh;
    const selectedId = Number(idEmployeeSelected);


    if (isDohSession) {
      if (!selectedId) return [];

      const selectedEmployee = employees.find((e) => Number(e.id) === selectedId);
      const selectedIsLeader = !!selectedEmployee?.role?.includes("LEADER");

      if (selectedIsLeader) {
        return directionOptions;
      }

      const leaderId = selectedEmployee?.leader?.id;
      if (!leaderId) return [];

      const leaderRecord = employees.find((e) => Number(e.id) === Number(leaderId));
      return leaderRecord && hasId(leaderRecord) ? [mapToOption(leaderRecord)] : [];
    }

    const isLeaderNotExtra = roles?.isLeader && !roles?.isExtra;
    const ownId = Number(session?.uid?.idEmployee);

    if (isLeaderNotExtra) {
      if (selectedId === ownId) {
        return directionOptions;
      }

      if (selectedId) {
        const subordinate = employees.find((e) => Number(e.id) === selectedId);
        const leaderId = subordinate?.leader?.id;

        if (!leaderId) return [];

        const leaderRecord = employees.find((e) => Number(e.id) === Number(leaderId));

        return leaderRecord && hasId(leaderRecord) ? [mapToOption(leaderRecord)] : [];
      }

      return [];
    }

    return employees.filter(hasId).map(mapToOption);
  }, [session, directionList, employees, idEmployeeSelected, roles]);

  useEffect(() => {
    const employeeId = Number(session?.uid?.id);
    if (!employeeId) return;


    if (roles?.isLeader && !roles?.isExtra) {
      const values: TInputs = {
        ...DEFAULT_VALUES,
        idEmployee: employeeId,
        idLeader: Number(directionList?.[0]?.id)
      };

      reset(values);
      return
    }

    if (roles?.isExtra || roles?.isDoh && !roles?.isLeader) {
      const values: TInputs = {
        ...DEFAULT_VALUES,
        idEmployee: null,
        idLeader: null
      };
      reset(values);
      return
    }

    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee: employeeId,
      idLeader: employees.find((e) => Number(e.id) === Number(employeeId))?.leader?.id || null,
    };

    reset(values);
  }, [reset, employees, session, directionList, roles]);

  useEffect(() => {
    if (dateInit) {
      setValue("dateEnd", dateInit);
    }
  }, [dateInit, setValue]);

  // useEffect(() => {
  //   if (!idEmployeeSelected) return;

  //   let cancelled = false;

  //   const run = async () => {
  //     try {
  //       const employeeId = Number(idEmployeeSelected);
  //       if (!employeeId || Number.isNaN(employeeId)) return;

  //       const emp = await findEmployeeById({ id: employeeId });

  //       if (cancelled || !emp) return;

  //       const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;

  //       if (emp.isLeader) {
  //         if (!leaderFromConfig) return;

  //         setValue("idLeader", Number(leaderFromConfig), {
  //           shouldDirty: true,
  //           shouldValidate: true,
  //         });
  //         return;
  //       }

  //       const leaderId = emp?.leader?.id ?? null;


  //       setValue("idLeader", leaderId ? Number(leaderId) : null, {
  //         shouldDirty: true,
  //         shouldValidate: true,
  //       });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   run();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [idEmployeeSelected, config, setValue]);

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

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (!data.signature || data.signature && data.signature === "") {
      modalError("La firma es obligatoria");
      return;
    }

    modalConfirm("¿Seguro que quieres guardar este permiso?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando permiso...");

        const newData = {
          idEmployee: data.idEmployee,
          idLeader: data.idLeader,
          idPersonDoh: data.idPersonDoh,
          incidence: data.incidence,
          type: data.type,
          motive: data.motive,
          dateInit: data.dateInit,
          dateEnd: data.dateEnd,
          signature: data.signature,
          forDays: data.modeSelect === "forDays",
          forHours: data.modeSelect === "forHours",
          hourInit: data.modeSelect === "forDays" ? "" : data.hourInit,
          hourEnd: data.modeSelect === "forDays" ? "" : data.hourEnd,
        };

        const res = await createPermission({ data: newData });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo actualizar");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Actualizado correctamente");
        setFeedback("success");
        router.push("/app/permissions");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading" || isSubmitting}>
        <Loading message={feedbackMsg || "Cargando..."} />
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

                <Card className="rounded-4 shadow-sm mb-3">
                  <Card.Body className="p-3 p-md-5">
                    <div className="mb-4">
                      <h5 className="fw-semibold mb-1">Datos generales</h5>
                      <p className="text-muted mb-3">
                        Captura el empleado, motivo, fecha y firma del permiso.
                      </p>

                      <Card className="border rounded-4 mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-person text-primary" />
                            <h6 className="mb-0 fw-bold">Datos del empleado</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={12}>
                              <RelationField
                                register={register("idEmployee", {
                                  required: true,
                                  setValueAs: (v) => (v === "" ? null : Number(v)),
                                })}
                                options={filteredEmployees.map((e) => ({
                                  id: Number(e.id!),
                                  displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                  name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                }))}
                                label="Empleado:"
                                control={control}
                                callBackMode="id"
                                readonly={readInput}
                                className="text-uppercase border"
                              />
                            </Col>

                            <Col md={6}>
                              <RelationField
                                readonly={readInput}
                                register={register("idLeader", {
                                  required: true,
                                  setValueAs: (v) => (v === "" ? null : Number(v)),
                                })}
                                options={leaderOptions}
                                control={control}
                                callBackMode="id"
                                label="Líder:"
                                className="text-uppercase border"
                              />
                            </Col>

                            <Col md={6}>
                              <FieldSelect
                                register={register("idPersonDoh", { required: true })}
                                options={
                                  dohMap?.employee
                                    ? [{
                                      value: dohMap.employee.id,
                                      label: `${dohMap.employee.lastName} ${dohMap.employee.name} `,
                                    }]
                                    : []
                                }
                                label="D.O.H.:"
                                className="text-uppercase border"
                                readonly={!readOnlyDoh}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="border rounded-4 mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-card-text text-warning" />
                            <h6 className="mb-0 fw-bold">Motivo del permiso</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={12}>
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

                            <Col md={12}>
                              <Entry
                                label="Descripción del motivo:"
                                register={register("motive", { required: true })}
                                invalid={!!errors.motive}
                                className="border text-uppercase"
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="border rounded-4 mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-calendar-range text-success" />
                            <h6 className="mb-0 fw-bold">Fecha y horario</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={12}>
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

                            <Col md={6}>
                              <Entry
                                label="Fecha inicio:"
                                type="date"
                                register={register("dateInit")}
                                className="border text-left text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                label="Fecha final:"
                                type="date"
                                register={register("dateEnd")}
                                invalid={!!errors.dateEnd}
                                readonly={modeSelect === "forHours"}
                                min={dateInit}
                                className="border text-left text-uppercase"
                              />
                            </Col>

                            <ConditionalRender cond={modeSelect === "forHours"}>
                              <>
                                <Col md={6}>
                                  <Entry
                                    register={register("hourInit")}
                                    label="Hora inicial:"
                                    className="text-left border"
                                    type="time"
                                  />
                                </Col>

                                <Col md={6}>
                                  <Entry
                                    label="Hora final:"
                                    register={register("hourEnd")}
                                    className="text-left border"
                                    type="time"
                                  />
                                </Col>
                              </>
                            </ConditionalRender>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="border rounded-4">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-pen text-info" />
                            <h6 className="mb-0 fw-bold">Firma</h6>
                          </div>

                          <div className="w-100 overflow-hidden">
                            <SignatureInput
                              name="signature"
                              register={register}
                              control={control}
                            />
                          </div>
                        </Card.Body>
                      </Card>
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