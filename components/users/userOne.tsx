"use client";

import { updateUser } from "@/app/actions/user-actions";
import FormUpdateUser from "@/app/(auth)/app/users/views/UpdateUser";
import ChangePasswordModal from "@/app/(auth)/app/users/views/ModalChangePassword";
import ModalBlur from "@/components/ModalBlur";
import { TInputsUser } from "@/components/users/UsersTableList";
import { ActionResponse, Employee, Permission, User } from "@/lib/definitions";
import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import OverLay from "../templates/OverLay";
import UserOneError from "./usersMessageError";

function formatPermission(text?: string | null) {
  if (!text) return "—";

  return text
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function fullName(user?: User | null) {
  if (!user) return "—";
  return `${user.name ?? ""} ${user.lastName ?? ""}`.trim();
}

function statusLabel(status?: number | null) {
  return Number(status) === 1 ? "Activo" : "Inactivo";
}

function statusVariant(status?: number | null) {
  return Number(status) === 1 ? "success" : "secondary";
}

export default function ShowInfoOneUser({
  user,
  perms = [],
  employees = [],
}: {
  user: User | null;
  perms?: Permission[];
  employees?: Employee[];
}) {
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  const router = useRouter();

  if (!user) {
    return (
      <UserOneError/>
    );
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  const sortedPermissions = [...permissions].sort((a, b) =>
    formatPermission(a.text).localeCompare(formatPermission(b.text))
  );

  const phone =
    user.phone?.internationalNumber ??
    user.phone?.nationalNumber ??
    user.phone?.number ??
    "—";

  const handleUpdateUser = async (
    data: TInputsUser
  ): Promise<ActionResponse<boolean | null>> => {
    if (!user?.id) {
      return {
        success: false,
        message: "No hay usuario seleccionado",
        data: null,
      };
    }

    const res = await updateUser({
      ...data,
      id: user.id,
    });

    if (!res) {
      return {
        success: false,
        message: "No se pudo actualizar el usuario",
        data: null,
      };
    }

    return {
      success: true,
      message: "Usuario actualizado correctamente",
      data: true,
    };
  };

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/users/create");
  };

  const handleBack = () => {
    setLoading(true);
    setMessageLoading("Cargando datos...");


    router.push("/app/users");

  }

  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <Container className="py-3 overflow-x-auto" style={{ maxWidth: "1600px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex gap-2 flex-wrap">
            <OverLay string="Crear Usuario">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="primary"
                onClick={handleCreate}
                disabled={loading}
              >
                <i className="bi bi-plus-lg" />

                <span className="d-none d-md-inline ms-2">
                  Crear Usuario
                </span>
              </Button>
            </OverLay>

            <OverLay string="Actualizar usuario">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="primary"
                onClick={() => setShowUpdateUserModal(true)}
                disabled={loading}
              >
                <i className="bi bi-pencil" />

                <span className="d-none d-md-inline ms-2">
                  Actualizar usuario
                </span>
              </Button>
            </OverLay>

            <OverLay string="Actualizar contraseña">
              <Button
                className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                variant="secondary"
                onClick={() => setShowPasswordModal(true)}
                disabled={loading}
              >
                <i className="bi bi-key-fill" />

                <span className="d-none d-md-inline ms-2">
                  Actualizar contraseña
                </span>
              </Button>
            </OverLay>
          </div>

          <Button
            variant="outline-secondary"
            onClick={handleBack}
            disabled={loading}
            className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
          >
            <i className="bi bi-arrow-left" />
            Regresar
          </Button>
        </div>

        <div>
          <h1 className="mb-1 ms-1 text-uppercase">
            {fullName(user)}
          </h1>

          <p className="text-muted mb-0 ms-1">
            Información general del usuario.
          </p>
        </div>

        <Card className="border shadow-sm rounded-4 mt-2">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <h5 className="mb-0 fw-bold">
                Usuario
                <span className={`badge ms-1 rounded-pill px-3 py-2 fw-semibold bg-${statusVariant(user.status)}-subtle text-${statusVariant(user.status)}-emphasis border border-${statusVariant(user.status)}-subtle`}>
                  {statusLabel(user.status)}
                </span>
              </h5>
            </div>

            <Row className="g-4">
              <Col xs={12} lg={6}>
                <Card className="border rounded-4 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h6 className="mb-0 fw-bold">
                        Datos personales
                      </h6>

                      <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Perfil
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-hash text-secondary" />
                          <span className="text-muted">ID Usuario</span>
                        </div>

                        <span className="fw-semibold text-end">
                          {user.id ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person-badge text-info" />
                          <span className="text-muted">ID Empleado</span>
                        </div>

                        <span className="fw-semibold text-end">
                          {user.idEmployee ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person text-primary" />
                          <span className="text-muted">Nombre</span>
                        </div>

                        <span className="fw-semibold text-end text-uppercase">
                          {user.name ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person-lines-fill text-primary" />
                          <span className="text-muted">Apellidos</span>
                        </div>

                        <span className="fw-semibold text-end text-uppercase">
                          {user.lastName ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-gender-ambiguous text-info" />
                          <span className="text-muted">Género</span>
                        </div>

                        <span className="fw-semibold text-end text-uppercase">
                          {user.gender ?? "—"}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} lg={6}>
                <Card className="border rounded-4 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h6 className="mb-0 fw-bold">
                        Contacto y cuenta
                      </h6>

                      <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Acceso
                      </span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex flex-column flex-md-row justify-content-between border-bottom pb-2 gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-envelope text-primary" />
                          <span className="text-muted">Correo</span>
                        </div>

                        <span className="fw-semibold text-md-end text-break">
                          {user.email ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-telephone text-success" />
                          <span className="text-muted">Teléfono</span>
                        </div>

                        <span className="fw-semibold text-end">
                          {phone}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person-badge text-warning" />
                          <span className="text-muted">Rol</span>
                        </div>

                        <span className="fw-semibold text-end text-uppercase">
                          {user.role ?? "—"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-calendar-event text-secondary" />
                          <span className="text-muted">Fecha de creación</span>
                        </div>

                        <span className="fw-semibold text-end">
                          {user.createdAt ?? "—"}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border rounded-4 mt-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div className="d-flex gap-2 flex-wrap">
                    <h6 className="mt-1 fw-bold">
                      Permisos del usuario
                    </h6>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle">
                      {sortedPermissions.length}
                    </span>
                  </div>
                </div>

                {sortedPermissions.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-shield-lock fs-3 d-block mb-2" />
                    Este usuario no tiene permisos asignados.
                  </div>
                ) : (
                  <Row className="g-3">
                    {sortedPermissions.map((permission) => (
                      <Col xs={12} sm={6} lg={4} xl={3} key={permission.id}>
                        <div className="border rounded p-3 h-100 d-flex align-items-center gap-2">
                          <i className="bi bi-shield-check text-success fs-5" />

                          <span className="fw-semibold text-uppercase">
                            {formatPermission(permission.text)}
                          </span>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>

        <ConditionalRender cond={showPasswordModal}>
          <ModalBlur onClose={() => setShowPasswordModal(false)}>
            <ChangePasswordModal
              show={showPasswordModal}
              userId={user.id ?? null}
              onHide={() => setShowPasswordModal(false)}
            />
          </ModalBlur>
        </ConditionalRender>

        <ConditionalRender cond={showUpdateUserModal}>
          <ModalBlur onClose={() => setShowUpdateUserModal(false)}>
            <FormUpdateUser
              show={showUpdateUserModal}
              onHide={() => setShowUpdateUserModal(false)}
              sendData={handleUpdateUser}
              user={user}
              perms={perms}
              employees={employees}
            />
          </ModalBlur>
        </ConditionalRender>
      </Container >
    </>
  );
}