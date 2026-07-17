"use client";

import { createNewsletter } from "@/app/actions/newsletter-actions";
import ConditionalRender from "@/components/ConditionalRender";
import { Entry } from "@/components/fields";
import { ImageField } from "@/components/fields/ImageField";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { INewsletter } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

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
  id,
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

  const { modalError } = useModals();

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const originalValuesRef = useRef<TInputs | null>(null);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
  if (id && id === "null") {
    const res = await createNewsletter({ data });

    if (!res.success) return modalError(res.message);

    toast.success(res.message);
    router.back();
  } else {
  }
};

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
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
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <ConditionalRender cond={isSubmitting}>
        <Loading message="Guardando..." />
      </ConditionalRender>

      <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
        <Row className="m-2">
          <Col xs={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
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

              <Card className="rounded-4 shadow-sm border">
                <Card.Body className="p-3 p-md-5">
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Información del boletín</h5>
                    <p className="text-muted mb-3">
                      Captura el contenido principal del boletín.
                    </p>

                    <Row className="g-4">
                      <Col xs={12}>
                        <Entry
                          label="Título"
                          register={register("title", { required: true })}
                          className="border"
                        />
                      </Col>

                      <Col xs={12}>
                        <Entry
                          label="Descripción"
                          as="textarea"
                          rows={3}
                          register={register("text")}
                          className="border"
                        />
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Periodo de publicación</h5>
                    <p className="text-muted mb-3">
                      Define cuándo estará visible el boletín.
                    </p>

                    <Row className="g-4">
                      <Col xs={12} md={6}>
                        <Entry
                          label="Fecha inicio"
                          register={register("dateInitiPublish")}
                          type="date"
                          min={formatDate(new Date(), "yyyy-MM-dd")}
                          className="border"
                        />
                      </Col>

                      <Col xs={12} md={6}>
                        <Entry
                          label="Fecha final"
                          register={register("dateEndPublish")}
                          type="date"
                          min={fechaInicio}
                          readonly={!fechaInicio}
                          className="border"
                        />
                      </Col>

                      <Col xs={12} md={6}>
                        <Entry
                          label="Hora inicio"
                          register={register("hourInitiPublish")}
                          type="time"
                          className="border"
                        />
                      </Col>

                      <Col xs={12} md={6}>
                        <Entry
                          label="Hora final"
                          register={register("hourEndPublish")}
                          type="time"
                          className="border"
                        />
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  <div>
                    <h5 className="fw-semibold mb-1">Imagen</h5>
                    <p className="text-muted mb-3">
                      Selecciona la imagen que acompañará al boletín.
                    </p>

                    <div className="w-100 text-center overflow-hidden">
                      <ImageField
                        {...register("img")}
                        height={0}
                        width={500}
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

export default NewsletterFormView;