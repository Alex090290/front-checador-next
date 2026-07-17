"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, RelationField } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  Department,
  Employee,
  ModalBasicProps,
} from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";

type ModalAction = {
  sendData: (data: Department) => Promise<ActionResponse<boolean | null>>;
  department?: Department | null;
  employees?: Employee[];
};

function getDefaultValues(department?: Department | null): Department {
  return {
    nameDepartment: department?.nameDepartment || "",
    description: department?.description || "",
    idLeader: department?.idLeader || null,
    positions: department?.positions || [],
  };
}

export default function FormUpdateDepartment({
  onHide,
  sendData,
  department,
  employees = [],
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Department>({
    defaultValues: getDefaultValues(department),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { modalError, modalConfirm } = useModals();
  const [, setMessageLoading] = useState("");

  useEffect(() => {
    setLoading(true);
    try {
      reset(getDefaultValues(department));
    } catch {
      modalError("No se pudo cargar la información del departamento");
    } finally {
      setLoading(false);
    }
  }, [department, reset, modalError]);

  const onSubmit: SubmitHandler<Department> = async (data) => {
    onHide();

    modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {

      try {
        setLoading(true);
        setMessageLoading("Actualizando cambios...");
        const res = await sendData(data);

        if (!res.success) {
          modalError(res.message);
          console.log(res.message);

          return;
        }
        onHide();
        router.refresh();

      } finally {

        setLoading(false);
        setMessageLoading("");
      }
    })
  };

  return (
    <>
      <ConditionalRender cond={loading || isSubmitting}>
        <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
      </ConditionalRender>

      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h4 className="mb-1 fw-bold">Departamento</h4>
            <p className="text-muted mb-0">
              Registra el nombre, descripción y líder del departamento.
            </p>
          </div>

          <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
            Nuevo
          </span>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={loading || isSubmitting}>

            <Card className="border rounded-4 mb-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-diagram-3 text-primary" />
                  <h6 className="mb-0 fw-bold">Datos del departamento</h6>
                </div>

                <Row className="g-3">
                  <Col md={12}>
                    <Entry
                      register={register("nameDepartment", {
                        required: "Este campo es requerido",
                      })}
                      label="Nombre:"
                      invalid={!!errors.nameDepartment}
                      feedBack={errors.nameDepartment?.message}
                      className="text-uppercase border"
                    />
                  </Col>

                  <Col md={12}>
                    <Entry
                      register={register("description")}
                      label="Descripción:"
                      invalid={!!errors.description}
                      feedBack={errors.description?.message}
                      className="text-uppercase border"
                    />
                  </Col>

                  <Col md={12}>
                    <RelationField
                      register={register("idLeader")}
                      label="Líder:"
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
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onHide}
                disabled={loading || isSubmitting}
              >
                Cancelar
              </Button>

              <Button type="submit" variant="success" disabled={loading || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>

          </fieldset>
        </Form>
      </div>
    </>
  );
}