"use client";

import { createVacation, fetchPeriods } from "@/app/actions/vacations-actions";
import { findEmployeeById } from "@/app/actions/employee-actions";
import { EmployeeRef, IConfigSystem } from "@/app/actions/configSystem-actions";
import {
  Entry,
  FieldSelect,
  RelationField,
  SignatureInput,
} from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Employee, PeriodVacation, Vacations } from "@/lib/definitions";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import useSWR from "swr";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";

type TInputs = Pick<
  Vacations,
  | "idEmployee"
  | "idLeader"
  | "idPersonDoh"
  | "idPeriod"
  | "periodDescription"
  | "dateInit"
  | "dateEnd"
> & {
  incidence: string;
  signature: string;
};

const DEFAULT_VALUES: TInputs = {
  idEmployee: null,
  idLeader: null,
  idPersonDoh: null,
  idPeriod: null,
  periodDescription: "",
  dateEnd: "",
  dateInit: "",
  incidence: "",
  signature: ""
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreateVacationComponent({
  employees,
}: {
  employees: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<TInputs>();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const dateInit = watch("dateInit");
  const idEmployeeSelected = watch("idEmployee");
  const idPeriodSelected = watch("idPeriod");

  const session = useSessionSnapshot();
  const { data } = useSWR("/api/configsystem", fetcher);

  const config: IConfigSystem | null = useMemo(() => {
    const maybe = data?.data?.[0];
    return maybe ?? null;
  }, [data]);

  const { modalError,modalConfirm } = useModals();
  const router = useRouter();

  const [periods, setPeriods] = useState<PeriodVacation[]>([]);

  const originalValuesRef = useRef<TInputs | null>(null);

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const readInput = !session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra && !session?.uid?.roles.isDoh && !session?.uid?.roles.isApproverLeaders && !session?.uid?.roles.isApproverDoh;
  const readOnlyDoh = !session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra && session?.uid?.roles.isDoh && !session?.uid?.roles.isApproverLeaders && !session?.uid?.roles.isApproverDoh && Number(session.uid.idEmployee) === Number(config?.permissions.approvalDoh.idPerson);
  const directionList: EmployeeRef[] | undefined = config?.permissions.extra?.employees;
  const idEmployee = Number(session?.uid?.idEmployee);

  // Este sirve para filtrar el empleado al que se le asignara el registro
  useEffect(() => {
    if (session?.uid?.roles?.isLeader) {

      const filtrados = employees.filter(
        (el: Employee) => Number(el.department?.idLeader) === Number(session.uid?.idEmployee)
      );
      setFilteredEmployees(filtrados);
    } else {
      setFilteredEmployees(employees);
    }
  }, [session, idEmployee, employees]);

  useEffect(() => {
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const employeeId = Number(idEmployeeSelected);
        if (!employeeId || Number.isNaN(employeeId)) return;

        const ownId = Number(session?.uid?.idEmployee);
        const isLeaderNotExtra = session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra;

        // Caso: el líder vuelve a seleccionarse a sí mismo -> default a la posición 0 de directionList
        if (isLeaderNotExtra && employeeId === ownId) {
          setValue("idLeader", Number(directionList?.[0]?.id) || null, {
            shouldDirty: true,
            shouldValidate: true,
          });
          return;
        }

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
  }, [idEmployeeSelected, config, setValue, session, directionList]);

  const leaderOptions = useMemo(() => {
    const mapToOption = (e: Employee | EmployeeRef) => ({
      id: e.id!,
      displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
      name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
    });

    function hasId<T extends Employee | EmployeeRef>(e: T): e is T & { id: number } {
      return e.id !== undefined;
    }

    const isLeaderNotExtra = session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra;
    const ownId = Number(session?.uid?.idEmployee);
    const selectedId = Number(idEmployeeSelected);

    if (isLeaderNotExtra) {
      // Caso 1: seleccionó a sí mismo -> puede elegir su propio líder (directionList)
      if (selectedId === ownId) {
        return (directionList ?? []).filter(hasId).map(mapToOption);
      }

      // Caso 2: seleccionó a un subordinado -> mostrar fijo el líder real de ese subordinado
      if (selectedId) {
        const subordinate = employees.find((e) => Number(e.id) === selectedId);
        const leaderId = subordinate?.leader?.id;

        if (!leaderId) return [];

        // Buscamos el registro completo del líder (para nombre/apellido) dentro de employees
        const leaderRecord = employees.find((e) => Number(e.id) === Number(leaderId));

        return leaderRecord && hasId(leaderRecord) ? [mapToOption(leaderRecord)] : [];
      }

      return [];
    }

    return employees.filter(hasId).map(mapToOption);
  }, [session, directionList, employees, idEmployeeSelected]);

  useEffect(() => {
    const employeeId = Number(session?.uid?.id);
    if (!employeeId) return;


    if (session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra) {
      const values: TInputs = {
        ...DEFAULT_VALUES,
        idEmployee: employeeId,
        idLeader: Number(directionList?.[0]?.id)
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
  }, [reset, employees, session, directionList]);

  // ✅ periodo seleccionado para mostrar stats
  const selectedPeriod = useMemo(() => {
    const pid = Number(idPeriodSelected);
    if (!pid || Number.isNaN(pid)) return null;
    return periods.find((p) => Number(p.id) === pid) ?? null;
  }, [idPeriodSelected, periods]);

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/vacationList?view_type=list&id=null");
  };

  useEffect(() => {
    const values: TInputs = {
      idEmployee: Number(session?.uid?.id),
      idLeader: null,
      idPersonDoh: null,
      idPeriod: null,
      dateEnd: "",
      dateInit: "",
      incidence: "VACACIONES",
      periodDescription: "",
      signature: "",
    };

    reset(values);
    originalValuesRef.current = values;
  }, [reset, session]);

  useEffect(() => {
    if (!idEmployeeSelected) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await findEmployeeById({ id: Number(idEmployeeSelected) });
        if (cancelled) return;

        const emp = res;
        if (!emp) return;

        const leaderFromConfig = config?.permissions?.approvalLeaders?.idPerson;

        if (emp.isLeader) {
          if (!leaderFromConfig) return;
          setValue("idLeader", Number(leaderFromConfig), { shouldDirty: true });
          return;
        }

        const leaderId = emp?.leader?.id ?? null;
        setValue("idLeader", leaderId ? Number(leaderId) : null, {
          shouldDirty: true,
        });
      } catch (e) {
        console.log(e);
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

    const currentDoh = watch("idPersonDoh");
    if (currentDoh) return;

    setValue("idPersonDoh", Number(dohFromConfig), { shouldDirty: false });
  }, [config, setValue, watch]);

  const getPeriods = useCallback(async () => {
    try {
      if (!idEmployeeSelected) {
        setPeriods([]);
        return;
      }

      const res = await fetchPeriods({
        idEmployee: Number(idEmployeeSelected),
      });

      const nextPeriods = (res ?? []) as PeriodVacation[];
      setPeriods(nextPeriods);

      // ✅ si aún no hay periodo, setear el primero
      const current = watch("idPeriod");
      const currentNum = Number(current);
      if (
        (!current || Number.isNaN(currentNum) || currentNum === 0) &&
        nextPeriods.length > 0
      ) {
        setValue("idPeriod", Number(nextPeriods[0].id), { shouldDirty: false });
      }
    } catch (error) {
      console.error(error);
      setPeriods([]);
    }
  }, [idEmployeeSelected, setValue, watch]);

  useEffect(() => {
    getPeriods();
  }, [getPeriods]);


  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (!data.signature || data.signature && data.signature === "") {
      modalError("La firma es obligatoria");
      return;
    }

    modalConfirm("¿Seguro que quieres guardar este permiso?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando permiso...");

        const res = await createVacation({ data });

        if (!res.success) {
          modalError(res.message);
          return;
        }

        toast.success(res.message);
        router.push("/app/vacationList");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando permiso..."} />
      </ConditionalRender>

      <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
        <Row className="m-2">
          <Col xs={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <div>
                  <h1 className="mb-1">Crear vacaciones</h1>
                  <p className="text-muted mb-0">
                    Registra la solicitud de vacaciones del empleado.
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
                    disabled={isSubmitting || !isDirty}
                    onClick={handleReverse}
                  >
                    Limpiar
                  </Button>

                  <Button
                    className="bg-success border-success"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>

              <Card className="rounded-4 shadow-sm border">
                <Card.Body className="p-3 p-md-5">
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Datos del empleado</h5>
                    <p className="text-muted mb-3">
                      Selecciona el empleado, líder, periodo vacacional y D.O.H.
                    </p>

                    <Row className="g-4">
                      <Col xs={12}>
                        <RelationField
                          readonly={readInput}
                          register={register("idEmployee")}
                          options={filteredEmployees.map((e) => ({
                            id: Number(e.id),
                            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
                            name: `${e.lastName} ${e.name}`.toUpperCase(),
                          }))}
                          label="Empleado"
                          callBackMode="id"
                          control={control}
                        />
                      </Col>

                      <Col xs={12} md={4}>
                        <RelationField
                          register={register("idLeader")}
                          options={leaderOptions}
                          label="Líder"
                          callBackMode="id"
                          control={control}
                          readonly={readInput}
                        />
                      </Col>

                      <Col xs={12} md={4}>
                        <FieldSelect
                          label="Periodo vacacional"
                          options={
                            periods.length > 0
                              ? periods.map((p) => ({
                                label: p.periodDescription,
                                value: Number(p.id),
                              }))
                              : [
                                {
                                  label: "El empleado no cuenta con periodos disponibles",
                                  value: "",
                                },
                              ]
                          }
                          register={register("idPeriod", {
                            required: periods.length > 0,
                          })}
                          className="border"
                        />
                      </Col>

                      <Col xs={12} md={4}>
                        <RelationField
                          register={register("idPersonDoh")}
                          options={employees.map((e) => ({
                            id: Number(e.id),
                            displayName: `${e.lastName} ${e.name}`.toUpperCase(),
                            name: `${e.lastName} ${e.name}`.toUpperCase(),
                          }))}
                          label="D.O.H."
                          callBackMode="id"
                          control={control}
                          readonly={!readOnlyDoh}
                        />
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Fechas de vacaciones</h5>
                    <p className="text-muted mb-3">
                      Indica la fecha de inicio y fin del periodo solicitado.
                    </p>

                    <Row className="g-4">
                      <Col xs={12} md={6}>
                        <Entry
                          label="Inicio"
                          type="date"
                          register={register("dateInit")}
                          className="border"
                        />
                      </Col>

                      <Col xs={12} md={6}>
                        <Entry
                          label="Final"
                          type="date"
                          register={register("dateEnd")}
                          min={dateInit}
                          className="border"
                        />
                      </Col>
                    </Row>
                  </div>

                  {selectedPeriod && (
                    <>
                      <hr className="my-4" />

                      <div className="mb-4">
                        <h5 className="fw-semibold mb-1">Resumen del periodo</h5>
                        <p className="text-muted mb-3">
                          Consulta los días usados y disponibles del periodo seleccionado.
                        </p>

                        <Row className="g-4">
                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label className="fw-semibold">
                                Días aprobados usados
                              </Form.Label>
                              <Form.Control
                                value={String(selectedPeriod.usedDaysApproved ?? 0)}
                                disabled
                                readOnly
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12} md={6}>
                            <Form.Group>
                              <Form.Label className="fw-semibold">
                                Días disponibles
                              </Form.Label>
                              <Form.Control
                                value={String(selectedPeriod.availableDays ?? 0)}
                                disabled
                                readOnly
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}

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
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CreateVacationComponent;
