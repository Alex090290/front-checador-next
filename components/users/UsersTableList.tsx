"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ListView from "../templates/ListView";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { Button, Card, Col, Container, Form, InputGroup, Row } from "react-bootstrap";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import {
  ActionResponse,
  Employee,
  Permission,
  User,
} from "@/lib/definitions";
import ChangePasswordModal from "@/app/(auth)/app/users/views/ModalChangePassword";
import ModalBlur from "../ModalBlur";
import FormUpdateUser from "@/app/(auth)/app/users/views/UpdateUser";
import { updateUser } from "@/app/actions/user-actions";
import { PhoneNumberFormat } from "@/lib/sinitizePhone";
import GenericSearchInput from "../employee/GenericSearchInput";

const userStatus = {
  1: "activo",
  2: "suspendido",
  3: "eliminado",
};


export type TInputsUser = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: "SUPER_ADMIN" | "ADMIN" | "CHECADOR" | null;
  permissions: Permission[];
  phone: PhoneNumberFormat | string | null;
  status: 1 | 2 | 3;
  imageUrl?: string | null;
  idEmployee: number | null;
};

export default function UserTableClient({
  users,
  total,
  page,
  limit,
  perms = [],
  employees = [],
  search = "",

}: {
  users: User[];
  total: number;
  page: number;
  limit: number;
  perms?: Permission[];
  employees?: Employee[];
  search?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();
  const currentSearch = sp.get("search") ?? "";


  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const tableRef = useRef<{ clearSelection: () => void } | null>(null);
  const [, setSelectedIds] = useState<Array<string | number>>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordModalUserId, setPasswordModalUserId] = useState<number | null>(
    null
  );
  const isClearingSelectionRef = useRef(false);
  const [, setTableResetKey] = useState(0);

  // useEffect(() => {
  //   if (loading) {
  //     setLoading(false);
  //     setMessageLoading("");
  //   }
  // }, [searchParamsString]);

  // const goToPage = (nextPage: number) => {
  //   setLoading(true);
  //   setMessageLoading("Cargando");
  //   const params = new URLSearchParams(searchParamsString);
  //   params.set("id", "null");
  //   params.set("page", String(nextPage));
  //   params.set("limit", String(limit));
  //   router.push(`/app/users?${params.toString()}`);
  // };
  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando...");
    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("view_type", "list");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    } else {
      params.delete("search");
    }

    router.push(`/app/users?${params.toString()}`);
  };

  const clearSelectedIds = useCallback(() => {
    isClearingSelectionRef.current = true;

    tableRef.current?.clearSelection();
    setTableResetKey((k) => k + 1);

    setTimeout(() => {
      isClearingSelectionRef.current = false;
    }, 0);
  }, []);

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordModalUserId(null);
  };

  const handleCloseUserFormModal = () => {
    clearSelectedIds();
    setSelectedUser(null);
    setShowUpdateUserModal(false);
  };

  const handleUpdateUser = async (
    data: TInputsUser
  ): Promise<ActionResponse<boolean | null>> => {
    if (!selectedUser?.id) {
      return {
        success: false,
        message: "No hay usuario seleccionado",
        data: null,
      };
    }

    const res = await updateUser({
      ...data,
      id: selectedUser.id,
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

  const handleSearch = useCallback(
    (value: string) => {
      const cleanValue = value.trim();

      if (cleanValue === currentSearch.trim()) return;

      setLoading(true);
      setMessageLoading("Buscando...");

      const params = new URLSearchParams(searchParamsString);
      params.set("id", "null");
      params.set("view_type", "list");
      params.set("page", "1");
      params.set("limit", String(limit));

      if (cleanValue) {
        params.set("search", cleanValue);
      } else {
        params.delete("search");
      }

      clearSelectedIds();
      router.push(`/app/users?${params.toString()}`);
    },
    [currentSearch, searchParamsString, limit, router, clearSelectedIds]
  );

  const columns: TableTemplateColumn<User>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (u) => u.name,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.name}</div>,
    },
    {
      key: "lastName",
      label: "Apellidos",
      accessor: (u) => u.lastName,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.lastName}</div>,
    },
    {
      key: "status",
      label: "Estado",
      accessor: (u) => userStatus[u.status as keyof typeof userStatus] ?? "",
      filterable: true,
      type: "string",
      render: (u) => {
        const estado = u.status
        switch (estado) {
          case 1:
            return (
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-success-subtle text-success-emphasis border border-success-subtle">
                ACTIVO
              </span>
            );
          case 2:
            return (
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                SUSPENDIDO
              </span>
            );
          case 3:
            return (
              <span className="badge rounded-pill px3 py-2 fw-semibold bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                ELIMINADO
              </span>
            );
        }
      },
    },
    {
      key: "email",
      label: "Correo",
      accessor: (u) => u.email,
      filterable: true,
      type: "string",
    },
    {
      key: "gender",
      label: "Género",
      accessor: (u) => u.gender,
      filterable: true,
      type: "string",
    },
    {
      key: "permissions",
      label: "Permisos",
      accessor: (u) => u.permissions.length,
      filterable: false,
      type: "number",
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form className="text-uppercase shadow-none border-0">
            <option>{u.permissions.length}</option>
            {/* {u.permissions.map((p) => (
              <option key={`${p.id}-${p.text}`}>
                {p.text.replaceAll("_", " ").replaceAll("-", " ")}
              </option>
            ))} */}
          </Form>
        </div>
      ),
    },
  ];


  return (
    <>
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <ConditionalRender cond={showUpdateUserModal && !!selectedUser}>
        <ModalBlur onClose={handleCloseUserFormModal}>
          <FormUpdateUser
            show={showUpdateUserModal}
            onHide={handleCloseUserFormModal}
            sendData={handleUpdateUser}
            user={selectedUser}
            perms={perms ?? []}
            employees={employees ?? []}
          />
        </ModalBlur>
      </ConditionalRender>

      <ChangePasswordModal
        show={showPasswordModal}
        userId={passwordModalUserId}
        onHide={handleClosePasswordModal}
      />

      <Container className="py-3" style={{ maxWidth: "1600px" }}>
        <Button
          variant="primary"
          className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
          onClick={handleCreate}
          disabled={loading}
        >
          <i className="bi bi-plus-lg" />
          Crear usuario
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
          <div>
            <h1 className="mb-0">Usuarios</h1>

            <span className="text-muted">
              {total} usuario{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <Row className="justify-content-center" style={{height: "100%"}}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Card className="rounded-4 shadow-sm border">
              <Card.Body className="p-4 p-md-5">
                <div className="mb-4">
                  <Col xs={12} sm={12} md={6} lg={6} >
                    <InputGroup>
                      <InputGroup.Text
                        className="bg-gray"
                        style={{ color: "#6c757d" }}
                      >
                        <i className="bi bi-search" />
                      </InputGroup.Text>

                      <GenericSearchInput
                        initialValue={search}
                        onSearch={handleSearch}
                        placeholder="Buscar por nombre o apellido"
                      />
                    </InputGroup>
                  </Col>
                </div>

                <ListView>
                  <ListView.Body>
                    <div className="table-responsive rounded-3 border overflow-auto">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-dark border-secondary">
                          <tr>
                            {columns.map((column) => (
                              <th
                                key={String(column.key)}
                                className="fw-bold text-left"
                              >
                                {column.label}
                              </th>
                            ))}
                            <th className="fw-bold">Detalles</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(users ?? []).map((row) => (
                            <tr key={row.id}>
                              {columns.map((column) => (
                                <td key={String(column.key)}>
                                  {column.render
                                    ? column.render(row)
                                    : column.accessor(row)}
                                </td>
                              ))}

                              <td>
                                <a
                                  href={`/app/users?view_type=form&id=${row.id}`}
                                  className="btn btn-sm btn-outline-info ms-3"
                                >
                                  Ver
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <small className="text-muted">
                        Página {page} de {Math.ceil(total / limit)}
                      </small>

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => goToPage(page - 1)}
                        >
                          Anterior
                        </Button>

                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={page >= Math.ceil(total / limit)}
                          onClick={() => goToPage(page + 1)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  </ListView.Body>
                </ListView>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}