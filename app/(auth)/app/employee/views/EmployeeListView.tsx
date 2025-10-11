"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { Employee } from "@/lib/definitions";
import { useState } from "react";

function EmployeeListView({ employees }: { employees: Employee[] }) {
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const columns: TableTemplateColumn<Employee>[] = [
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
      key: "phonePersonal.internationalNumber",
      label: "Teléfono",
      accessor: (u) => u.phonePersonal?.internationalNumber,
      filterable: true,
      type: "string",
    },
    {
      key: "department.nameDepartment",
      label: "Departamento",
      accessor: (u) => u.department?.nameDepartment,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{`${u.department?.nameDepartment}`}</div>
      ),
    },
    {
      key: "position.namePosition",
      label: "Puesto",
      accessor: (u) => u.position?.namePosition,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{`${u.position?.namePosition}`}</div>
      ),
    },
    {
      key: "leader.name",
      label: "Líder",
      accessor: (u) => u.leader?.name,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{`${u.leader?.name ?? " "} ${
          u.leader?.lastName ?? " "
        }`}</div>
      ),
    },
    {
      key: "branch.name",
      label: "Sucursal",
      accessor: (u) => u.branch?.name,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{`${u.branch?.name}`}</div>
      ),
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title={`Empleados (${employees.length || 0})`}
        formView="/app/employee?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id ?? 0}
          data={employees || []}
          columns={columns}
          onSelectionChange={setSelectedIds}
          viewForm="/app/employee?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default EmployeeListView;
