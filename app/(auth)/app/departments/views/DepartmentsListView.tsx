"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { Department } from "@/lib/definitions";
import { useState } from "react";

function DepartmentsListView({ deparments }: { deparments: Department[] }) {
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const columns: TableTemplateColumn<Department>[] = [
    {
      key: "nameDepartment",
      label: "Nombre",
      accessor: (u) => u.nameDepartment,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-capitalize">{u.nameDepartment}</div>,
    },
    {
      key: "positions",
      label: "Puestos",
      accessor: (u) => u.positions.length,
      filterable: false,
      type: "number",
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title={`Departamentos (${deparments.length})`}
        formView="/app/departments?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id ?? 0}
          data={deparments}
          columns={columns}
          onSelectionChange={setSelectedIds}
          viewForm="/app/departments?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default DepartmentsListView;
