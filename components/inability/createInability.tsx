"use client";

import { createInability } from "@/app/actions/inability-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Employee } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  idEmployee: number | null;
  disabilityCategory: string;
  folio: string;
  typeOfDisability: string;
  dateInit: string;
  dateEnd: string;
  firstDoc: FileList | null;
};

const DEFAULT_VALUES: TInputs = {
  idEmployee: null,
  disabilityCategory: "",
  folio: "",
  typeOfDisability: "inicial",
  dateInit: "",
  dateEnd: "",
  firstDoc: null,
};


export default function CreateInabilityComponent({
  employees = [],
}: {
  employees?: Employee[];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });

  const session = useSessionSnapshot();
  const roles = session?.uid?.roles;
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // const dohMap = config?.permissions.approvalDoh;
  const sessionEmployeeId = Number(session?.uid?.idEmployee);
  const idEmployee = Number(session?.uid?.idEmployee);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);


  const { modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");

  const onChangeDateInit = watch("dateInit");

  const readInput = !roles?.isLeader
    && !roles?.isExtra
    && !roles?.isDoh
    && !roles?.isApproverLeaders
    && !roles?.isApproverDoh;

  useEffect(() => {
    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee:
        session?.uid?.role === "EMPLOYEE" ? sessionEmployeeId || null : null,
    };

    reset(values);
  }, [reset, session?.uid?.role, sessionEmployeeId]);

  useEffect(() => {
    if (onChangeDateInit) {
      setValue("dateEnd", onChangeDateInit);
    }
  }, [onChangeDateInit, setValue]);

  const handleClean = () => {
    const values: TInputs = {
      ...DEFAULT_VALUES,
      idEmployee:
        session?.uid?.role === "EMPLOYEE" ? sessionEmployeeId || null : null,
    };

    reset(values);
  };

  // Este sirve para filtrar el empleado al que se le asignara el registro
  useEffect(() => {
    if (roles?.isLeader && !roles?.isExtra) {

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

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/inability");
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {

    modalConfirm("¿Seguro que quieres guardar esta incapacidad?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando incapacidad...");

        const res = await createInability(data);

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo crear");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Creada correctamente");
        setFeedback("success");
        router.push("/app/inability?view_type=list&id=null");
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
                    <h1 className="mb-1">Crear incapacidad</h1>
                    <p className="text-muted mb-0">
                      Registra la información de la incapacidad del empleado.
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
                      onClick={handleClean}
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
                        Selecciona el empleado y clasifica la incapacidad.
                      </p>

                      <Row className="g-4">
                        <Col xs={12}>
                          <FieldSelect
                            readonly={readInput}
                            label="Empleado"
                            options={filteredEmployees.map((em) => ({
                              value: Number(em.id),
                              label: `${em.lastName} ${em.name}`.toUpperCase(),
                            }))}
                            register={register("idEmployee", {
                              required: true,
                              setValueAs: (v) => (v === "" ? null : Number(v))
                            })}
                            className="text-uppercase border"
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <FieldSelect
                            label="Categoría:"
                            options={[
                              { label: "Enfermedad general", value: "enfermedad general" },
                              { label: "Riesgo de trabajo", value: "riesgo de trabajo" },
                              { label: "Maternidad", value: "maternidad" },
                            ]}
                            register={register("disabilityCategory", { required: true })}
                            // readonly={session?.uid?.role === "EMPLOYEE"}
                            invalid={!!errors.disabilityCategory}
                            className="border text-uppercase"
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <FieldSelect
                            label="Tipo:"
                            options={[
                              { label: "Inicial", value: "inicial" },
                              { label: "Subsecuente", value: "subsecuente" },
                              { label: "Alta", value: "alta" },
                            ]}
                            register={register("typeOfDisability", { required: true })}
                            // readonly={session?.uid?.role === "EMPLOYEE"}
                            invalid={!!errors.typeOfDisability}
                            className="border text-uppercase"
                          />
                        </Col>
                      </Row>
                    </div>

                    <hr className="my-4" />

                    <div className="mb-4">
                      <h5 className="fw-semibold mb-1">Periodo de incapacidad</h5>
                      <p className="text-muted mb-3">
                        Indica la fecha de inicio y fin de la incapacidad.
                      </p>

                      <Row className="g-4">
                        <Col xs={12} md={6}>
                          <Entry
                            label="Fecha inicio:"
                            type="date"
                            register={register("dateInit", { required: true })}
                            invalid={!!errors.dateInit}

                            // readonly={session?.uid?.role === "EMPLOYEE"}
                            className="border"
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <Entry
                            label="Fecha fin:"
                            type="date"
                            min={onChangeDateInit}
                            register={register("dateEnd", { required: true })}
                            invalid={!!errors.dateEnd}
                            // readonly={session?.uid?.role === "EMPLOYEE"}
                            className="border"
                          />
                        </Col>
                      </Row>
                    </div>

                    <hr className="my-4" />

                    <div>
                      <h5 className="fw-semibold mb-1">Documento CITT</h5>
                      <p className="text-muted mb-3">
                        Adjunta el documento CITT e indica el folio correspondiente.
                      </p>

                      <Row className="g-4">
                        <Col xs={12} md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">CITT:</Form.Label>
                            <Form.Control
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf,.webp"
                              {...register("firstDoc", { required: true })}
                              isInvalid={!!errors.firstDoc}
                              className="border"
                            />
                            <Form.Control.Feedback type="invalid">
                              Este campo es requerido
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                          <Entry
                            register={register("folio", {
                              required: true,
                            })}
                            label="Folio CITT:"
                            className="text-uppercase border"
                            invalid={!!errors.folio}
                          />
                        </Col>
                      </Row>
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