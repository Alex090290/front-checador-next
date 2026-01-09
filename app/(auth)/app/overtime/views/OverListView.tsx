"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { IOvertime } from "@/lib/definitions";

function OverListView({ overtimes }: { overtimes: IOvertime[] }) {
  const columns: TableTemplateColumn<IOvertime>[] = [
    {
      key: "id",
      label: "ID",
      accessor: (row) => row.id,
      type: "number",
    },
    {
      key: "employee",
      label: "Empleado",
      accessor: (row) =>
        `${row.employee.lastName.toUpperCase()} ${row.employee.name.toUpperCase()}`,
      filterable: true,
      type: "string",
    },
    {
      key: "informationDate.totalHours",
      label: "Horas",
      accessor: (row) => row.informationDate.totalHours,
      render: (row) => (
        <div className="text-end">{row.informationDate.totalHours}</div>
      ),
    },
  ];

  return (
    <ListView>
      <ListView.Header
        title="Horas Extras"
        formView="/app/overtime?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          columns={columns}
          data={overtimes}
          getRowId={(row) => row.id}
          viewForm="/app/overtime?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default OverListView;
