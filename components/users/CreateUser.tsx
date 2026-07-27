"use client";

import { createUser } from "@/app/actions/user-actions";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import {
  FieldGroup,
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Employee, Permission, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import { useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";

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
  idEmployee: number | null;
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

  

  const { modalConfirm, modalError } = useModals();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

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
        setLoading(true);
        setMessageLoading("Guardando usuario...");

        const resCreate = await createUser({
          ...data,
          status: 1,
        });

        if (!resCreate.success) {
          modalError(resCreate.message || "No se pudo crear el usuario");
          return;
        }

        toast.success(resCreate.message || "Usuario creado correctamente");

        setTimeout(() => {
          router.push("/app/users?view_type=list&id=null");
        }, 1200);
      } finally {
        setLoading(false);
        setMessageLoading("");
      }
    });
  };

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

                    <Row className="g-4 align-items-start">
                      <Col xs={12} lg={6} className="d-flex">
                        <FieldGroup className="w-100">
                          <Entry
                            register={register("name", {
                              required: "Nombre de usuario es requerido",
                            })}
                            label="Nombre:"
                            invalid={!!errors.name}
                            feedBack={errors.name?.message}
                            className="text-uppercase"
                          />

                          <Entry
                            register={register("lastName", {
                              required: "Apellidos es requerido",
                            })}
                            label="Apellidos:"
                            invalid={!!errors.lastName}
                            feedBack={errors.lastName?.message}
                            className="text-uppercase"
                          />

                          <Entry
                            register={register("phone", {
                              required: "Teléfono es requerido",
                            })}
                            label="Teléfono:"
                            invalid={!!errors.phone}
                            feedBack={errors.phone?.message}
                            className="text-uppercase"
                          />

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
                            className="text-uppercase"
                          />
                        </FieldGroup>
                      </Col>

                      <Col xs={12} lg={6} className="d-flex">
                        <FieldGroup className="w-100">
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
                          />

                          <Entry
                            register={register("password", {
                              required: "Contraseña es requerida",
                            })}
                            type="password"
                            label="Contraseña:"
                            invalid={!!errors.password}
                            feedBack={errors.password?.message}
                          />

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
                          />

                          <RelationField
                            options={employees.map((e) => ({
                              id: e.id || 0,
                              displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                              name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                            }))}
                            register={register("idEmployee")}
                            control={control}
                            callBackMode="id"
                            label="Empleado relacionado:"
                          />
                        </FieldGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

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
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}