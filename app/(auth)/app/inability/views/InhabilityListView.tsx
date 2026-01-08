"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { IInability } from "@/lib/definitions";
import { formatDate } from "date-fns";

function InhabilityListView({ inhabilities }: { inhabilities: IInability[] }) {
  const columns: TableTemplateColumn<IInability>[] = [
    {
      key: "employee",
      label: "Empleado",
      accessor: (r) =>
        `${r.employee?.name ?? ""} ${r.employee?.lastName ?? ""}`.trim(),
      filterable: true,
      type: "string",
      render: (r) => (
        <div
          role="button"
          className="text-uppercase cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          {r.employee?.name ?? ""} {r.employee?.lastName ?? ""}
        </div>
      ),
    },
    {
      key: "disabilityCategory",
      label: "Categoría",
      accessor: (r) => r.disabilityCategory,
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">{r.disabilityCategory}</div>
      ),
    },
    {
      key: "typeOfDisability",
      label: "Tipo",
      accessor: (r) => r.typeOfDisability,
      filterable: true,
      type: "string",
      render: (r) => <div className="text-uppercase">{r.typeOfDisability}</div>,
    },
    {
      key: "status",
      label: "Estatus",
      accessor: (r) => r.status,
      filterable: true,
      type: "string",
      render: (r) => <div className="text-uppercase">{r.status}</div>,
    },
    {
      key: "whoCreate",
      label: "Creado por",
      accessor: (r) =>
        `${r.whoCreate?.name ?? ""} ${r.whoCreate?.lastName ?? ""}`.trim(),
      filterable: true,
      type: "string",
      render: (r) => (
        <div className="text-uppercase">
          {r.whoCreate?.name ?? ""} {r.whoCreate?.lastName ?? ""}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Creación",
      accessor: (r) => r.createdAt,
      filterable: true,
      type: "date",
      render: (r) => (
        <div className="small">{formatDate(r.createdAt, "dd/MM/yyyy")}</div>
      ),
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title="Incapacidades"
        formView="/app/inability?view_type=form&id=null"
      />
      <ListView.Body>
        <TableTemplate
          getRowId={(row) => row.id}
          data={inhabilities}
          columns={columns}
          // 👇 ya NO lo usamos para navegación de fila
          viewForm="/app/inability?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default InhabilityListView;
