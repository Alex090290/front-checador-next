"use client";

import { useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ListView from "../templates/ListView";
import TableTemplateServer from "../templates/TablePage";
import { TableTemplateColumn } from "../templates/TableTemplate";

// ✅ ajusta el import a donde dejaste la interface
// ejemplo: import { AttendanceReportRow } from "@/lib/definitions";
type AttendanceReportRow = {
  totalChecks: number;
  lunchExcessMinutes: number;
  lunchExcessTimes: number;
  statsByStatus: Record<string, number>;
  faultsDays: string[];
  totalFaults: number;
  employee: {
    id: number;
    name: string;
    lastName: string;
    idDepartment: number;
    branch: number;
    status: number;
  };
  idEmployee: number;
  totalRecords: number;
  usersCount: number;
};

export default function AttendanceTable({
  id,
  data,
  total,
  page,
  limit,
}: {
  id: string;
  data: AttendanceReportRow[];
  total: number;
  page: number;
  limit: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const tableRef = useRef<{ clearSelection: () => void } | null>(null);

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/attendanceReport?${params.toString()}`);
  };

  const columns: TableTemplateColumn<AttendanceReportRow>[] = useMemo(
    () => [
      {
        key: "employee",
        label: "Empleado",
        accessor: (row) =>
          `${row.employee.lastName} ${row.employee.name}`.toUpperCase(),
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-uppercase fw-semibold">
            {row.employee.lastName} {row.employee.name}
          </div>
        ),
      },
      {
        key: "totalChecks",
        label: "Checadas",
        accessor: (row) => row.totalChecks,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalChecks}</div>
        ),
      },
      {
        key: "totalRecords",
        label: "Registros",
        accessor: (row) => row.totalRecords,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalRecords}</div>
        ),
      },
      {
        key: "usersCount",
        label: "Usuarios",
        accessor: (row) => row.usersCount,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.usersCount}</div>
        ),
      },
      {
        key: "totalFaults",
        label: "Faltas",
        accessor: (row) => row.totalFaults,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.totalFaults}</div>
        ),
      },
      {
        key: "faultsDays",
        label: "Días con falta",
        accessor: (row) => (row.faultsDays ?? []).join(", "),
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fw-semibold">
            {(row.faultsDays ?? []).length === 0
              ? "—"
              : row.faultsDays.join(", ")}
          </div>
        ),
      },
      {
        key: "lunchExcessMinutes",
        label: "Exceso comida (min)",
        accessor: (row) => row.lunchExcessMinutes,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.lunchExcessMinutes}</div>
        ),
      },
      {
        key: "lunchExcessTimes",
        label: "Exceso comida (veces)",
        accessor: (row) => row.lunchExcessTimes,
        filterable: true,
        type: "number",
        render: (row) => (
          <div className="text-center fw-semibold">{row.lunchExcessTimes}</div>
        ),
      },
      {
        key: "statsByStatus",
        label: "Stats",
        accessor: (row) => JSON.stringify(row.statsByStatus ?? {}),
        filterable: true,
        type: "string",
        render: (row) => {
          const entries = Object.entries(row.statsByStatus ?? {});
          if (entries.length === 0) return <div className="text-center">—</div>;

          return (
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              {entries.map(([k, v]) => (
                <span
                  key={k}
                  className="badge text-bg-secondary text-uppercase"
                >
                  {k}: {v}
                </span>
              ))}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <ListView>
      <ListView.Header
        title={`Reporte de asistencias (${total})`}
        // si tendrás form/detalle, aquí va tu ruta:
        // formView="/app/attendanceReport?view_type=form&id=null"
      />

      <ListView.Body>
        <TableTemplateServer
          ref={tableRef}
          columns={columns}
          data={data}
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => goToPage(p)}
          getRowId={(row) => row.idEmployee}
          // si quieres click a detalle por empleado:
          // viewForm="/app/attendanceReport?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}
