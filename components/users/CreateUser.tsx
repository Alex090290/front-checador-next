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
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import toast from "react-hot-toast";

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
    formState: { errors, isSubmitting },
  } = useForm<TInputs>({
    defaultValues: DEFAULT_VALUES,
  });

  const { modalError } = useModals();
  const router = useRouter();

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

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    try {
      await createUser({
        ...data,
        status: 1,
      });

      toast.success("Usuario creado correctamente");
      router.replace("/app/users?view_type=list&id=null");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el usuario";

      modalError(message);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Crear usuario</h1>
  
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </div>
  
      <Row className="g-4 align-items-start">
        {/* <Col xs={12} lg={6}> */}
          <FieldGroup>
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
        {/* </Col> */}
  
        {/* <Col xs={12} lg={6}> */}
          <FieldGroup>
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
                displayName: e.name?.toUpperCase() || "",
                name: e.name?.toUpperCase(),
              }))}
              register={register("idEmployee")}
              control={control}
              callBackMode="id"
              label="Empleado relacionado:"
            />
          </FieldGroup>
        {/* </Col> */}
      </Row>
  
      <div className="mt-4">
        <FormBook dKey="permissions">
          <FormPage
            title={`Permisos (${permisosSeleccionados.length})`}
            eventKey="permissions"
          >
            <Container>
              <Row>
                <Col md="12">
                  <Button
                    type="button"
                    size="sm"
                    className="my-1"
                    onClick={toggleSelectAll}
                  >
                    {perms.every((perm) => isPermSelected(perm.id ?? 0))
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </Button>
                </Col>
              </Row>
  
              <Row>
                {perms.map((permiso) => (
                  <Col key={permiso.id} md="4">
                    <div className="p-2 bg-body-tertiary m-1 text-uppercase rounded fw-semibold">
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
                              field.onChange([...selectedPermissions, permiso]);
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
            </Container>
          </FormPage>
        </FormBook>
      </div>
    </Form>
  );
}