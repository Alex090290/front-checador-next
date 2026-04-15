"use client";

import { deleteDepartment } from "@/app/actions/departments-actions";
import ListView from "@/components/templates/ListView";
import TableTemplate, {
  TableTemplateColumn,
} from "@/components/templates/TableTemplate";
import { useModals } from "@/context/ModalContext";
import { Department } from "@/lib/definitions";
import { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import TableTemplateServer from "../templates/TablePage";
import { useRouter, useSearchParams } from "next/navigation";

export default function DepartmentsTableList({
    departments,
    total,
    page,
    limit
  }: {
    departments: Department[];
    total: number;
    page: number;
    limit: number;
  }) {
    const router = useRouter();
    const sp = useSearchParams();

  const { modalError, modalConfirm } = useModals();
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState("");
  const [tableResetKey, setTableResetKey] = useState(0);
  const tableRef = useRef<{ clearSelection: () => void } | null>(null);
  const isClearingSelectionRef = useRef(false);

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
      router.push(`/app/departments?${params.toString()}`);
    };
  const columns: TableTemplateColumn<Department>[] = [
    {
      key: "nameDepartment",
      label: "Nombre",
      accessor: (u) => u.nameDepartment,
      filterable: true,
      type: "string",
      render: (u) => <div className="text-uppercase">{u.nameDepartment}</div>,
    },
    {
      key: "leader",
      label: "Líder",
      accessor: (u) => u.leader?.name,
      filterable: true,
      type: "string",
      render: (u) => (
        <div className="text-uppercase">{`${u.leader?.name ?? " "} ${
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
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Form.Select
            size="sm"
            className="text-uppercase shadow-none border-0"
          >
            <option>{u.positions.length}</option>
            {u.positions.map((p) => (
              <option key={`${p.id}-${p.namePosition}`}>
                {p.namePosition}
              </option>
            ))}
          </Form.Select>
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setLoading(true);
    setMessageLoading('Cargando...');
    router.push("/app/departments/create");
};
const handleSelectionChange = (ids: Array<string | number>) => {
    if (isClearingSelectionRef.current) return;
    setSelectedIds(ids);
  };
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
                Crear Departamento
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
                    data={departments}
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={(p) => goToPage(p)}
                    getRowId={(row) => Number(row.id)}
                    viewForm="/app/departments?view_type=form"
                    onSelectionChange={handleSelectionChange}
                />
            </ListView.Body>
            </ListView>
      </div>
  </>
}

