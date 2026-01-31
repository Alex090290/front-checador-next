"use client";

import { useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "react-bootstrap";
import { formatDate } from "date-fns";

import ListView from "../templates/ListView";
import TableTemplateServer from "../templates/TablePage";
import { TableTemplateColumn } from "../templates/TableTemplate";

import { Vacations } from "@/lib/definitions";
import { vacationStatus } from "@/app/(auth)/app/vacations/views/VacationsListView";

export default function VacationsTableClient({
  vacations,
  total,
  page,
  limit,
}: {
  id: string;
  vacations: Vacations[];
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
    router.push(`/app/vacationList?${params.toString()}`);
  };

  const columns: TableTemplateColumn<Vacations>[] = useMemo(
    () => [
      {
        key: "employee",
        label: "Empleado",
        accessor: (row) =>
          `${row.employee.lastName} ${row.employee.name}`.toUpperCase(),
        filterable: true,
        type: "string",
      },
      {
        key: "holidayName",
        label: "Día festivo",
        accessor: (row) => row.holidayName,
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fs-6 fw-semibold">{row.holidayName}</div>
        ),
      },
      {
        key: "period",
        label: "Periodo Vacacional",
        accessor: (row) => row.period.periodDescription,
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fs-6 fw-semibold">
            {row.period.periodDescription}
          </div>
        ),
      },
      {
        key: "dateInit",
        label: "Fecha Inicio",
        accessor: (row) => row.dateInit,
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fs-6 fw-semibold">
            {formatDate(row.dateInit, "dd/MM/yyyy")}
          </div>
        ),
      },
      {
        key: "dateEnd",
        label: "Fecha Fin",
        accessor: (row) => row.dateEnd,
        filterable: true,
        type: "string",
        render: (row) => (
          <div className="text-center fs-6 fw-semibold">
            {formatDate(row.dateEnd, "dd/MM/yyyy")}
          </div>
        ),
      },
      {
        key: "status",
        label: "Estado",
        accessor: (row) => vacationStatus[row.status],
        type: "string",
        render: (row) => {
          let bg: "success" | "warning" | "danger" | "secondary" = "secondary";
          const status = vacationStatus[row.status];
          if (status === "Aprobado") bg = "success";
          if (status === "Pendiente") bg = "warning";
          if (status === "Rechazado") bg = "danger";
          return <Badge bg={bg}>{vacationStatus[row.status]}</Badge>;
        },
      },
    ],
    []
  );

  return (
    <ListView>
      <ListView.Header
        title={`Vacaciones (${total})`}
        formView="/app/vacationList?view_type=form&id=null"
      />

      <ListView.Body>
        <TableTemplateServer
          ref={tableRef}
          columns={columns}
          data={vacations}
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => goToPage(p)}
          getRowId={(row) => row.id}
          viewForm="/app/vacationList?view_type=form"
        />
      </ListView.Body>
    </ListView>
  );
}
