"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { DisplayType, User } from "@/lib/definitions";
import { useState } from "react";

function EmployeeListView({ employees }: { employees: User[] }) {
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const columns: TableTemplateColumn<User>[] = [];
  return (
    <ListView>
      <ListView.Header
        title={`Empleados (${employees.length})`}
        formView="/app/employee?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id}
          data={employees}
          columns={columns}
          onSelectionChange={setSelectedIds}
          viewForm="/app/employee?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default EmployeeListView;
