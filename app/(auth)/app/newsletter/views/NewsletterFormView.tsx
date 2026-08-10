"use client";

import { createNewsletter } from "@/app/actions/newsletter-actions";
import ConditionalRender from "@/components/ConditionalRender";
import ErrorOverlay from "@/components/ErrorOverlay";
import { Entry } from "@/components/fields";
import { ImageField } from "@/components/fields/ImageField";
import Loading from "@/components/LoadingSpinner";
import SuccessOverlay from "@/components/SuccessOverlay";
import { useModals } from "@/context/ModalContext";
import { INewsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  img: string | null;
  title: string;
  text: string;
  dateInitiPublish: string;
  hourInitiPublish: string;
  dateEndPublish: string;
  hourEndPublish: string;
};

const DEFAULT_VALUES: TInputs = {
  title: "",
  text: "",
  img: null,
  dateEndPublish: "",
  dateInitiPublish: "",
  hourEndPublish: "",
  hourInitiPublish: "",
};

function NewsletterFormView({
  newsletter,
}: {
  id: string;
  newsletter: INewsletter | null;
}) {
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });

  const [fechaInicio] = watch(["dateInitiPublish", "hourInitiPublish"]);

  const { modalConfirm } = useModals();
  const router = useRouter();
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar este boletín?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando boletín...");

        const res = await createNewsletter({ data });

        if (!res.success) {
          setFeedbackMsg(res.message || "No se pudo crear el boletín");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(res.message || "Boletín creado correctamente");
        setFeedback("success");
        router.back();
      } catch {
        setFeedbackMsg("Error inesperado, intenta de nuevo");
        setFeedback("error");
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

  const handleBack = () => {
    setFeedback("loading");
    setFeedbackMsg("Cargando...");
    router.push("/app/newsletter?view_type=list&id=null");
  };

  useEffect(() => {
    if (!newsletter) {
      reset(DEFAULT_VALUES);
      originalValuesRef.current = DEFAULT_VALUES;
    } else {
      const values: TInputs = {
        title: newsletter.title,
        text: newsletter.text,
        img: newsletter.img || null,
        dateEndPublish: newsletter.dateEndPublish
          ? formatDate(newsletter.dateEndPublish, "yyyy-MM-dd")
          : "",
        dateInitiPublish: newsletter.dateInitiPublish
          ? formatDate(newsletter.dateInitiPublish, "yyyy-MM-dd")
          : "",
        hourEndPublish: newsletter.dateEndPublish
          ? formatDate(newsletter.dateEndPublish, "HH:mm")
          : "",
        hourInitiPublish: newsletter.dateInitiPublish
          ? formatDate(newsletter.dateInitiPublish, "HH:mm")
          : "",
      };

      reset(values);
      originalValuesRef.current = values;
    }
  }, [reset, newsletter]);

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
                    <h1 className="mb-1">
                      {newsletter?.title || "Crear boletín"}
                    </h1>
                    <p className="text-muted mb-0">
                      Captura el contenido y configura el periodo de publicación.
                    </p>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="outline-secondary"
                      type="button"
                      disabled={isSubmitting || loading}
                      onClick={handleBack}
                    >
                      Cancelar
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSubmitting || loading || !isDirty}
                      onClick={() => reset(originalValuesRef.current || DEFAULT_VALUES)}
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
                        Captura el contenido, periodo de publicación e imagen del boletín.
                      </p>

                      <Card className="border rounded-4 mb-3">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-file-text text-primary" />
                            <h6 className="mb-0 fw-bold">Información del boletín</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={12}>
                              <Entry
                                label="Título:"
                                register={register("title", { required: true })}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={12}>
                              <Entry
                                label="Descripción:"
                                as="textarea"
                                rows={3}
                                register={register("text")}
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
                            <h6 className="mb-0 fw-bold">Periodo de publicación</h6>
                          </div>

                          <Row className="g-3">
                            <Col md={6}>
                              <Entry
                                label="Fecha inicio:"
                                register={register("dateInitiPublish")}
                                type="date"
                                min={formatDate(new Date(), "yyyy-MM-dd")}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                label="Fecha final:"
                                register={register("dateEndPublish")}
                                type="date"
                                min={fechaInicio}
                                readonly={!fechaInicio}
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                label="Hora inicio:"
                                register={register("hourInitiPublish")}
                                type="time"
                                className="border text-uppercase"
                              />
                            </Col>

                            <Col md={6}>
                              <Entry
                                label="Hora final:"
                                register={register("hourEndPublish")}
                                type="time"
                                className="border text-uppercase"
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="border rounded-4">
                        <Card.Body>
                          <div className="d-flex align-items-center gap-2 mb-4">
                            <i className="bi bi-image text-warning" />
                            <h6 className="mb-0 fw-bold">Imagen</h6>
                          </div>

                          <div className="w-100 text-center overflow-hidden">
                            <ImageField
                              {...register("img")}
                              height={0}
                              width={500}
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

export default NewsletterFormView;