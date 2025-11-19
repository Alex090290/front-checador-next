"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { IPermissionRequest } from "@/lib/definitions";
import { formatDate } from "date-fns";
import { Badge } from "react-bootstrap";

export const leaderApproval = {
  APPROVED: "APROBADO",
  REFUSED: "RECHAZADO",
  PENDING: "PENDIENTE",
  EMPLOYEE: "EMPLEADO",
};

function PermissionsListView({
  permissions,
}: {
  permissions: IPermissionRequest[];
}) {
  const columns: TableTemplateColumn<IPermissionRequest>[] = [
    {
      key: "employeeName",
      label: "Nombre",
      accessor: (row) => `${row.employee.lastName} ${row.employee.name}`,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-uppercase">
          {row.employee.lastName} {row.employee.name}
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      accessor: (row) => row.type,
    },
    {
      key: "motive",
      label: "Motivo",
      accessor: (row) => row.motive,
      filterable: true,
      type: "string",
      render: (row) => <div className="text-uppercase">{row.motive}</div>,
    },
    {
      key: "createforPerson",
      label: "Creado por",
      accessor: (row) =>
        `${row.createForPerson.lastName} ${row.createForPerson.lastName}`,
      type: "string",
      filterable: true,
      render: (row) => (
        <div className="text-uppercase">
          {`${row.createForPerson.lastName} ${row.createForPerson.lastName}`}
        </div>
      ),
    },
    {
      key: "leader",
      label: "Gerente",
      accessor: (row) =>
        `${row.leader.lastName} ${row.leader.name}`.toUpperCase(),
    },
    {
      key: "createdAt",
      label: "Fecha de creación",
      accessor: (row) => row.createdAt,
      render: (row) => (
        <div className="text-center">
          {row.createdAt
            ? formatDate(row.createdAt, "dd-MM-yyyy HH:mm")
            : "No Definido"}
        </div>
      ),
      groupFormat: "MM-dd",
      type: "date",
    },
    {
      key: "leaderApproval",
      label: "Estado",
      accessor: (row) => leaderApproval[row.status],
      render: (row) => {
        const status = leaderApproval[row.status];
        return (
          <div className="text-center">
            <Badge
              bg={
                status === "APROBADO"
                  ? "success"
                  : status === "PENDIENTE"
                  ? "warning"
                  : "danger"
              }
            >
              {leaderApproval[row.status]}
            </Badge>
          </div>
        );
      },
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title={`Permisos (${permissions.length ?? 0})`}
        formView="/app/permissions?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id}
          columns={columns}
          data={permissions}
          viewForm="/app/permissions?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default PermissionsListView;
