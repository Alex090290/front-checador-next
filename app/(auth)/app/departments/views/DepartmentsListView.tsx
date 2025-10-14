"use client";

import { deleteDepartment } from "@/app/actions/departments-actions";
import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { Department } from "@/lib/definitions";
import { useState } from "react";

function DepartmentsListView({ deparments }: { deparments: Department[] }) {
  const { modalError, modalConfirm } = useModals();
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
      key: "leader",
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
      key: "positions",
      label: "Puestos",
      accessor: (u) => u.positions.length,
      filterable: false,
      type: "number",
    },
  ];

  const handleDelete = () => {
    modalConfirm("Confirmar Acción", deleteIds);
  };

  const deleteIds = () => {
    selectedIds.forEach(async (id) => {
      const res = await deleteDepartment({ id: Number(id) });
      if (!res.success) {
        modalError(res.message);
        return;
      }
    });
  };

  return (
    <ListView>
      <ListView.Header
        title={`Departamentos (${deparments?.length ?? 0})`}
        formView="/app/departments?view_type=form&id=null"
        actions={[
          {
            action: handleDelete,
            string: (
              <>
                <i className="bi bi-trash me-2"></i>
                <span>Eliminar</span>
              </>
            ),
          },
        ]}
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id ?? 0}
          data={deparments ?? []}
          columns={columns}
          onSelectionChange={setSelectedIds}
          viewForm="/app/departments?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default DepartmentsListView;
