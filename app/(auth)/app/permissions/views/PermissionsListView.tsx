"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { IPermissionRequest } from "@/lib/definitions";
import { Badge } from "react-bootstrap";

const leaderApproval = {
  APPROVED: "APROBADO",
  REFUSED: "RECHAZADO",
  PENDING: "PENDIENTE",
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
      key: "motive",
      label: "Motivo",
      accessor: (row) => row.motive,
      filterable: true,
      type: "string",
    },
    {
      key: "incidence",
      label: "Incidencia",
      accessor: (row) => row.incidence,
      type: "string",
      filterable: true,
    },
    {
      key: "type",
      label: "Tipo",
      accessor: (row) => row.type,
    },
    {
      key: "leader",
      label: "Gerente",
      accessor: (row) =>
        `${row.leader.lastName} ${row.leader.name}`.toUpperCase(),
    },
    {
      key: "leaderApproval",
      label: "Estado",
      accessor: (row) => leaderApproval[row.leaderApproval],
      render: (row) => {
        const status = leaderApproval[row.leaderApproval];
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
              {leaderApproval[row.leaderApproval]}
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
