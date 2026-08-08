"use client";

import { createUser } from "@/app/actions/user-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import {
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, Permission, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

type TInputs = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: UserRole | null;
  permissions: Permission[];
  phone: PhoneNumberFormat | string | null;
  status: 1 | 2 | 3;
  imageUrl?: string | null;
  idEmployee?: number | null;
};

const DEFAULT_VALUES: TInputs = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  gender: null,
  role: null,
  permissions: [],
  phone: null,
  status: 1,
  imageUrl: null,
  idEmployee: null,
};

export default function CreateUserComponent({
  perms,
  employees,
}: {
  perms: Permission[];
  employees: Employee[];
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });



  const { modalConfirm } = useModals();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, setMessageLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const permisosSeleccionados = watch("permissions") || [];

  const isPermSelected = (id: number) =>
    permisosSeleccionados.some((perm) => perm.id === id);

  const toggleSelectAll = () => {
    const allSelected = perms.every((perm) => isPermSelected(perm.id ?? 0));

    setValue("permissions", allSelected ? [] : [...perms], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleBack = () => {
    router.push("/app/users");
  };

  const onSubmit: SubmitHandler<TInputs> = async (data) => {

    modalConfirm("¿Seguro que quieres guardar el usuario?", async () => {
      try {
        setFeedback("loading");
        setFeedbackMsg("Guardando usuario...");

        const resCreate = await createUser({
          ...data,
          status: 1,
        });

        if (!resCreate.success) {
          setFeedbackMsg(resCreate.message || "No se pudo crear usuario");
          setFeedback("error");
          return;
        }

        setFeedbackMsg(resCreate.message || "Usuario creado correctamente");
        setFeedback("success");
        setTimeout(() => {
          router.push("/app/users?view_type=list&id=null");
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
          <Col xs={12} md={12} lg={12}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <div>
                  <h1 className="mb-1">Crear Usuario</h1>
                  <p className="text-muted mb-0">
                    Registra la información del usuario.
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>

              <Card className="rounded-4 shadow-sm border">
                <Card.Body className="p-3 p-md-5">
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-1">Datos personales</h5>
                    <p className="text-muted mb-3">
                      Captura la información básica del usuario.
                    </p>

                    <Card className="border rounded-4 mb-3">
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <i className="bi bi-person text-primary" />
                          <h6 className="mb-0 fw-bold">Información personal</h6>
                        </div>

                        <Row className="g-3">
                          <Col md={6}>
                            <Entry
                              register={register("name", {
                                required: "Nombre de usuario es requerido",
                              })}
                              label="Nombre:"
                              invalid={!!errors.name}
                              feedBack={errors.name?.message}
                              className="text-uppercase border"
                            />
                          </Col>

                          <Col md={6}>
                            <Entry
                              register={register("lastName", {
                                required: "Apellidos es requerido",
                              })}
                              label="Apellidos:"
                              invalid={!!errors.lastName}
                              feedBack={errors.lastName?.message}
                              className="text-uppercase border"
                            />
                          </Col>

                          <Col md={6}>
                            <Entry
                              register={register("phone", {
                                required: "Teléfono es requerido",
                              })}
                              label="Teléfono:"
                              invalid={!!errors.phone}
                              feedBack={errors.phone?.message}
                              className="text-uppercase border"
                            />
                          </Col>

                          <Col md={6}>
                            <FieldSelect
                              register={register("gender", {
                                required: "Este campo es requerido",
                              })}
                              options={[
                                { value: "MASCULINO", label: "Masculino" },
                                { value: "FEMENINO", label: "Femenino" },
                              ]}
                              label="Género:"
                              invalid={!!errors.gender}
                              feedBack={errors.gender?.message}
                              className="text-uppercase border"
                            />
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Card className="border rounded-4 mb-3">
                      <Card.Body>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <i className="bi bi-shield-lock text-warning" />
                          <h6 className="mb-0 fw-bold">Cuenta y acceso</h6>
                        </div>

                        <Row className="g-3">
                          <Col md={6}>
                            <Entry
                              register={register("email", {
                                required: "Correo es requerido",
                                pattern: {
                                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                  message: "Correo electrónico inválido",
                                },
                              })}
                              label="Correo:"
                              invalid={!!errors.email}
                              feedBack={errors.email?.message}
                              type="email"
                              className="text-uppercase border"
                            />
                          </Col>

                          <Col md={6}>
                            <Entry
                              register={register("password", {
                                required: "Contraseña es requerida",
                              })}
                              type={showPassword ? "text" : "password"}
                              label="Contraseña:"
                              invalid={!!errors.password}
                              feedBack={errors.password?.message}
                              className="border"
                              suffix={
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((prev) => !prev)}
                                  className="btn btn-link p-0 text-info"
                                  tabIndex={10}
                                >
                                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: "1.3rem" }} />
                                </button>
                              }
                            />
                          </Col>

                          <Col md={6}>
                            <FieldSelect
                              register={register("role", {
                                required: "Este campo es requerido",
                              })}
                              options={[
                                { value: "SUPER_ADMIN", label: "SUPER ADMIN" },
                                { value: "ADMIN", label: "ADMIN" },
                                { value: "CHECADOR", label: "CHECADOR" },
                              ]}
                              label="Rol:"
                              invalid={!!errors.role}
                              feedBack={errors.role?.message}
                              className="text-uppercase border"
                            />
                          </Col>

                          <Col md={6}>
                            <RelationField
                              options={employees.map((e) => ({
                                id: Number(e.id) || 0,
                                displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                              }))}
                              register={register("idEmployee")}
                              control={control}
                              callBackMode="id"
                              label="Empleado relacionado:"
                            />
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>

                  <hr className="my-4" />

                  <Card className="border rounded-4 mb-3">
                    <Card.Body>
                      <div>
                        <h5 className="fw-semibold mb-1">
                          Permisos ({permisosSeleccionados.length})
                        </h5>
                        <p className="text-muted mb-3">
                          Selecciona los permisos que tendrá este usuario.
                        </p>

                        <FormBook dKey="permissions">
                          <FormPage
                            title={`Permisos (${permisosSeleccionados.length})`}
                            eventKey="permissions"
                          >
                            <Button
                              type="button"
                              className="my-3"
                              onClick={toggleSelectAll}
                            >
                              {perms.every((perm) => isPermSelected(perm.id ?? 0))
                                ? "Deseleccionar todos"
                                : "Seleccionar todos"}
                            </Button>

                            <Row className="g-2">
                              {perms.map((permiso) => (
                                <Col key={permiso.id} xs={12} md={6} lg={4}>
                                  <div className="p-2 bg-body-tertiary text-uppercase rounded fw-semibold">
                                    <Controller
                                      name="permissions"
                                      control={control}
                                      render={({ field }) => {
                                        const selectedPermissions = field.value || [];
                                        const isChecked = selectedPermissions.some(
                                          (p: Permission) => p.id === permiso.id
                                        );

                                        const handleChange = () => {
                                          if (isChecked) {
                                            field.onChange(
                                              selectedPermissions.filter(
                                                (p: Permission) => p.id !== permiso.id
                                              )
                                            );
                                          } else {
                                            field.onChange([
                                              ...selectedPermissions,
                                              permiso,
                                            ]);
                                          }
                                        };

                                        return (
                                          <Form.Check
                                            type="checkbox"
                                            label={permiso.text.replace(/_/g, " ")}
                                            checked={isChecked}
                                            onChange={handleChange}
                                          />
                                        );
                                      }}
                                    />
                                  </div>
                                </Col>
                              ))}
                            </Row>
                          </FormPage>
                        </FormBook>
                      </div>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}