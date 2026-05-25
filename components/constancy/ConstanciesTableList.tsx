"use client"

import { Constancy } from "@/lib/constancy/interface";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TableTemplateServer, { TableTemplateColumn } from "../templates/TablePage";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { Button } from "react-bootstrap";
import ListView from "../templates/ListView";
import moment from "moment";
import { EmployeeLite } from "../configSystem/formUpdate";
import { usePathname } from "next/navigation";

export default function ConstanciesTableClient({
    total,
    page,
    limit,
    constancies = [],
    employees = [],
}: {
    total: number;
    page: number;
    limit: number;
    constancies?: Constancy[];
    employees?: EmployeeLite[];
}) {
    const router = useRouter();
    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const tableResetKey = 0;
    const pathname = usePathname();

    useEffect(() => {
        if (loading) {
            setLoading(false);
            setMessageLoading("");
        }
    }, [pathname, searchParamsString]);

    const goToPage = (nextPage: number) => {
        setLoading(true);
        setMessageLoading("Cargando");
        const params = new URLSearchParams(searchParamsString);
        params.set("id", "null");
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        router.push(`/app/constancy?${params.toString()}`);
    };

    const getEmployeeName = (u: Constancy) => {
        const employee = employees.find(
            (e) => Number(e.id) === Number(u.idEmployee)
        );

        return employee
            ? `${employee.name} ${employee.lastName}`
            : `Empleado #${u.idEmployee}`;
    };

    const getDate = (u: Constancy) =>
        u.dateAndTimeOfTheEvents
            ? moment.utc(u.dateAndTimeOfTheEvents).format("DD/MM/YYYY")
            : u.dateTheEvents ?? "-";

    const getHour = (u: Constancy) =>
        u.dateAndTimeOfTheEvents
            ? moment.utc(u.dateAndTimeOfTheEvents).format("HH:mm")
            : u.hourTheEvents ?? "-";

    const columns: TableTemplateColumn<Constancy>[] = [
        {
            key: "idEmployee",
            label: "Nombre del empleado",
            accessor: getEmployeeName,
            filterable: true,
            type: "string",
            render: (u) =>
                <div className="text-uppercase">
                    {getEmployeeName(u)}
                </div>,
        },
        {
            key: "dateTheEvents",
            label: "Fecha del incidente",
            accessor: getDate,
            filterable: true,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">
                    {getDate(u)}
                </div>
            ),
        },
        {
            key: "hourTheEvents",
            label: "Hora del incidente",
            accessor: getHour,
            filterable: true,
            type: "string",
            render: (u) => (
                <div className="text-uppercase">
                    {getHour(u)}
                </div>
            ),
        },
        {
            key: "sceneOfTheEvents",
            label: "Lugar de los hechos",
            accessor: (u) => u.sceneOfTheEvents,
            filterable: true,
            type: "number",
            render: (u) =>
                <div className="text-uppercase">
                    {u.sceneOfTheEvents || "-"}
                </div>,
        },
        // {
        //     key: "backgroundIds",
        //     label: "Antecedentes",
        //     accessor: (u) => u.backgroundIds?.join(", ") ?? "",
        //     filterable: true,
        //     type: "string",
        //     render: (u) => (
        //         <div>{u.backgroundIds?.length ? u.backgroundIds.join(", ") : "-"}</div>
        //     ),
        // },
        {
            key: "typeOfPenalty",
            label: "Tipo de penalización",
            accessor: (u) => u.typeOfPenalty?.map((p) => p.name).join(", ") ?? "",
            filterable: true,
            type: "string",
            render: (u) =>
                <div className="text-uppercase">
                    {u.typeOfPenalty?.map((p) => p.name).join(", ") || "-"}</div>,
        },
        {
            key: "signatures",
            label: "Firmas",
            accessor: (u) => u.signatures?.map((p) => p.name).join(", ") ?? "",
            filterable: true,
            type: "string",
            render: (u) =>
                <div className="text-uppercase">
                    {u.signatures?.map((p) => p.name).join(", ") || "-"}</div>,
        },
    ];

    const handleCreate = () => {
        setLoading(true);
        setMessageLoading("Cargando...");
        router.push("/app/constancy/create");
    };

    const handleSelectionChange = (ids: Array<string | number>) => {
        if (isClearingSelectionRef.current) return;
        setSelectedIds(ids);
    };

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <div className="flex-shrink-0 d-flex justify-content-between ms-2 mb-2 mt-4">
                <Button
                    size="sm"
                    variant="primary"
                    className="fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    <i className="bi bi-plus-lg" />
                    Crear Constancia
                </Button>
            </div>

            <div className="table-responsive m-2">
                <ListView>
                    <ListView.Header
                        title={
                            <span className="fs-3 fw-semibold">
                                Constancias ({total})
                            </span>
                        }
                    />

                    <ListView.Body>
                        <TableTemplateServer
                            ref={tableRef}
                            key={tableResetKey}
                            columns={columns}
                            data={constancies}
                            total={total}
                            page={page}
                            limit={limit}
                            onPageChange={(p) => goToPage(p)}
                            getRowId={(row) => Number(row.id)}
                            viewForm="/app/constancy?view_type=form"
                            onSelectionChange={handleSelectionChange}
                        />
                    </ListView.Body>
                </ListView>
            </div>
        </>
    );

}

