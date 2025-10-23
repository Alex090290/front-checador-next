"use client";

import { createUser, updateUser } from "@/app/actions/user-actions";
import { Entry, FieldSelect } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
} from "@/components/templates/FormView";
import { useModals } from "@/context/ModalContext";
import { Permission, User, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import ChangePasswordModal from "./ModalChangePassword";

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
};

function UsersFormView({
  user,
  id,
  perms,
}: {
  user: User | null;
  id: number;
  perms: Permission[];
}) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputs>();

  const { modalError } = useModals();
  const router = useRouter();
  const originalValuesRef = useRef<TInputs | null>(null);
  const [modalChangePassword, setModalChangePassword] = useState(false);

  const onSubmit: SubmitHandler<TInputs> = async (data) => {
    if (isNaN(id)) {
      try {
        await createUser(data);
        toast.success("Usuario creado correctamente");
        router.replace("/app/users?view_type=list&id=null");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        modalError(error.message);
        return error.message;
      }
    } else {
      const res = await updateUser({ ...data, id });
      console.log(res);
      if (!res) {
        modalError(String(res));
        return;
      }

      toast.success("Registro editado");
    }
  };

  const handleReverse = () => {
    if (originalValuesRef.current) {
      reset(originalValuesRef.current);
    }
  };

  useEffect(() => {
    if (!user) {
      const values: TInputs = {
        name: "",
        email: "",
        gender: null,
        lastName: "",
        role: null,
        permissions: [],
        phone: null,
        status: 3,
        password: "",
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender as "MASCULINO" | "FEMENINO",
        role: user.role,
        permissions: user.permissions,
        phone: user.phone.internationalNumber,
        status: user.status,
        password: "",
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [user, reset]);

  // 👇 Watch permisos seleccionados
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

  return (
    <>
      <FormView
        reverse={handleReverse}
        title="Usuario"
        onSubmit={handleSubmit(onSubmit)}
        name={user?.name || null}
        disabled={isSubmitting}
        isDirty={isDirty}
        id={id}
        cleanUrl="/app/users?view_type=form&id=null"
        actions={[
          {
            action: () => setModalChangePassword(!modalChangePassword),
            string: "Cambiar contraseña",
            variant: "info",
            invisible: isNaN(id),
          },
        ]}
      >
        <FieldGroup>
          <Entry
            register={register("name", {
              required: "Nombre de usuario es requerido, honey!",
            })}
            label="Nombre:"
            invalid={!!errors.name}
            feedBack={errors.name?.message}
          />
          <Entry
            register={register("lastName", {
              required: "Apellidos es requerido",
            })}
            label="Apellidos:"
            invalid={!!errors.lastName}
            feedBack={errors.lastName?.message}
          />
          <Entry
            register={register("phone", {
              required: "Teléfono es requerido",
            })}
            label="Teléfono:"
            invalid={!!errors.phone}
            feedBack={errors.phone?.message}
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
        </FieldGroup>
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
          {isNaN(id) && (
            <Entry
              register={register("password", {
                required: "Contraseña es requerido",
              })}
              type="password"
              label="Contraseña:"
              invalid={!!errors.password}
              feedBack={errors.password?.message}
            />
          )}
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
            invisble={!isNaN(id)}
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
            invalid={!!errors.role}
            feedBack={errors.role?.message}
            invisble={isNaN(id)}
          />
        </FieldGroup>

        <FormBook dKey="permissions">
          <FormPage
            title={`Permisos (${permisosSeleccionados.length})`}
            eventKey="permissions"
          >
            <Container>
              <Row>
                <Col md="12">
                  <Button size="sm" className="my-1" onClick={toggleSelectAll}>
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
                        defaultValue={[]} // ← aseguramos valor inicial
                        render={({ field }) => {
                          const selectedPermissions = field.value || []; // aseguramos array
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
                              label={permiso.text
                                .replace("_", " ")
                                .replace("_", " ")}
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
      </FormView>
      <ChangePasswordModal
        show={modalChangePassword}
        onHide={() => setModalChangePassword(!modalChangePassword)}
      />
    </>
  );
}

export default UsersFormView;
