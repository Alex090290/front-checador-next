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
        title="Empleados"
        formView="/app/employee?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        {employees.length > 0 ? (
          <TableTemplate
            getRowId={(row) => row.id}
            data={employees}
            columns={columns}
            onSelectionChange={setSelectedIds}
            viewForm="/app/employee?view_type=form"
          />
        ) : (
          <h3 className="text-center">NO HAY DATOS AÚN</h3>
        )}
      </ListView.Body>
    </ListView>
  );
}

export default EmployeeListView;
