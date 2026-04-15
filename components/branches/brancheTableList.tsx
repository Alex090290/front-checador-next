"use client";

import ListView from "@/components/templates/ListView";
import { TableTemplateColumn } from "@/components/templates/TableTemplate";
import { Branch } from "@/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button } from "react-bootstrap";
import TableTemplateServer from "../templates/TablePage";

export default function BranchesTableClient({
    branches,
    total,
    page,
    limit
  }: {
    branches: Branch[];
    total: number;
    page: number;
    limit: number;
  }) {

    const router = useRouter();
    const sp = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const isClearingSelectionRef = useRef(false);
    const [tableResetKey, setTableResetKey] = useState(0);
    const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);

    useEffect(() => {
        if (loading) {
          setLoading(false);
          setMessageLoading("");
        }
      }, [sp.toString()]);
    
      const goToPage = (nextPage: number) => {
        setLoading(true);
        setMessageLoading("Cargando");
        const params = new URLSearchParams(sp.toString());
        params.set("id", "null");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        router.push(`/app/branches?${params.toString()}`);
      };

    const columns: TableTemplateColumn<Branch>[] = [
        {
        key: "name",
        label: "Nombre",
        accessor: (u) => u.name,
        filterable: true,
        type: "string",
        render: (u) => <div className="text-uppercase">{u.name}</div>,
        },
        {
        key: "address.street",
        label: "Calle",
        accessor: (u) => u.address?.street,
        filterable: true,
        type: "string",
        render: (u) => (
            <div className="text-uppercase">
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
            <div className="text-uppercase">{u.address?.neighborhood}</div>
        ),
        },
        {
        key: "address.zipCode",
        label: "C.P.",
        accessor: (u) => u.address?.zipCode,
        filterable: true,
        type: "number",
        render: (u) => <div className="text-uppercase">{u.address?.zipCode}</div>,
        },
        {
        key: "address.municipality",
        label: "Municipio",
        accessor: (u) => u.address?.municipality,
        filterable: true,
        type: "string",
        render: (u) => (
            <div className="text-uppercase">{u.address?.municipality}</div>
        ),
        },
        {
        key: "address.state",
        label: "Estado",
        accessor: (u) => u.address?.state,
        filterable: true,
        type: "string",
        render: (u) => <div className="text-uppercase">{u.address?.state}</div>,
        },
    ];

    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/branches/create");
    };
    const handleSelectionChange = (ids: Array<string | number>) => {
        if (isClearingSelectionRef.current) return;
        setSelectedIds(ids);
      };

  return <>
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
            Crear Sucursal
            </Button>
        </div>

        <div className="flex-grow-1 overflow-hidden">
            <ListView>
            <ListView.Header
                title={`Sucursales (${total})`}
            />
    
            <ListView.Body>
                <TableTemplateServer
                    ref={tableRef}
                    key={tableResetKey}
                    columns={columns}
                    data={branches}
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={(p) => goToPage(p)}
                    getRowId={(row) => Number(row.id)}
                    viewForm="/app/branches?view_type=form"
                    onSelectionChange={handleSelectionChange}
                />
            </ListView.Body>
            </ListView>
      </div>
  </>
}

