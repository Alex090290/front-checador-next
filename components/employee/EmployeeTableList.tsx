"use client";


import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Employee, Permission } from "@/lib/definitions";
import ListView from "../templates/ListView";
import TableTemplate from "../templates/TableTemplate";
import TableTemplateServer, { TableTemplateColumn } from "../templates/TablePage";
import { Badge, Button } from "react-bootstrap";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";


const employeeStatus = {
    1: "activo",
    2: "baja",
  };

export default function EmployeeTableClient({
    total,
    page,
    limit,
    employees = [],
  }: {
    total: number;
    page: number;
    limit: number;
    employees?: Employee[];
  }) {

    const router = useRouter();
    const sp = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [tableResetKey, setTableResetKey] = useState(0);
    const isClearingSelectionRef = useRef(false);
    const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

    useEffect(() => {
        if (loading) {
          setLoading(false);
          setMessageLoading("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [sp.toString()]);
      
    const handleCreate = () => {
        setLoading(true);
        setMessageLoading('Cargando...');
        router.push("/app/employee/create");
      };

      const clearSelectedIds = () => {
        isClearingSelectionRef.current = true;
    
        tableRef.current?.clearSelection();
        setSelectedIds([]);
        setTableResetKey((k) => k + 1);
    
        setTimeout(() => {
          isClearingSelectionRef.current = false;
        }, 0);
      };

      const goToPage = (nextPage: number) => {
        setLoading(true);
        setMessageLoading("Cargando");
        const params = new URLSearchParams(sp.toString());
        params.set("id", "null");
        params.set("view_type", "list");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        router.push(`/app/employee?${params.toString()}`);
      };
      const handleSelectionChange = (ids: Array<string | number>) => {
        if (isClearingSelectionRef.current) return;
        setSelectedIds(ids); 
      };

    const columns: TableTemplateColumn<Employee>[] = [
        {
          key: "name",
          label: "Nombre",
          accessor: (u) => u.name,
          filterable: true,
          type: "string",
          render: (u) => <div className="text-uppercase">{u.name}</div>,
        },
        {
          key: "lastName",
          label: "Apellidos",
          accessor: (u) => u.lastName,
          filterable: true,
          type: "string",
          render: (u) => <div className="text-uppercase">{u.lastName}</div>,
        },
        {
          key: "status",
          label: "Estado",
          accessor: (u) =>
            employeeStatus[u.status as keyof typeof employeeStatus] ?? "",
          filterable: true,
          type: "string",
          render: (u) => (
            <div className="text-capitalize text-center">
              <Badge
                pill
                bg={
                  employeeStatus[u.status as keyof typeof employeeStatus] ===
                  "activo"
                    ? "success"
                    : "danger"
                }
              >
                {`${employeeStatus[u.status as keyof typeof employeeStatus]}`}
              </Badge>
            </div>
          ),
        },
        {
          key: "phonePersonal.internationalNumber",
          label: "Teléfono",
          accessor: (u) => u.phonePersonal?.internationalNumber,
          filterable: true,
          type: "string",
        },
        {
          key: "department.nameDepartment",
          label: "Departamento",
          accessor: (u) => u.department?.nameDepartment,
          filterable: true,
          type: "string",
          render: (u) => (
            <div className="text-uppercase">{`${u.department?.nameDepartment}`}</div>
          ),
        },
        {
          key: "position.namePosition",
          label: "Puesto",
          accessor: (u) => u.position?.namePosition,
          filterable: true,
          type: "string",
          render: (u) => (
            <div className="text-uppercase">{`${u.position?.namePosition}`}</div>
          ),
        },
        {
          key: "leader.name",
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
          key: "branch.name",
          label: "Sucursal",
          accessor: (u) => u.branch?.name,
          filterable: true,
          type: "string",
          render: (u) => (
            <div className="text-uppercase">{`${u.branch?.name}`}</div>
          ),
        },
      ];
    console.log("employees: ",employees);
    
      return <>
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
                Crear Empleado
                </Button>
            </div>
        
            <div className="flex-grow-1 overflow-hidden">
            <ListView>
                <ListView.Body>
                    <TableTemplateServer
                        ref={tableRef}
                        key={tableResetKey}
                        columns={columns}
                        data={employees || []}
                        total={total}
                        page={page}
                        limit={limit}
                        onPageChange={(p) => goToPage(p)}
                        getRowId={(row) => Number(row.id)}
                        viewForm="/app/employee"
                        onSelectionChange={handleSelectionChange}
                    />
                </ListView.Body>
            </ListView>
            </div>
    </div>
      </>
  }