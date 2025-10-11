"use client";

import { createUser } from "@/app/actions/user-actions";
import { Entry, FieldSelect } from "@/components/fields";
import FormView, {
  FieldGroup,
  FormBook,
  FormPage,
  FormSheet,
} from "@/components/templates/FormView";
import OverLay from "@/components/templates/OverLay";
import { useModals } from "@/context/ModalContext";
import { Permission, User, UserRole } from "@/lib/definitions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, Col, Form, ListGroup, Row } from "react-bootstrap";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
  name: string;
  lastName: string;
  email: string;
  gender: "HOMBRE" | "MUJER" | null;
  role: UserRole | null;
  permissions: Permission[];
  phone: PhoneNumberFormat | string | null;
  status: number;
  password?: string;
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TInputs>();

  const { modalError } = useModals();

  const {
    append,
    fields: permisos,
    remove,
  } = useFieldArray({
    control,
    name: "permissions",
  });

  const originalValuesRef = useRef<TInputs | null>(null);
  const router = useRouter();

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
        password: "",
        status: 1,
      };
      reset(values);
      originalValuesRef.current = values;
    } else {
      const values: TInputs = {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender as "HOMBRE" | "MUJER",
        role: user.role,
        permissions: user.permissions,
        phone: user.phone.internationalNumber,
        password: "",
        status: user.status,
      };
      reset(values);
      originalValuesRef.current = values;
    }
  }, [user, reset]);

  return (
    <FormView
      reverse={handleReverse}
      title="Usuario"
      onSubmit={handleSubmit(onSubmit)}
      name={user?.name || null}
      disabled={isSubmitting}
      isDirty={isDirty}
      id={id}
      cleanUrl="/app/users?view_type=form&id=null"
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
        <FieldSelect
          register={register("gender", { required: "Este campo es requerido" })}
          options={[
            { value: "HOMBRE", label: "Hombre" },
            { value: "MUJER", label: "Mujer" },
          ]}
          label="Género:"
          invalid={!!errors.gender}
          feedBack={errors.gender?.message}
        />
        <Entry
          register={register("phone", { required: "Correo es requerido" })}
          label="Teléfono:"
          invalid={!!errors.phone}
          feedBack={errors.phone?.message}
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
        <Entry
          register={register("password", {
            required: "Contraseña es requerido",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message:
                "Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
            },
          })}
          label="Contraseña:"
          invalid={!!errors.password}
          feedBack={errors.password?.message}
          type="password"
        />
        <FieldSelect
          register={register("role", { required: "Este campo es requerido" })}
          options={[
            { value: "SUPER_ADMIN", label: "SUPER ADMIN" },
            { value: "ADMIN", label: "ADMIN" },
            { value: "CHECADOR", label: "CHECADOR" },
          ]}
          label="Rol:"
          invalid={!!errors.role}
          feedBack={errors.role?.message}
        />
      </FieldGroup>
      <FormBook dKey="permissions">
        <FormPage
          title={`Permisos (${user?.permissions.length ?? 0})`}
          eventKey="permissions"
        >
          <FormSheet>
            <Row xs={1} sm={2} md={3} lg={4} className="g-1">
              {permisos.map((p, index) => (
                <Col key={p.id}>
                  <ListGroup>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center bg-body-tertiary">
                      <Form.Select
                        size="sm"
                        {...register(`permissions.${index}.id`)}
                      >
                        {perms.map((perm) => (
                          <option key={perm.text} value={perm.id ?? 0}>
                            {perm.text}
                          </option>
                        ))}
                      </Form.Select>
                      <OverLay string="Eliminar">
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => remove(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </OverLay>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              ))}
              <Col>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => append({ id: null, text: "" })}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </FormSheet>
        </FormPage>
      </FormBook>
    </FormView>
  );
}

export default UsersFormView;
