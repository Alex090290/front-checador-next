"use client";

import { createBranch } from "@/app/actions/branches-actionst";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Branch } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

const DEFAULT_VALUES: Branch = {
  name: "",
  idManager: null,
  street: "",
  numberIn: "",
  numberOut: "",
  state: "",
  country: "México",
  neighborhood: "",
  municipality: "",
  zipCode: null,
  lng: null,
  lat: null,
};

export default function CreateBranchComponent() {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Branch>({
    defaultValues: DEFAULT_VALUES,
  });

  const { modalConfirm } = useModals();
  const router = useRouter();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/branches");
  };

  const onSubmit: SubmitHandler<Branch> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar esta sucursal?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando sucursal...");

        const res = await createBranch({ branch: data });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo crear la sucursal");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Sucursal creada correctamente");
        setFeedback("success");
        setTimeout(() => {
          router.push("/app/branches");
        }, 1200);
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  return (
    <>
      <ConditionalRender cond={feedback === "loading"}>
        <Loading message={feedbackMsg || "Actualizando..."} />
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
                    <h1 className="mb-1">Crear sucursal</h1>
                    <p className="text-muted mb-0">
                      Registra la información general y ubicación de la sucursal.
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
                        Captura la información básica de la sucursal.
                      </p>

                      <Card className="border rounded-4 mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-building text-primary" />
                            <h6 className="mb-0 fw-bold">Datos de la sucursal</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={12}>
                              <Entry
                                register={register("name", {
                                  required: "Este campo es requerido",
                                })}
                                label="Nombre:"
                                invalid={!!errors.name}
                                feedBack={errors.name?.message}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={12}>
                              <Entry
                                register={register("street", {
                                  required: "Este campo es requerido",
                                })}
                                label="Calle:"
                                invalid={!!errors.street}
                                feedBack={errors.street?.message}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={4}>
                              <Entry
                                register={register("numberOut", {
                                  required: "Número exterior es requerido",
                                })}
                                label="No. Exterior:"
                                invalid={!!errors.numberOut}
                                feedBack={errors.numberOut?.message}
                                className="border"
                              />
                            </Col>

                            <Col md={4}>
                              <Entry
                                register={register("numberIn")}
                                label="No. Interior:"
                                invalid={!!errors.numberIn}
                                feedBack={errors.numberIn?.message}
                                className="border"
                              />
                            </Col>

                            <Col md={4}>
                              <Entry
                                register={register("zipCode", {
                                  valueAsNumber: true,
                                })}
                                label="Código Postal:"
                                invalid={!!errors.zipCode}
                                feedBack={errors.zipCode?.message}
                                className="border"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                register={register("neighborhood", {
                                  required: "Colonia es requerida",
                                })}
                                label="Colonia:"
                                invalid={!!errors.neighborhood}
                                feedBack={errors.neighborhood?.message}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                register={register("municipality", {
                                  required: "Municipio es requerido",
                                })}
                                label="Municipio:"
                                invalid={!!errors.municipality}
                                feedBack={errors.municipality?.message}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                register={register("state", {
                                  required: "Estado es requerido",
                                })}
                                label="Estado:"
                                invalid={!!errors.state}
                                feedBack={errors.state?.message}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                register={register("country", {
                                  required: "País es requerido",
                                })}
                                label="País:"
                                invalid={!!errors.country}
                                feedBack={errors.country?.message}
                                className="border text-uppercase"
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="border rounded-4">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-geo-alt text-success" />
                            <h6 className="mb-0 fw-bold">Ubicación GPS</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={6}>
                              <Entry
                                register={register("lat", {
                                  valueAsNumber: true,
                                })}
                                label="Latitud:"
                                invalid={!!errors.lat}
                                feedBack={errors.lat?.message}
                                className="border"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                register={register("lng", {
                                  valueAsNumber: true,
                                })}
                                label="Longitud:"
                                invalid={!!errors.lng}
                                feedBack={errors.lng?.message}
                                className="border"
                              />
                            </Col>
                          </Row>
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