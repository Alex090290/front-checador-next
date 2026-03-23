"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ListView from "../templates/ListView";
import TableTemplateServer from "../templates/TablePage";
import { TableTemplateColumn } from "../templates/TableTemplate";
import { Badge, Form } from "react-bootstrap";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import {
  ActionResponse,
  Employee,
  Permission,
  User,
} from "@/lib/definitions";
import { useModals } from "@/context/ModalContext";
import ChangePasswordModal from "@/app/(auth)/app/users/views/ModalChangePassword";
import ModalBlur from "../ModalBlur";
import FormUpdateUser from "@/app/(auth)/app/users/views/UpdateUser";
import { updateUser } from "@/app/actions/user-actions";

const userStatus = {
  1: "activo",
  2: "suspendido",
  3: "eliminado",
};

type TSearchInputs = {
  date: string | null;
  idEmployee: number | null;
  idUser: number | null;
};

export type TInputsUser = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  gender: "MASCULINO" | "FEMENINO" | null;
  role: "SUPER_ADMIN" | "ADMIN" | "CHECADOR" | null;
  permissions: Permission[];
  phone: any;
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
}: {
  users: User[];
  total: number;
  page: number;
  limit: number;
  perms?: Permission[];
  employees?: Employee[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const tableRef = useRef<{ clearSelection: () => void } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const { modalError } = useModals();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordModalUserId, setPasswordModalUserId] = useState<number | null>(
    null
  );
  const isClearingSelectionRef = useRef(false);
  const [tableResetKey, setTableResetKey] = useState(0);

  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
  }, [sp.toString()]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando");
    const params = new URLSearchParams(sp.toString());
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/users?${params.toString()}`);
  };

  const openModifyModal = () => {
    if (selectedIds.length === 0) {
      return modalError("No hay usuarios seleccionados");
    }

    if (selectedIds.length > 1) {
      return modalError("Sólo puedes modificar un usuario a la vez");
    }

    const idSel = Number(selectedIds[0]);

    const findUser = users?.find((item) => item.id === idSel);
    if (!findUser) return modalError("No se encontró el usuario seleccionado");

    setSelectedUser(findUser);
    setShowUpdateUserModal(true);
  };

  const openChangePasswordModal = () => {
    if (selectedIds.length === 0) {
      return modalError("No hay usuarios seleccionados");
    }

    if (selectedIds.length > 1) {
      return modalError("Sólo puedes cambiar la contraseña de un usuario a la vez");
    }

    const idSel = Number(selectedIds[0]);
    const findUser = users?.find((item) => item.id === idSel);

    if (!findUser?.id) {
      return modalError("No se encontró el usuario seleccionado");
    }

    setPasswordModalUserId(findUser.id);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordModalUserId(null);
  };

  const clearSelectedIds = () => {
    isClearingSelectionRef.current = true;

    tableRef.current?.clearSelection();
    setSelectedIds([]);
    setTableResetKey((k) => k + 1);

    setTimeout(() => {
      isClearingSelectionRef.current = false;
    }, 0);
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

  const handleSelectionChange = (ids: Array<string | number>) => {
    if (isClearingSelectionRef.current) return;
    setSelectedIds(ids);
  };

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
      render: (u) => (
        <div className="text-capitalize text-center">
          <Badge
            pill
            bg={
              userStatus[u.status as keyof typeof userStatus] === "activo"
                ? "success"
                : "warning"
            }
            className="bg-brand-primary"
          >
            {userStatus[u.status as keyof typeof userStatus]}
          </Badge>
        </div>
      ),
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
          <Form.Select size="sm" className="text-uppercase shadow-none border-0">
            <option>{u.permissions.length}</option>
            {u.permissions.map((p) => (
              <option key={`${p.id}-${p.text}`}>
                {p.text.replaceAll("_", " ").replaceAll("-", " ")}
              </option>
            ))}
          </Form.Select>
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

      <ListView>
        <ListView.Header
          title={`Usuarios (${total})`}
          actions={[
            {
              action: openModifyModal,
              string: (
                <>
                  <i className="bi bi-pencil me-1"></i>
                  <span>Actualizar usuario</span>
                </>
              ),
            },
            {
              action: openChangePasswordModal,
              string: (
                <>
                  <i className="bi bi-key-fill me-1"></i>
                  <span>Actualizar contraseña</span>
                </>
              ),
            },
          ]}
          formView="/app/users?view_type=form&id=null"
        />

        <ListView.Body>
          <TableTemplateServer
            ref={tableRef}
            key={tableResetKey}
            columns={columns}
            data={users}
            total={total}
            page={page}
            limit={limit}
            onPageChange={(p) => goToPage(p)}
            getRowId={(row) => row.id}
            viewForm="/app/users?view_type=form"
            onSelectionChange={handleSelectionChange}
          />
        </ListView.Body>
      </ListView>
    </>
  );
}