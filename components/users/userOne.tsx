"use client";

import { updateUser } from "@/app/actions/user-actions";
import FormUpdateUser from "@/app/(auth)/app/users/views/UpdateUser";
import ChangePasswordModal from "@/app/(auth)/app/users/views/ModalChangePassword";
import ModalBlur from "@/components/ModalBlur";
import { TInputsUser } from "@/components/users/UsersTableList";
import { ActionResponse, Employee, Permission, User } from "@/lib/definitions";
import { useState } from "react";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";

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

  if (!user) {
    return (
      <Card className="border-0">
        <Card.Body className="py-3">
          <div className="text-muted">
            Selecciona un usuario para ver el detalle.
          </div>
        </Card.Body>
      </Card>
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

  return (
    <>
      <Card className="border-0 h-100">
      <Card.Body className="p-3 p-md-4">
        <Container fluid className="px-0">
          {/* Header */}
          <Row className="g-3 align-items-start align-items-md-center">
            <Col xs={12} md={8}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <h4 className="m-0 fw-bold">{fullName(user)}</h4>

                <Badge bg={statusVariant(user.status)}>
                  {statusLabel(user.status)}
                </Badge>
              </div>

              <div className="text-muted mt-2">
                <div className="small">Información general del usuario</div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <Card className="border-0 table-active">
                <Card.Body className="py-2 px-3">
                  <div className="text-muted small text-uppercase">
                    Fecha de creación
                  </div>
                  <div className="fw-semibold">{user.createdAt ?? "—"}</div>

                  <div className="d-flex flex-column gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShowUpdateUserModal(true)}
                    >
                      <i className="bi bi-pencil me-2" />
                      Actualizar usuario
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <i className="bi bi-key-fill me-2" />
                      Actualizar contraseña
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Main info */}
          <Row className="g-3 mt-1">
            <Col xs={12} lg={6}>
              <Card className="border-0 table-active h-100">
                <Card.Body className="py-3 px-3">
                  <div className="fw-semibold text-uppercase mb-3">
                    Datos personales
                  </div>

                  <Row className="g-3">
                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        ID Usuario
                      </div>
                      <div className="fw-semibold">{user.id ?? "—"}</div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        ID Empleado
                      </div>
                      <div className="fw-semibold">{user.idEmployee ?? "—"}</div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        Nombre
                      </div>
                      <div className="fw-semibold">{user.name ?? "—"}</div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        Apellidos
                      </div>
                      <div className="fw-semibold">{user.lastName ?? "—"}</div>
                    </Col>

                    <Col xs={12}>
                      <div className="text-muted small text-uppercase">
                        Género
                      </div>
                      <div className="fw-semibold">{user.gender ?? "—"}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12} lg={6}>
              <Card className="border-0 table-active h-100">
                <Card.Body className="py-3 px-3">
                  <div className="fw-semibold text-uppercase mb-3">
                    Contacto y cuenta
                  </div>

                  <Row className="g-3">
                    <Col xs={12}>
                      <div className="text-muted small text-uppercase">
                        Correo
                      </div>
                      <div className="fw-semibold text-break">
                        {user.email ?? "—"}
                      </div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        Teléfono
                      </div>
                      <div className="fw-semibold">{phone}</div>
                    </Col>

                    <Col xs={12} sm={6}>
                      <div className="text-muted small text-uppercase">
                        Rol
                      </div>
                      <div className="fw-semibold">{user.role ?? "—"}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Permissions */}
          <Row className="g-3 mt-1">
            <Col xs={12}>
              <Card className="border-0">
                <Card.Header className="table-active border-0 d-flex justify-content-between align-items-center">
                  <div className="fw-semibold text-uppercase">Permisos del usuario</div>
                  <div className="text-muted small">
                    {sortedPermissions.length} permisos
                  </div>
                </Card.Header>

                <Card.Body className="pt-3">
                  {sortedPermissions.length === 0 ? (
                    <div className="text-muted">Este usuario no tiene permisos asignados.</div>
                  ) : (
                    <Row className="g-2">
                      {sortedPermissions.map((permission) => (
                        <Col xs={12} sm={6} lg={4} xl={3} key={permission.id}>
                          <Card className="border-0 table-active h-100">
                            <Card.Body className="py-2 px-3">
                              <div className="fw-semibold small">
                                {formatPermission(permission.text)}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Card.Body>
      </Card>

      <ChangePasswordModal
        show={showPasswordModal}
        userId={user.id ?? null}
        onHide={() => setShowPasswordModal(false)}
      />

      {showUpdateUserModal && (
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
      )}
    </>
  );
}