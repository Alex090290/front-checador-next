"use client";

import useSWR from "swr";
import { useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import type { IInability } from "@/lib/definitions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  status?: number;
  data: T;
};

const fmt = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return format(d, "yyyy-MM-dd");
};

export default function TableInability() {
  const router = useRouter();

  const { data, isLoading, error } = useSWR<ApiResponse<IInability[]>>(
    "/api/inability",
    fetcher
  );

  const rows = useMemo(() => data?.data ?? [], [data]);

  const goUpdate = (row: IInability) => {
    // ✅ guardamos el objeto completo
    sessionStorage.setItem("inability_edit_row", JSON.stringify(row));
    router.push(`/app/inability?view_type=update&id=${row.id}`);
  };

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
          onClick={(e) => {
            e.stopPropagation();
            goUpdate(r);
          }}

        >
          {(r.employee?.name ?? "")} {(r.employee?.lastName ?? "")}
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
      key: "period",
      label: "Periodo",
      accessor: (r) => {
        const doc = r.documentsInability?.[0];
        return doc ? `${fmt(doc.dateInit)} - ${fmt(doc.dateEnd)}` : "-";
      },
      filterable: true,
      type: "string",
      render: (r) => {
        const doc = r.documentsInability?.[0];
        return (
          <div className="small">
            {doc ? (
              <div>
                <span className="fw-semibold">{fmt(doc.dateInit)}</span>{" "}
                <span className="text-muted">a</span>{" "}
                <span className="fw-semibold">{fmt(doc.dateEnd)}</span>
              </div>
            ) : (
              "-"
            )}
          </div>
        );
      },
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
          {(r.whoCreate?.name ?? "")} {(r.whoCreate?.lastName ?? "")}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Creación",
      accessor: (r) => r.createdAt,
      filterable: true,
      type: "date",
      render: (r) => <div className="small">{fmt(r.createdAt)}</div>,
    },
  ];

  return (
    <ListView>
      <ListView.Header
        title={
          isLoading
            ? "Incapacidades (Cargando...)"
            : `Incapacidades (${rows.length})`
        }
        formView="/app/inability?view_type=form&id=null"
      />

      <ListView.Body>
        {error ? (
          <div className="text-danger">Error cargando incapacidades</div>
        ) : (
          <TableTemplate
            getRowId={(row) => row.id}
            data={rows}
            columns={columns}
            // 👇 ya NO lo usamos para navegación de fila
            viewForm="/app/inability?view_type=update"
          />
        )}
      </ListView.Body>
    </ListView>
  );
}
