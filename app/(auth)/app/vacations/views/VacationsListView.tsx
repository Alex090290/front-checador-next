"use client";

import ListView from "@/components/templates/ListView";
import {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { VacationRequestStatus, Vacations } from "@/lib/definitions";
import { Badge } from "react-bootstrap";
import moment from "moment-timezone";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TableTemplateServer from "@/components/templates/TablePage";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

export const vacationStatus: Record<VacationRequestStatus, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  REFUSED: "Rechazado",
  EMPLOYEE: "Empleado",
};

function VacationsListView({
  vacations,
  total,
  page,
  limit,
}: {
  vacations: Vacations[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");

  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
  }, [searchParamsString, loading]);


  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParamsString);
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/vacations?${params.toString()}`);
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
            {moment.utc(row.dateInit).format("DD/MM/YYYY")}
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
            {moment.utc(row.dateEnd).format("DD/MM/YYYY")}
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
  <div className="d-flex flex-column h-100 overflow-hidden">
    <ConditionalRender cond={loading}>
      <Loading message={messageLoading} />
    </ConditionalRender>

    <ListView>

      <ListView.Body>
        <TableTemplateServer
          columns={columns}
          data={vacations}
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => goToPage(p)}
          getRowId={(row) => row.id}
          viewForm="/app/vacations?view_type=form"
        />
      </ListView.Body>
    </ListView>
      </div>
  );
}

export default VacationsListView;
