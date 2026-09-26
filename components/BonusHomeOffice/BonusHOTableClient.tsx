"use client"

import { IBonusHomeOffice } from "@/lib/Bonus/interface"
import { TableTemplateColumn } from "../templates/TableTemplate";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { Button, Card, Col, Container, InputGroup, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import ModalBlur from "../ModalBlur";
import { useCallback, useEffect, useRef, useState } from "react";
import { useModals } from "@/context/ModalContext";
import CreateBonusHomeOfficeModal from "./CreateBonusHomeOfficeModal";
import { Employee } from "@/lib/definitions";
import UpdateBonusHOModal from "./UpdateBonusHOModal";
import { deleteBonusHO } from "@/app/actions/bonusHO-actions";
import GenericSearchInput from "../employee/GenericSearchInput";
import { useRouter, useSearchParams } from "next/navigation";

type FeedbackState = "loading" | "success" | "error" | null;


export default function TableBonusHO({
    BonusHomeOffice,
    employees,
    total,
    search
}: {
    BonusHomeOffice: IBonusHomeOffice[];
    employees: Employee[];
    total: number;
    search?: string;
}) {

    console.log("total:", total);

    //CONST
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const { modalConfirm } = useModals();

    const sp = useSearchParams();
    const searchParamsString = sp.toString();
    const currentSearch = sp.get("search") ?? "";
    const isClearingSelectionRef = useRef(false);
    const [, setSelectedIds] = useState<Array<string | number>>([]);
    const tableRef = useRef<{ clearSelection: () => void } | null>(null);
    const [, setTableResetKey] = useState(0);
    const router = useRouter();

    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [sendRow, setSendRow] = useState<IBonusHomeOffice | null>(null);
    const [idRegister, setIdRegister] = useState<number | null>(null);


    useEffect(() => {
        setFeedback(null);
        setFeedbackMsg("");
    }, [searchParamsString]);

    const handleUpdate = (Row: IBonusHomeOffice, idRegister: number) => {
        setSendRow(Row);
        setIdRegister(idRegister);
        setShowModalUpdate(true);
    }

    const handleDelete = (idRegister: number) => {

        modalConfirm("¿Seguro que quieres eliminar el registro?", async () => {
            try {

                setFeedback("loading");
                setFeedbackMsg("Eliminando bono...");

                const res = await deleteBonusHO({
                    idBonus: String(idRegister),
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo eliminar");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Eliminado correctamente");
                setFeedback("success");

            } catch (error) {
                console.log(error);

                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        })
    }

    const clearSelectedIds = useCallback(() => {
        isClearingSelectionRef.current = true;

        tableRef.current?.clearSelection();
        setSelectedIds([]);
        setTableResetKey((k) => k + 1);

        setTimeout(() => {
            isClearingSelectionRef.current = false;
        }, 0);
    }, []);

    const handleSearch = useCallback(
        (value: string) => {
            if (value === currentSearch) return;

            setFeedback("loading");
            setFeedbackMsg("Buscando...");

            const params = new URLSearchParams(searchParamsString);
            params.set("id", "null");
            params.set("view_type", "list");

            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            clearSelectedIds();
            router.push(`/app/bonushomeoffice?${params.toString()}`);
        },
        [currentSearch, searchParamsString, router, clearSelectedIds]
    );


    const columns: TableTemplateColumn<IBonusHomeOffice>[] = [
        {
            key: "id",
            label: "ID",
            accessor: (r) => r.id,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.id}
                </div>
            ),
        },
        {
            key: "employee",
            label: "Empleado beneficiado",
            accessor: (r) => r.employee,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.employee?.lastName} {r.employee?.name}
                </div>
            ),
        },
        {
            key: "department",
            label: "Departamento",
            accessor: (r) => r.department,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.department?.nameDepartment}
                </div>
            ),
        },
        {
            key: "amount",
            label: "Cantidad del bono",
            accessor: (r) => r.amount,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    $ {r.amount}
                </div>
            ),
        },
    ]

    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() =>
                        setFeedback(null)
                    }
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>

                <Button
                    variant="primary"
                    className="d-inline-flex align-items-center gap-2 fw-semibold px-3"
                    onClick={() => setShowModalCreate(true)}
                >
                    <i className="bi bi-plus-lg" />
                    Crear bono
                </Button>

                <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
                    <div>
                        <h1 className="mb-0">Bonos de home office</h1>

                        <span className="text-muted">
                            {total} bono{total !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">

                                <Row className="justify-content-left mb-3 g-3">
                                    {/* FILTRO POR EMPLEADO */}
                                    <Col xs={12} md={6} lg={6}>
                                        <Card className="border rounded-4 h-100">
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="bi bi-person text-primary" />
                                                    <span className="fw-semibold small">Filtrar por empleado</span>
                                                </div>

                                                <InputGroup>
                                                    <InputGroup.Text
                                                        className="bg-gray"
                                                        style={{ color: "#6c757d" }}
                                                    >
                                                        <i className="bi bi-search" />
                                                    </InputGroup.Text>
                                                    <GenericSearchInput
                                                        initialValue={search}
                                                        onSearch={handleSearch}
                                                        placeholder="Buscar por nombre o apellido..."
                                                    />
                                                </InputGroup>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                </Row>

                                <ListView>
                                    <ListView.Body>
                                        <div className="table-responsive rounded-3 border overflow-auto">
                                            <table className="table table-hover align-middle mb-0">
                                                <thead className="table-dark border-secondary">
                                                    <tr>
                                                        {columns.map((column) => (
                                                            <th
                                                                key={String(column.key)}
                                                                className="fw-bold text-left"
                                                            >
                                                                {column.label}
                                                            </th>
                                                        ))}

                                                        <th className="fw-bold text-center">Acciones</th>
                                                    </tr>
                                                </thead>

                                                <tbody>

                                                    <ConditionalRender cond={BonusHomeOffice?.length === 0}>
                                                        <tr>
                                                            <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                                                <i
                                                                    className={`bi ${search ? "bi-clipboard-x" : "bi-inbox"} d-block mb-2`}
                                                                    style={{ fontSize: "2.5rem" }}
                                                                />
                                                                <span className="fw-semibold">
                                                                    {search
                                                                        ? "No se encontro ningun bono con los filtros aplicados"
                                                                        : "No hay bonos registradas"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </ConditionalRender>

                                                    {(BonusHomeOffice ?? []).map((row) => (
                                                        <tr key={row.id}>
                                                            {columns.map((column) => (
                                                                <td key={String(column.key)}>
                                                                    {column.render
                                                                        ? column.render(row)
                                                                        : column.accessor(row)}
                                                                </td>
                                                            ))}

                                                            <td className="align-middle">
                                                                <div className="d-flex justify-content-center align-items-center gap-2">


                                                                    <Button
                                                                        variant="outline-info"
                                                                        className="btn-sm"
                                                                        onClick={() => handleUpdate(row, Number(row.id))}
                                                                    >
                                                                        Actualizar
                                                                    </Button>

                                                                    <Button
                                                                        variant="danger"
                                                                        className="btn-sm"
                                                                        onClick={() => handleDelete(Number(row.id))}
                                                                    >
                                                                        Eliminar
                                                                    </Button>



                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </ListView.Body>
                                </ListView>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <ConditionalRender cond={showModalCreate}>
                    <ModalBlur onClose={() => setShowModalCreate(false)}>
                        <CreateBonusHomeOfficeModal
                            show={showModalCreate}
                            onHide={() =>
                                setShowModalCreate(false)
                            }
                            employees={employees}
                        />
                    </ModalBlur>
                </ConditionalRender>

                <ConditionalRender cond={showModalUpdate}>
                    <ModalBlur onClose={() => setShowModalUpdate(false)}>
                        <UpdateBonusHOModal
                            show={showModalUpdate}
                            onHide={() =>
                                setShowModalUpdate(false)
                            }
                            idRegister={idRegister}
                            Register={sendRow}


                        />
                    </ModalBlur>
                </ConditionalRender>
            </Container>
        </>
    )
}
