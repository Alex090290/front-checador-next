"use client"

import { DeviceType, IDevices } from "@/lib/devices/interface"
import { Button, Card, Container } from "react-bootstrap";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FeedbackState = "loading" | "success" | "error" | null;

type ModalAction = {
    device: IDevices;
    idDevice: number;
}

function typeDevice(type: DeviceType | null) {
    switch ((type ?? "")) {
        case "computadora":
            return (
                <span>una computadora </span>
            )
        case "laptop":
            return (
                <span>una laptop </span>
            )
    }
}

function formatLabel(value: string) {
    return value
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .trim();
}

export default function ResposiveDoc({
    device,
    idDevice,
}: ModalAction) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");


    const handleBack = () => {
        setFeedback("loading");
        setFeedbackMsg("Cargando datos...");

        setTimeout(() => {
            router.back();
        }, 100);
    }



    //INFO NECESARIA
    const marca = device.specs?.brand;
    const type = device?.type;
    const modelo = device.specs?.model;
    const numero_serie = device.specs?.serialNumber;
    const procesador = device.specs?.processor;
    const ram = device.specs?.ram;
    const almacenamiento = device.specs?.storage;
    const sistema_operativo = String(device.specs?.os);
    const macVlan1 = device.networkInfo.filter((m) => m.vlan === "1").map((m) => m.mac).join(", ");
    const macVlan20 = device.networkInfo.filter((m) => m.vlan === "20").map((m) => m.mac).join(", ");
    const macs = device.networkInfo.map((m) => m.mac).join(", ");
    const number = device.name //CAMBIAR A NUMERO DE CELULAR
    const isPhone = device.type === "telefono_ip" || device.type === "celular";

    return (
        <Container className="py-3 overflow-x: auto" style={{ maxWidth: "1600px" }}>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                {/* Izquierda */}
                <div className="d-flex gap-2 flex-wrap">

                    {/* <OverLay string="Crear dispositivo">
                        <Button
                            className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                            variant="primary"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            <i className="bi bi-plus-lg" />

                            <span className="d-none d-md-inline ms-2">
                                Crear Dispositivo
                            </span>
                        </Button>
                    </OverLay> */}

                    {/* <OverLay string="Actualizar Departamento">
                        <Button
                            className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3"
                            variant="primary"
                            onClick={() => setUpdateDeviceModal(true)}
                            disabled={loading}
                        >
                            <i className="bi bi-pencil" />

                            <span className="d-none d-md-inline ms-2">
                                Actualizar Dispositivo
                            </span>
                        </Button>
                    </OverLay> */}
                </div>

                {/* Derecha */}
                <div className=" d-md-flex flex-wrap">
                    <Button
                        variant="outline-secondary"
                        onClick={handleBack}
                        disabled={loading}
                        className="d-inline-flex align-items-center gap-2 fw-semibold px-2 px-md-3"
                    >
                        <i className="bi bi-arrow-left" />
                        Regresar
                    </Button>
                </div>
            </div>

            {/* <div className="no-print d-flex justify-content-center mb-3">
                <Button variant="warning" >
                    <i className="bi bi-printer me-2" />
                    Imprimir / Guardar como PDF
                </Button>
            </div> */}

            <div className="responsiva-wrapper">
                {/* LOGO AQUÍ */}
                <div className="responsiva-page">

                    <div className="responsiva-logo">
                        <Image
                            src="/image/logo.png"
                            alt=""
                            width={160}
                            height={90}
                            style={{ objectFit: "contain" }}
                        />
                    </div>

                    <h1 className="responsiva-title mt-2">CARTA RESPONSIVA</h1>

                    <p className="responsiva-text">
                        Por medio de la presente que suscribe declara recibir como herramienta de trabajo {typeDevice(type)}
                        que contiene las siguientes características:
                        marca {marca}, modelo {modelo}, numero de serie {numero_serie}, procesador {procesador}, {ram} de RAM,
                        {almacenamiento} de almacenamiento, sistema operativo {formatLabel(sistema_operativo)} con MAC de {macs}
                        {macVlan1 ? ` con VLAN 1 ${macVlan1}` : " "}
                        {macVlan20 ? ` con VLAN 20 ${macVlan20}` : " "}
                        {isPhone ? `y número Telcel: ${number}` : ""}.
                    </p>

                    <p className="responsiva-text">
                        Comprometiéndose a mantenerlo en el estado en el que lo recibe, cuidando dicho material como si el mismo fuera
                        de su propiedad, en el entendido de que en caso de que el mismo sufra cualquier daño ocasionado por su dolo o
                        negligencia se hará responsable de la reparación del mismo. En caso de que, por causas inherentes al uso o
                        desgaste normales del equipo, el mismo requiera cualquier reparación, el que suscribe notificará tal circunstancia a
                        la empresa para que la misma le indique las condiciones en las que las reparaciones o trabajo de mantenimiento
                        sobre el mismo habrán de realizarse.
                    </p>

                    <p className="responsiva-text">
                        El suscriptor de este documento reconoce que el equipo que se le entrega solo podrá ser utilizado para cumplir las
                        tareas que le encomienda la empresa en calidad de patrón y que no podrá hacer uso del mismo para cuestiones de
                        carácter personal. Asimismo, se compromete a emplear el equipo únicamente de acuerdo con las condiciones y
                        especificaciones que para dichos efectos haga de su conocimiento la empresa, obligándose a no modificarlo ni el
                        hardware ni el software, es decir no agregar ni suprimir ningún programa de los que se encuentren cargados
                        originalmente sin el expreso consentimiento por escrito de la empresa.
                    </p>

                    <p className="responsiva-text">
                        El que suscribe reconoce que los derechos sobre el equipo objeto de la presente corresponden exclusivamente a
                        Gama Consumibles Especiales S. de R.L. de C.V. en términos del contrato que tiene celebrado con el proveedor del
                        mismo por lo que a la simple solicitud de la empresa se obliga a devolver el equipo que se le entrega a la firma del
                        presente y, en todo caso, al terminar su relación laboral con la compañía dejará de utilizar el mismo haciendo
                        entrega de él al personal que se le indique en el mismo estado en que lo haya recibido, salvo deterioro debido al
                        uso normal del equipo.
                    </p>

                    <p className="responsiva-text responsiva-fecha">
                        {/* lugar y fecha */}
                    </p>

                    <div className="responsiva-firmas">
                        <div className="firma-box">
                            <div className="firma-linea" />
                            <span>{/* nombre empleado */}</span>
                            <span className="firma-label">Empleado</span>
                        </div>

                        <div className="firma-box">
                            <div className="firma-linea" />
                            <span>Gama Consumibles Especiales S. de R.L. de C.V.</span>
                            <span className="firma-label">Empresa</span>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}