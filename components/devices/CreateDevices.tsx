"use client"

import { IDevices } from "@/lib/devices/interface"
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useFieldArray, useForm } from "react-hook-form";
import { Entry, FieldSelect, RelationField } from "../fields";
import { add } from "date-fns";
import { Employee } from "@/lib/definitions";

type FeedbackState = "loading" | "success" | "error" | null;

const DEFAULT_VALUES: Partial<IDevices> = {
    name: "",
    type: null,
    status: "activo",
    networkInfo: [{
        mac: "",
        ip: "",
        description: "",
        hostname: "",
        gateway: "",
        dns: [""],
        vlan: "",
        port: "",
    }],
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
    devices,
    employees
}: {
    devices: IDevices[];
    employees: Employee[];
}) {
    const {
        register,
        reset,
        control,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<IDevices>({
        defaultValues: DEFAULT_VALUES,
    });

    //CONST
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [addEmployee, setAddEmployee] = useState(false);
    const router = useRouter();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "networkInfo",
    });


    //HELPERS
    const handleBack = () => {
        setFeedback("loading");
        setFeedbackMsg("Cargando...");
        router.push("/app/devices");
    };

    const handleOpen = () => {
        setAddEmployee(true);
    }


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

                                    {/* DATOS BASICOS */}
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
                                                            { value: "inactivo", label: "INACTIVO" },
                                                            { value: "en_reparacion", label: "EN REPARACIÓN" },
                                                            { value: "baja", label: "BAJA" },
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

                                    {/* DATOS ESPECIFICOS */}
                                    <Card className="border rounded-4 mb-3">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                <i className="bi bi-cpu text-primary" />
                                                <h6 className="mb-0 fw-bold">Datos específicos</h6>
                                            </div>

                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.brand", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Marca:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.model", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Marca:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>


                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.serialNumber", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Número de serie:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.processor", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Procesador:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.ram", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Ram:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.storage", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Almacenamiento:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.os", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Os:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.osVersion", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Versión os:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.purchaseDate", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Fecha de compra:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Entry
                                                        register={register("specs.warrantyExpiration", {
                                                            required: "Campo requerido"
                                                        })}
                                                        label="Fecha de expiración de garantía:"
                                                        invalid={!!errors.type}
                                                        feedBack={errors.type?.message}
                                                        className="text-uppercase border"
                                                    />
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    {/* NETWORK INFO */}
                                    <Card className="border rounded-4 mb-3">
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-wifi text-primary" />
                                                    <h6 className="mb-0 fw-bold">Información de la red</h6>
                                                </div>

                                                <ConditionalRender cond={fields.length < 2}>
                                                    <Button
                                                        variant="outline-primary"
                                                        type="button"
                                                        onClick={() =>
                                                            append({
                                                                mac: "",
                                                                ip: "",
                                                                description: "",
                                                                hostname: "",
                                                                gateway: "",
                                                                dns: [],
                                                                vlan: "",
                                                                port: "",
                                                            })
                                                        }
                                                    >
                                                        <i className="bi bi-plus-circle me-1" />
                                                        Agregar red
                                                    </Button>
                                                </ConditionalRender>
                                            </div>

                                            <ConditionalRender cond={fields.length === 0}>
                                                <div className="text-center">
                                                    <i className="bi bi-wifi-off text-danger"
                                                        style={{ fontSize: "3rem" }}
                                                    />
                                                </div>

                                                <p className="text-muted small mb-0 text-center">
                                                    No hay redes agregadas. Usa el botón de arriba para agregar una.
                                                </p>

                                            </ConditionalRender>

                                            {fields.map((field, index) => (
                                                <div key={field.id} className={index > 0 ? "border-top pt-3 mt-3" : ""}>
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="fw-semibold small text-muted">Red #{index + 1}</span>
                                                        <Button
                                                            variant="outline-danger"
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <i className="bi bi-trash" />
                                                        </Button>
                                                    </div>

                                                    <Row className="g-3">
                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.mac`)}
                                                                label="Mac:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.ip`)}
                                                                label="Ip:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.description`)}
                                                                label="Descripción:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.hostname`)}
                                                                label="Nombre de usuario (hostname):"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.gateway`)}
                                                                label="Gateway:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.dns`)}
                                                                label="Dns:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <FieldSelect
                                                                register={register(`networkInfo.${index}.vlan`)}
                                                                options={[
                                                                    { value: "1", label: "1" },
                                                                    { value: "20", label: "20" },
                                                                ]}
                                                                label="Vlan:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>

                                                        <Col md={6}>
                                                            <Entry
                                                                register={register(`networkInfo.${index}.port`)}
                                                                label="Puerto:"
                                                                className="text-uppercase border"
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ))}
                                        </Card.Body>
                                    </Card>

                                    {/* EMPLEADO ASIGNADO */}
                                    <Card className="border rounded-4 mb-3">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                <i className="bi bi-person-check text-primary" />
                                                <h6 className="mb-0 fw-bold">Empleado asignado</h6>
                                            </div>

                                            <Button
                                                variant="outline-primary"
                                                type="button"
                                                onClick={handleOpen}
                                            >
                                                <i className="bi bi-plus-circle me-1" />
                                                Agregar empleado asignado
                                            </Button>

                                            <ConditionalRender cond={addEmployee === true}>

                                                <Col md={6}>
                                                    <RelationField
                                                        options={employees.map((e) => ({
                                                            id: Number(e.id) || 0,
                                                            displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                                            name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                                        }))}
                                                        register={register("currentAssignment.idEmployee")}
                                                        control={control}
                                                        callBackMode="id"
                                                        label="Empleado relacionado:"
                                                    />
                                                </Col>
                                            </ConditionalRender>
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