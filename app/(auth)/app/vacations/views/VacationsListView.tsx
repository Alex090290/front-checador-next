"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { VacationRequestStatus, Vacations } from "@/lib/definitions";
import { Badge } from "react-bootstrap";

export const vacationStatus: Record<VacationRequestStatus, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REFUSED: "Rechazado",
  EMPLOYEE: "Empleado",
};

function VacationsListView({ vacations }: { vacations: Vacations[] }) {
  const columns: TableTemplateColumn<Vacations>[] = [
    {
      key: "employee",
      label: "Empleado",
      accessor: (row) =>
        `${row.employee.lastName} ${row.employee.name}`.toUpperCase(),
      filterable: true,
      type: "string",
    },
    {
      key: "holidayName",
      label: "Día festivo",
      accessor: (row) => row.holidayName,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-center fs-6 fw-semibold">{row.holidayName}</div>
      ),
    },
    {
      key: "period",
      label: "Periodo",
      accessor: (row) => row.period.periodDescription,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-center fs-6 fw-semibold">
          {row.period.periodDescription}
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      accessor: (row) => vacationStatus[row.status],
      type: "string",
      render: (row) => {
        let bg: "success" | "warning" | "danger" | "secondary" = "secondary";
        const status = vacationStatus[row.status];
        if (status === "Aprobado") bg = "success";
        if (status === "Pendiente") bg = "warning";
        if (status === "Rechazado") bg = "danger";

        return <Badge bg={bg}>{vacationStatus[row.status]}</Badge>;
      },
    },
  ];

  return (
    <ListView>
      <ListView.Header
        title={`Vacaciones ${vacations.length ?? 0}`}
        formView="/app/vacations?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          columns={columns}
          data={vacations}
          getRowId={(row) => row.id}
          viewForm="/app/vacations?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default VacationsListView;
