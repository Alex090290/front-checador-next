"use client";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import { Entry, FieldSelect, RelationField } from "@/components/fields";
import { FieldGroup, FieldGroupFluid } from "@/components/templates/FormView";
import { TInputsUser } from "@/components/users/UsersTableList";
import { useModals } from "@/context/ModalContext";
import {
  ActionResponse,
  ModalBasicProps,
  Permission,
  User,
  Employee,
} from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useForm, SubmitHandler, Controller } from "react-hook-form";



type ModalAction = {
  sendData: (data: TInputsUser) => Promise<ActionResponse<boolean | null>>;
  user?: User | null;
  /** Si faltan, se usan [] para evitar errores en runtime */
  perms?: Permission[];
  employees?: Employee[];
};

function formatPermission(text?: string | null) {
  if (!text) return "—";

  return text
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function sanitizeRole(role?: User["role"] | null): TInputsUser["role"] {
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "CHECADOR") {
    return role;
  }
  return null;
}

export default function FormUpdateUser({
  onHide,
  sendData,
  user,
  perms = [],
  employees = [],
}: ModalBasicProps & ModalAction) {
  const {
    reset,
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TInputsUser>({
    defaultValues: {
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
    },
  });

  const [loading, setLoading] = useState(false);
  const { modalError } = useModals();

  const permisosSeleccionados = watch("permissions") || [];

  const isPermSelected = (id: number) =>
    permisosSeleccionados.some((perm: Permission) => perm.id === id);

  const toggleSelectAll = () => {
    const allSelected = perms.every((perm) => isPermSelected(perm.id || 0));

    if (allSelected) {
      setValue("permissions", []);
    } else {
      setValue("permissions", [...perms]);
    }
  };

  const handleFetchResources = async () => {
    setLoading(true);

    try {
      reset({
        name: user?.name ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        password: "",
        gender: (user?.gender as "MASCULINO" | "FEMENINO") ?? null,
        role: sanitizeRole(user?.role),
        permissions: user?.permissions ?? [],
        phone: user?.phone?.internationalNumber ?? null,
        status: user?.status ?? 1,
        imageUrl: null,
        idEmployee: user?.idEmployee ?? null,
      });
    } catch (error) {
      modalError("No se pudo cargar la información del usuario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchResources();
  }, [user]);

  const onSubmit: SubmitHandler<TInputsUser> = async (data) => {
    const res = await sendData(data);

    if (!res.success) {
      modalError(res.message);
      return;
    }

    onHide();
  };

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message="Cargando..." />
      </ConditionalRender>
      <ConditionalRender cond={isSubmitting}>
        <Loading message="Guardando..." />
      </ConditionalRender>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <fieldset disabled={isSubmitting || loading}>
          <FieldGroupFluid>
            <Entry
              register={register("name", {
                required: "Nombre requerido",
              })}
              label="Nombre:"
              invalid={!!errors.name}
              feedBack={errors.name?.message}
              className="text-uppercase"
            />

            <Entry
              register={register("lastName", {
                required: "Apellidos requeridos",
              })}
              label="Apellidos:"
              invalid={!!errors.lastName}
              feedBack={errors.lastName?.message}
              className="text-uppercase"
            />

            <Entry
              register={register("email", {
                required: "Correo requerido",
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
              register={register("phone", {
                required: "Teléfono requerido",
              })}
              label="Teléfono:"
              invalid={!!errors.phone}
              feedBack={errors.phone?.message as string}
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

            <FieldSelect
              register={register("status", {
                required: "Este campo es requerido",
              })}
              options={[
                { value: 1, label: "Activo" },
                { value: 2, label: "Suspendido" },
                { value: 3, label: "Eliminado" },
              ]}
              label="Status:"
              invalid={!!errors.status}
              feedBack={errors.status?.message as string}
            />

            <RelationField
              options={employees.map((e) => ({
                id: e.id || 0,
                displayName: e.name?.toUpperCase() || "",
                name: e.name?.toUpperCase(),
              }))}
              register={register("idEmployee")}
              control={control}
              callBackMode="id"
              label="Empleado relacionado:"
            />

            {!user && (
              <Entry
                register={register("password", {
                  required: "Contraseña requerida",
                })}
                type="password"
                label="Contraseña:"
                invalid={!!errors.password}
                feedBack={errors.password?.message}
              />
            )}

            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-semibold mb-0">Permisos</label>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={toggleSelectAll}
                >
                  {perms.every((perm) => isPermSelected(perm.id ?? 0))
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </Button>
              </div>

              <Row className="g-2">
                {perms.map((permiso) => (
                  <Col xs={12} md={6} key={permiso.id}>
                    <div className="p-2 rounded table-active h-100">
                      <Controller
                        name="permissions"
                        control={control}
                        defaultValue={[]}
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
                              label={formatPermission(permiso.text)}
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
            </div>

            <FieldGroup.Stack>
              <Button type="submit">
                <span>Guardar</span>
              </Button>

              <Button type="button" variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
            </FieldGroup.Stack>
          </FieldGroupFluid>
        </fieldset>
      </Form>
    </>
  );
}