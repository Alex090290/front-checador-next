"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { User } from "@/lib/definitions";
import { useState } from "react";

function UsersListView({ users }: { users: User[] }) {
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

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
          onSelectionChange={setSelectedIds}
          viewForm="/app/users?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default UsersListView;
