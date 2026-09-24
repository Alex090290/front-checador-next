"use client"

import { IBonusKeys, IUpdateBonusKeys } from "@/lib/Bonus/interface";
import { TableTemplateColumn } from "../templates/TableTemplate";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import ListView from "../templates/ListView";
import ModalBlur from "../ModalBlur";
import CreateBonuskeysModal from "./CreateBonuskeysModal";
import { Employee } from "@/lib/definitions";
import UpdateBonuskeysModal from "./UpdateBonuskeysModal";
import { useModals } from "@/context/ModalContext";
import { deleteBonusKeys } from "@/app/actions/bonusKeys-actions";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";

type FeedbackState = "loading" | "success" | "error" | null;

export default function TableBonusKeys({
    bonuskeys,
    employees
}: {
    bonuskeys: IBonusKeys[];
    employees: Employee[];
}) {

    //CONST
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const { modalConfirm } = useModals();


    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalUpdate, setShowModalUpdate] = useState(false);
    const [idRegister, setIdRegister] = useState<number | null>(null);
    const [employeeName, setEmployeeName] = useState<string | null>(null);
    const [employeeLastName, setEmployeeLastName] = useState<string | null>(null);
    const [selectedBonus, setSelectedBonus] = useState<IUpdateBonusKeys | null>(null);

    const handleUpdate = (idRegister: number, employeeName: string, employeeLastName: string, row: IUpdateBonusKeys) => {
        setSelectedBonus(row);
        setIdRegister(idRegister);
        setEmployeeName(employeeName);
        setEmployeeLastName(employeeLastName);
        setShowModalUpdate(true)
    }

    const handleDelete = (idRegister: number) => {
        modalConfirm("¿Seguro que quieres eliminar el registro?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Eliminando bono...");

                const res = await deleteBonusKeys({
                    idBonusKeys: String(idRegister),
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo eliminar");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Eliminado correctamente");
                setFeedback("success");

            } catch (error) {
                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        });
    }


    const columns: TableTemplateColumn<IBonusKeys>[] = [
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
            key: "location",
            label: "Locación",
            accessor: (r) => r.location,
            filterable: true,
            type: "string",
            render: (r) => (
                <div className="text-uppercase">
                    {r.location}
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

    ];

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
                        <h1 className="mb-0">Bonos de llaves</h1>

                        {/* <span className="text-muted">
                            {total} sucursal{total !== 1 ? "es" : ""}
                        </span> */}
                    </div>
                </div>

                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">


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
                                                    {(bonuskeys ?? []).map((row) => (
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
                                                                        onClick={() => handleUpdate(Number(row.id), String(row.employee?.name), String(row.employee?.lastName), row)}
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
                        <CreateBonuskeysModal
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
                        <UpdateBonuskeysModal
                            show={showModalUpdate}
                            onHide={() =>
                                setShowModalUpdate(false)
                            }
                            idRegister={idRegister}
                            employeeName={employeeName}
                            employeeLastName={employeeLastName}
                            Register={selectedBonus!}

                        />
                    </ModalBlur>
                </ConditionalRender>
            </Container>
        </>
    )
}