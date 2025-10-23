"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { User } from "@/lib/definitions";
import { Badge, Form } from "react-bootstrap";

const userStatus = {
  1: "activo",
  2: "suspendido",
  3: "eliminado",
};

function UsersListView({ users }: { users: User[] }) {
  const columns: TableTemplateColumn<User>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (u) => u.name,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-capitalize">{u.name}</div>,
    },
    {
      key: "lastName",
      label: "Apellidos",
      accessor: (u) => u.lastName,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-capitalize">{u.lastName}</div>,
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
            {`${userStatus[u.status as keyof typeof userStatus]}`}
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
          <Form.Select
            size="sm"
            className="text-uppercase shadow-none border-0"
          >
            <option>{u.permissions.length}</option>
            {u.permissions.map((p) => (
              <option key={`${p.id}-${p.text}`}>
                {p.text.replace("_", " ").replace("_", " ")}
              </option>
            ))}
          </Form.Select>
        </div>
      ),
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title={`Usuarios (${users.length})`}
        formView="/app/users?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id}
          data={users}
          columns={columns}
          viewForm="/app/users?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
