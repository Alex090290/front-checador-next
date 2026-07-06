"use client"

import { createOverTime, sendSignatureOverTime } from "@/app/actions/overtime-actions";
import { useModals } from "@/context/ModalContext";
import { ActionResponse, Employee } from "@/lib/definitions"
import { ISignatures, OverTime, OverTimeAxios, TInputsOvertime } from "@/lib/overTime/interface";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Container, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { Entry, RelationField, SignatureInput } from "../fields";
import { useSessionSnapshot } from "@/hooks/useSessionStore";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import toast from "react-hot-toast";

const DEFAULT_VALUES: TInputsOvertime = {
    idEmployee: 0,
    motive: "",
    date: "",
    hourInit: "",
    hourEnd: "",
};


export default function CreateOvertimeComponent({
    employees = []
}: {
    employees?: Employee[];
}) {
    const {
        register,
        reset,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<TInputsOvertime>({
        defaultValues: DEFAULT_VALUES,
    });

    // Aqwi los const
    const session = useSessionSnapshot();
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);

    const router = useRouter();

    const readInput = !session?.uid?.roles.isLeader && !session?.uid?.roles.isExtra && !session?.uid?.roles.isDoh && !session?.uid?.roles.isApproverLeaders && !session?.uid?.roles.isApproverDoh;
    const idEmployee = Number(session?.uid?.idEmployee);


    useEffect(() => {
        if (session?.uid?.roles?.isLeader) {

            const filtrados = employees.filter(
                (el: Employee) => Number(el.department?.idLeader) === Number(session.uid?.idEmployee)
            );
            setFilteredEmployees(filtrados);
        } else {
            setFilteredEmployees(employees);
        }
    }, [session, idEmployee, employees]);


    //Helpers
    const onSubmit: SubmitHandler<TInputsOvertime> = async (data) => {

        if (!data.signature || data.signature && data.signature === "") {
            modalError("La firma es obligatoria");
            return;
        }


        modalConfirm("¿Seguro que quieres guardar el registro?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Guardando registro...");

                await createOverTime({ data })
                    .then(async (rescrate: ActionResponse<OverTimeAxios>) => {
                        if (!rescrate.success || !rescrate.data?.id) {
                            modalError(rescrate.message || "No se pudo crear el registro");
                            return;
                        }

                        await sendSignatureOverTime({
                            id: Number(rescrate.data.id),
                            signature: String(data.signature),
                        });

                        toast.success(rescrate.message || "Registro creado correctamente");

                        setTimeout(() => {
                            router.push("/app/overtime");
                        }, 1200);
                    })
                    .catch((errData) => {
                        console.log("errData:", errData);
                        modalError(errData.message || "Error al crear el registro");
                    });
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };


    useEffect(() => {
        if (session?.uid?.role === "EMPLOYEE") setValue("idEmployee", session?.uid?.idEmployee);

    }, [session, setValue]);

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando...");
        router.push("/app/overtime");
    };

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading} />
            </ConditionalRender>

            <ConditionalRender cond={isSubmitting}>
                <Loading message="Guardando..." />
            </ConditionalRender>

            <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
                <Row className="m-2">
                    <Col xs={12} md={12} lg={12}>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                                <div>
                                    <h1 className="mb-1">Horas extra</h1>
                                    <p className="text-muted mb-0">
                                        Registra la información de la solicitud.
                                    </p>
                                </div>

                                <div className="d-flex flex-wrap gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={handleBack}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={isSubmitting || loading || !isDirty}
                                        onClick={() => reset(DEFAULT_VALUES)}
                                    >
                                        Limpiar
                                    </Button>

                                    <Button
                                        className="bg-success border-success"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Guardando..." : "Guardar"}
                                    </Button>
                                </div>
                            </div>

                            <Card className="rounded-4 shadow-sm border">
                                <Card.Body className="p-4 p-md-5">
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-1">Datos del empleado</h5>
                                        <p className="text-muted mb-3">
                                            Selecciona el empleado y describe el motivo.
                                        </p>

                                        <div className="mb-4">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <label className="fw-semibold">Empleado</label>

                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip id="tooltip-info">
                                                            Escribe el nombre del empleado que deseas seleccionar.
                                                        </Tooltip>
                                                    }
                                                >
                                                    <span style={{ cursor: "pointer" }}>
                                                        <i className="bi bi-info-circle-fill text-primary" />
                                                    </span>
                                                </OverlayTrigger>
                                            </div>

                                            <RelationField
                                                readonly={readInput}
                                                register={register("idEmployee", {
                                                    required: "El empleado es requerido",
                                                    validate: (value) =>
                                                        Number(value) > 0 || "El empleado es requerido",
                                                })}
                                                options={filteredEmployees.map((e) => ({
                                                    id: e.id!,
                                                    displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                                    name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                                }))}
                                                label=""
                                                callBackMode="id"
                                                control={control}
                                                invalid={!!errors.idEmployee}
                                                feedBack={errors.idEmployee?.message}
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <Entry
                                                register={register("motive",
                                                    { required: "El motivo es requerido" }
                                                )}
                                                label="Motivo"
                                                type="text"
                                                invalid={!!errors.motive}
                                                feedBack={errors.motive?.message}
                                                className="text-uppercase border"
                                            />
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-1">Fecha y horario</h5>
                                        <p className="text-muted mb-3">
                                            Indica cuándo inició y terminó la hora extra.
                                        </p>

                                        <Row className="g-4">
                                            <Col xs={12} md={4}>
                                                <Entry
                                                    register={register("date", {
                                                        required: "La fecha del evento es requerida",
                                                    })}
                                                    type="date"
                                                    label="Fecha del evento"
                                                    invalid={!!errors.date}
                                                    feedBack={errors.date?.message}
                                                    className="border"
                                                />
                                            </Col>

                                            <Col xs={12} md={4}>
                                                <Entry
                                                    register={register("hourInit", {
                                                        required: "La hora de inicio es requerida",
                                                    })}
                                                    type="time"
                                                    label="Hora de inicio"
                                                    invalid={!!errors.hourInit}
                                                    feedBack={errors.hourInit?.message}
                                                    className="border"
                                                />
                                            </Col>

                                            <Col xs={12} md={4}>
                                                <Entry
                                                    register={register("hourEnd", {
                                                        required: "La hora de fin es requerida",
                                                    })}
                                                    type="time"
                                                    label="Hora de fin"
                                                    invalid={!!errors.hourEnd}
                                                    feedBack={errors.hourEnd?.message}
                                                    className="border"
                                                />
                                            </Col>
                                        </Row>
                                    </div>

                                    <hr className="my-4" />

                                    <div>
                                        <h5 className="fw-semibold mb-1">Firma</h5>
                                        <p className="text-muted mb-3">
                                            Agrega la firma para confirmar el registro.
                                        </p>

                                        <div className="w-100 overflow-hidden">
                                            <SignatureInput
                                                name="signature"
                                                register={register}
                                                control={control}
                                            />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Form>
                    </Col>
                </Row>
            </Container >
        </>
    );
}
