"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button } from "react-bootstrap";
import moment from "moment-timezone";

import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";
import ListView from "@/components/templates/ListView";
import TableTemplateServer, {
  TableTemplateColumn,
} from "@/components/templates/TablePage";
import { IInability } from "@/lib/definitions";

const statusVariantMap: Record<string, string> = {
  APROBADA: "success",
  APROBADO: "success",
  PENDIENTE: "warning",
  RECHAZADA: "danger",
  RECHAZADO: "danger",
};

export default function TableInabilityComponent({
  total,
  page,
  limit,
  inhabilities = [],
}: {
  total: number;
  page: number;
  limit: number;
  inhabilities?: IInability[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParamsString = sp.toString();

  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const tableRef = useRef<{ clearSelection: () => void } | null>(null);
  const isClearingSelectionRef = useRef(false);
  const [, setSelectedIds] = useState<Array<string | number>>([]);
  const tableResetKey = 0;
  
  useEffect(() => {
    if (loading) {
      setLoading(false);
      setMessageLoading("");
    }
  }, [searchParamsString, loading]);

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading("Cargando...");
    router.push("/app/inability/create");
  };

  const goToPage = (nextPage: number) => {
    setLoading(true);
    setMessageLoading("Cargando...");

    const params = new URLSearchParams(searchParamsString);
    params.set("id", "null");
    params.set("view_type", "list");
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    router.push(`/app/inability?${params.toString()}`);
  };

  const handleSelectionChange = (ids: Array<string | number>) => {
    if (isClearingSelectionRef.current) return;
    setSelectedIds(ids);
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
        <div className="text-uppercase">
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
      render: (r) => (
        <div className="text-uppercase">{r.typeOfDisability}</div>
      ),
    },
    {
      key: "status",
      label: "Estatus",
      accessor: (r) => r.status,
      filterable: true,
      type: "string",
      render: (r) => {
        const status = String(r.status ?? "").toUpperCase();
        const variant = statusVariantMap[status] ?? "secondary";

        return (
          <div className="text-center">
            <Badge pill bg={variant}>
              {status}
            </Badge>
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
        <div className="small text-center">
          {r.createdAt ? moment.utc(r.createdAt).format("DD/MM/YYYY") : ""}
        </div>
      ),
    },
  ];

  return (
    <div className="d-flex flex-column h-100 overflow-hidden">
      <ConditionalRender cond={loading}>
        <Loading message={messageLoading} />
      </ConditionalRender>

      <div className="flex-shrink-0 d-flex justify-content-between mb-2 mt-2">
        <Button
          size="sm"
          variant="primary"
          className="fw-semibold d-inline-flex align-items-center gap-2"
          onClick={handleCreate}
        >
          <i className="bi bi-plus-lg" />
          Crear Incapacidad
        </Button>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <ListView>
          <ListView.Header title={`Incapacidades (${total})`} />

          <ListView.Body>
            <TableTemplateServer
              ref={tableRef}
              key={tableResetKey}
              columns={columns}
              data={inhabilities || []}
              total={total}
              page={page}
              limit={limit}
              onPageChange={(p) => goToPage(p)}
              getRowId={(row) => Number(row.id)}
              viewForm="/app/inability"
              onSelectionChange={handleSelectionChange}
            />
          </ListView.Body>
        </ListView>
      </div>
    </div>
  );
}