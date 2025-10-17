"use client";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { Branch } from "@/lib/definitions";

function BranchesListView({ branches }: { branches: Branch[] }) {
  const columns: TableTemplateColumn<Branch>[] = [
    {
      key: "name",
      label: "Nombre",
      accessor: (u) => u.name,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-capitalize">{u.name}</div>,
    },
    {
      key: "address.street",
      label: "Calle",
      accessor: (u) => u.address?.street,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">
          {u.address?.street} {u.address?.numberOut}
        </div>
      ),
    },
    {
      key: "address.neighborhood",
      label: "Colonia",
      accessor: (u) => u.address?.neighborhood,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{u.address?.neighborhood}</div>
      ),
    },
    {
      key: "address.zipCode",
      label: "C.P.",
      accessor: (u) => u.address?.zipCode,
      filterable: true,
      type: "number",
      render: (u) => (
        <div className="text-capitalize">{u.address?.zipCode}</div>
      ),
    },
    {
      key: "address.municipality",
      label: "Municipio",
      accessor: (u) => u.address?.municipality,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-capitalize">{u.address?.municipality}</div>
      ),
    },
    {
      key: "address.state",
      label: "Estado",
      accessor: (u) => u.address?.state,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-capitalize">{u.address?.state}</div>,
    },
  ];
  return (
    <ListView>
      <ListView.Header
        title={`Sucursales (${branches.length ?? 0})`}
        formView="/app/branches?view_type=form&id=null"
      ></ListView.Header>
      <ListView.Body>
        <TableTemplate
          getRowId={(branch) => branch.id ?? 0}
          data={branches || []}
          columns={columns}
          viewForm="/app/branches?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}

export default BranchesListView;
