"use client";

import { deleteEmployee } from "@/app/actions/employee-actions";
import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { Employee } from "@/lib/definitions";
import { useState } from "react";
import { Badge } from "react-bootstrap";

const employeeStatus = {
  1: "activo",
  2: "baja",
};

function EmployeeListView({ employees }: { employees: Employee[] }) {
  const { modalConfirm, modalError } = useModals();
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
      key: "status",
      label: "Estado",
      accessor: (u) =>
        employeeStatus[u.status as keyof typeof employeeStatus] ?? "",
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize text-center">
          <Badge
            pill
            bg={
              employeeStatus[u.status as keyof typeof employeeStatus] ===
              "activo"
                ? "success"
                : "danger"
            }
          >
            {`${employeeStatus[u.status as keyof typeof employeeStatus]}`}
          </Badge>
        </div>
      ),
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

  const handleDelete = () => {
    if (selectedIds.length === 0)
      return modalError("No hay registros seleccionados");

    modalConfirm(
      "Confirma que deseas eliminar los registros seleccionados",
      () => {
        selectedIds.forEach(async (id) => {
          await deleteEmployee({ id: Number(id) || null });
        });
      }
    );
  };

  return (
    <ListView>
      <ListView.Header
        title={`Empleados (${employees.length || 0})`}
        formView="/app/employee?view_type=form&id=null"
        actions={[
          {
            action: handleDelete,
            string: (
              <>
                <i className="bi bi-arrow-down me-2 text-danger"></i>
                <span>Dar de baja</span>
              </>
            ),
          },
        ]}
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
