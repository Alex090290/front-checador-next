"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "react-bootstrap";
import { formatDate } from "date-fns";

import ListView from "../templates/ListView";
import TableTemplateServer from "../templates/TablePage";
import { TableTemplateColumn } from "../templates/TableTemplate";

import { IPermissionRequest, Vacations } from "@/lib/definitions";
import { vacationStatus } from "@/app/(auth)/app/vacations/views/VacationsListView";
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

export const leaderApproval = {
  APPROVED: "APROBADO",
  REFUSED: "RECHAZADO",
  PENDING: "PENDIENTE",
  EMPLOYEE: "EMPLEADO",
};


export default function PermissionsTableClient({
  permissions,
  total,
  page,
  limit,
}: {
  id: string;
  permissions: IPermissionRequest[];
  total: number;
  page: number;
  limit: number;
}) {
  
  const router = useRouter();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState('');
  const tableRef = useRef<{ clearSelection: () => void } | null>(null);

  
  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading('Cargando');
    const params = new URLSearchParams(sp.toString());
    params.set("view_type", "list");
    params.set("id", "null");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    router.push(`/app/permissions?${params.toString()}`);
  };

  const columns: TableTemplateColumn<IPermissionRequest>[] = [
    {
      key: "employeeName",
      label: "Nombre",
      accessor: (row) => `${row.employee.lastName} ${row.employee.name}`,
      filterable: true,
      type: "string",
      render: (row) => (
        <div className="text-uppercase">
          {row.employee.lastName} {row.employee.name}
        </div>
      ),
    },
    {
      key: "type",
      label: "Tipo",
      accessor: (row) => row.type,
    },
    {
      key: "motive",
      label: "Motivo",
      accessor: (row) => row.motive,
      filterable: true,
      type: "string",
      render: (row) => <div className="text-uppercase">{row.motive}</div>,
    },
    {
      key: "createforPerson",
      label: "Creado por",
      accessor: (row) =>
        `${row.createForPerson.lastName} ${row.createForPerson.lastName}`,
      type: "string",
      filterable: true,
      render: (row) => (
        <div className="text-uppercase">
          {`${row.createForPerson.lastName} ${row.createForPerson.lastName}`}
        </div>
      ),
    },
    {
      key: "leader",
      label: "Gerente",
      accessor: (row) =>
        `${row.leader.lastName} ${row.leader.name}`.toUpperCase(),
    },
    {
      key: "createdAt",
      label: "Fecha de creación",
      accessor: (row) => row.createdAt,
      render: (row) => (
        <div className="text-center">
          {row.createdAt
            ? formatDate(row.createdAt, "dd-MM-yyyy HH:mm")
            : "No Definido"}
        </div>
      ),
      groupFormat: "MM-dd",
      type: "date",
    },
    {
      key: "leaderApproval",
      label: "Estado",
      accessor: (row) => leaderApproval[row.status],
      render: (row) => {
        const status = leaderApproval[row.status];
        return (
          <div className="text-center">
            <Badge
              bg={
                status === "APROBADO"
                  ? "success"
                  : status === "PENDIENTE" 
                  ? "warning"
                  : "danger"
              }
            >
              {leaderApproval[row.status]}
            </Badge>
          </div>
        );
      },
    },
  ];

  return <>
    <ConditionalRender cond={loading}>
      <Loading message={messageLoading} />
    </ConditionalRender>
    <ListView>
      <ListView.Header
        title={`Permisos (${total})`}
        formView="/app/permissions?id=null"
      />

      <ListView.Body>
        <TableTemplateServer
          ref={tableRef}
          columns={columns}
          data={permissions}
          total={total}
          page={page}
          limit={limit}
          onPageChange={(p) => goToPage(p)}
          getRowId={(row) => row.id}
          viewForm="/app/permissions"
        />
      </ListView.Body>
    </ListView>
  </>
}
