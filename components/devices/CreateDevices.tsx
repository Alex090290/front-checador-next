"use client"

import { IDevices } from "@/lib/devices/interface"
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModals } from "@/context/ModalContext";
import { Button, Card, Col, Container, Dropdown, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { Entry, FieldSelect } from "../fields";

type FeedbackState = "loading" | "success" | "error" | null;

const DEFAULT_VALUES: Partial<IDevices> = {
    name: "",
    type: null,
    status: "activo",
    networkInfo: [],
    specs: {
        brand: "",
        model: "",
        serialNumber: "",
        processor: "",
        ram: "",
        storage: "",
        os: "",
        osVersion: "",
        purchaseDate: "",
        warrantyExpiration: "",
    },
    currentAssignment: {
        id: null,
        idEmployee: null,
        idBranch: null,
        idDepartment: null,
        location: "",
        signatures: [],
        assignedAt: "",
    },
    idIt: null,
    notes: ""
};

export default function CreateDeviceComponent({
    devices
}: {
    devices: IDevices[];
}) {
    const {
        register,
        reset,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<IDevices>({
        defaultValues: DEFAULT_VALUES,
    });

    //CONST
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    console.log("devices:", devices.map((t) => t.type));

    //HELPERS

    const handleBack = () => {
        setFeedback("loading");
        setFeedbackMsg("Cargando...");
        router.push("/app/devices");
    };

    return (
        <>
            {/* Loading */}
            <ConditionalRender cond={feedback === "loading" || isSubmitting}>
                <Loading message={feedbackMsg || "Guardando..."} />
            </ConditionalRender>

            {/* Éxito — redirige al terminar la animación */}
            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => {
                        setFeedback(null);
                        router.push("/app/overtime");
                    }}
                />
            </ConditionalRender>

            {/* Error — solo cierra el overlay */}
            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <Container className="justify-content-between" style={{ maxWidth: "1200px" }}>
                <Row className="m-2">
                    <Col xs={12}>
                        {/* <Form onSubmit={handleSubmit(onSubmit)}> */}
                        <fieldset disabled={isSubmitting}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                                <div>
                                    <h1 className="mb-1">Dispositivos</h1>
                                    <p className="text-muted mb-0">
                                        Registra la información del nuevo dispositivo.
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
                                        disabled={isSubmitting || feedback === "loading" || !isDirty}
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


                            {/* CUERPO */}
                            <Card className="rounded-4 shadow-sm mb-3">
                                <Card.Body className="p-3 p-md-5">
                                    <div className="mb-4">
                                        <h5 className="fw-semibold mb-1">Datos generales</h5>
                                        <p className="text-muted mb-3">
                                            Captura los datos generales y específicos del dispositivo.
                                        </p>
                                    </div>

                                    <Card className="border rounded-4 mb-3">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                <i className="bi bi-laptop text-primary" />
                                                <h6 className="mb-0 fw-bold">Datos básicos</h6>
                                            </div>

                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Entry
                                                        register={register("name", { required: "El nombre es requerido" })}
                                                        label={"Nombre del dispositivo:"}
                                                        type="string"
                                                        invalid={!!errors.name}
                                                        feedBack={errors.name?.message}
                                                        className="border text-uppercase"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <FieldSelect
                                                        register={register("type", {
                                                            required: "Este campo es requerido",
                                                        })}
                                                        options={[
                                                            { value: "computadora", label: "COMPUTADORA" },
                                                            { value: "laptop", label: "LAPTOP" },
                                                            { value: "impresora", label: "IMPRESORA" },
                                                            { value: "servidor", label: "SERVIDOR" },
                                                            { value: "switch", label: "SWITCH" },
                                                            { value: "router", label: "ROUTER" },
                                                            { value: "telefono_ip", label: "TELEFONO IP" },
                                                            { value: "camara", label: "CAMARA" },
                                                            { value: "access_point", label: "ACCESS POINT" },
                                                            { value: "celular", label: "CELULAR" },
                                                            { value: "television", label: "TELEVISIÓN" },
                                                            { value: "otro", label: "OTRO" },
                                                        ]}
                                                        label="Tipo:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <FieldSelect
                                                        register={register("status", {
                                                            required: "El status es requerido",
                                                        })}
                                                        options={[
                                                            { value: "activo", label: "ACTIVO" },
                                                            { value: "inactivo", label: "INACTIVO" }
                                                        ]}
                                                        label="Estatus"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Card.Body>
                            </Card>
                        </fieldset>
                        {/* </Form> */}
                    </Col>
                </Row>
            </Container>

        </>
    )
}