"use client";

import { createDepartment } from "@/app/actions/departments-actions";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, RelationField } from "@/components/fields";
import { FieldGroup } from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Department, Employee } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const DEFAULT_VALUES: Department = {
  nameDepartment: "",
  description: "",
  idLeader: null,
  positions: [],
};

export default function CreateDepartmentComponent({
  employees = [],
}: {
  employees?: Employee[];
}) {
  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Department>({
    defaultValues: DEFAULT_VALUES,
  });

  const { modalError, modalConfirm } = useModals();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/departments");
  };

  const onSubmit: SubmitHandler<Department> = async (data) => {
    modalConfirm("¿Seguro que quieres guardar este departamento?", async () => {
      try {
        setLoading(true);
        setMessageLoading("Guardando departamento...");

        const res = await createDepartment({ data });

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

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading || "Guardando departamento..."} />
      </ConditionalRender>

      <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
        <Row className="m-2">
          <Col xs={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting || loading}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                  <div>
                    <h1 className="mb-1">Crear departamento</h1>
                    <p className="text-muted mb-0">
                      Registra la información del departamento.
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
                      <h5 className="fw-semibold mb-1">Datos del departamento</h5>
                      <p className="text-muted mb-3">
                        Captura el nombre, descripción y líder del departamento.
                      </p>

                      <Row className="g-4">
                        <Col xs={12} md={6}>
                          <Entry
                            register={register("nameDepartment", {
                              required: "Este campo es requerido",
                            })}
                            label="Nombre"
                            invalid={!!errors.nameDepartment}
                            feedBack={errors.nameDepartment?.message}
                            className="text-uppercase border"
                          />
                        </Col>

                        <Col xs={12} md={6}>
                          <RelationField
                            register={register("idLeader")}
                            label="Líder"
                            control={control}
                            callBackMode="id"
                            className="text-uppercase border"
                            options={employees.map((emp) => ({
                              id: emp.id ?? 0,
                              displayName: `${emp.name} ${emp.lastName}`,
                              name: `${emp.name} ${emp.lastName}`,
                            }))}
                          />
                        </Col>

                        <Col xs={12}>
                          <Entry
                            register={register("description")}
                            label="Descripción"
                            invalid={!!errors.description}
                            feedBack={errors.description?.message}
                            className="border"
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