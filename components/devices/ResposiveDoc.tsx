"use client"

import { DeviceType, IDevices } from "@/lib/devices/interface"
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import moment from "moment-timezone";
import SignatureEmployeeModal from "./SignatureEmployeeModal";
import SignatureITModal from "./SignatureITModal";
import ConditionalRender from "../ConditionalRender";
import SignatureDevicewOne from "./SignaturesDeviceView";
import SignatureDevicewTwo from "./SignatureDevicewTwo";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useModals } from "@/context/ModalContext";
import { getFirstDoc, getSecondDoc } from "@/app/actions/devices-actions";
import SignatureDeviceThree from "./SignatureDeviceThree";
import SignatureEmployeeModalTwo from "./SignatureEmployeeModalTwo";
import SignatureITModalTwo from "./SignatureITModalTwo";

moment.locale("es");

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
        case "celular":
            return (
                <span>un celular </span>
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
}: ModalAction) {
    const router = useRouter();
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const { modalConfirm } = useModals();

    const dia = device.currentAssignment?.assignedAt
        ? moment.utc(device.currentAssignment.assignedAt, "YYYY-MM-DD").format("DD")
        : "--";

    const mes = device.currentAssignment?.assignedAt
        ? moment.utc(device.currentAssignment.assignedAt, "YYYY-MM-DD").format("MMMM")
        : "--";

    const anio = device.currentAssignment?.assignedAt
        ? moment.utc(device.currentAssignment.assignedAt, "YYYY-MM-DD").format("YYYY")
        : "--";

    const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

    const fechaActual = `${dia} de ${mesCapitalizado} de ${anio}`;

    const [signatureEmployee, setSignatureEmployee] = useState(false);
    const [signatureEmployeeTwo, setSignatureEmployeeTwo] = useState(false);
    const [signatureIt, setSignatureIt] = useState(false);
    const [signatureItTwo, setSignatureItTwo] = useState(false);
    const [completeSignatures, setCompleteSignatures] = useState(false);
    const [signaturesOneComplete, setSignaturesOneComplete] = useState(false);
    const [showSecondSignatures, setShowSecondSignatures] = useState(false);

    //INFO NECESARIA
    const marca = device.specs?.brand;
    const type = device?.type;
    const modelo = device.specs?.model;
    const numero_serie = device.specs?.serialNumber;
    const procesador = device.specs?.processor;
    const ram = device.specs?.ram;
    const almacenamiento = device.specs?.storage;
    const sistema_operativo = String(device.specs?.os);

    const isVLAN1 = device.networkInfo.filter((v => v.vlan === "1"))
    const isVLAN20 = device.networkInfo.filter((v => v.vlan === "20"))
    const macVlan1 = device.networkInfo.filter((m) => m.vlan === "1").map((m) => m.mac).join(", ");
    const macVlan20 = device.networkInfo.filter((m) => m.vlan === "20").map((m) => m.mac).join(", ");
    const number = device.currentAssignment?.phoneNumber?.nationalNumber
    const isPhone = device.type === "telefono_ip" || device.type === "celular";
    const hasNotes = device.specs?.currentStatus ?? "";

    const isSignatureComplete = (label: string) => {
        const matches = device.currentAssignment?.signatures?.filter((l) => l.label === label) ?? [];
        return matches.length > 0 && matches.every((f) => f.url);
    };

    //PARA FIRMAS
    const firstSignatureEmployee = isSignatureComplete("Empleado - Recibido");
    const firstSignatureIt = isSignatureComplete("IT - Entregado");

    const secondSignatureEmployee = isSignatureComplete("Empleado - Entregado");
    const secondSignatureIt = isSignatureComplete("IT - Recibido");

    const firmaUno = device.currentAssignment?.signatures?.find((m) => m.label === "Empleado - Recibido");
    const firmaDos = device.currentAssignment?.signatures?.find((m) => m.label === "IT - Entregado");

    const firmaTres = device.currentAssignment?.signatures?.find((m) => m.label === "Empleado - Entregado");
    const firmaCuatro = device.currentAssignment?.signatures?.find((m) => m.label === "IT - Recibido");

    const handleSignatureEmployee = () => setSignatureEmployee(true);
    const handleSignatureIt = () => setSignatureIt(true);

    const handleSignatureEmployeeTwo = () => setSignatureEmployeeTwo(true);
    const handleSignatureItTwo = () => setSignatureItTwo(true);


    const handleBack = () => {
        setFeedback("loading");
        setFeedbackMsg("Cargando datos...");

        setTimeout(() => {
            router.push(`/app/devices?view_type=form&id=${device.id}`);
        }, 100);
    };

    useEffect(() => {
        if (device.currentAssignment === null) {

            setFeedback("loading");
            setFeedbackMsg("Cargando datos...");
            setTimeout(() => {
                router.push(`/app/devices?view_type=historial&id=${device.id}`);
            }, 100);
        }
    }, [device, router])

    useEffect(() => {
        const oneComplete = firstSignatureEmployee && firstSignatureIt;
        const allComplete = oneComplete && secondSignatureEmployee && secondSignatureIt;

        setSignaturesOneComplete(oneComplete);
        setCompleteSignatures(allComplete);
    }, [firstSignatureEmployee, firstSignatureIt, secondSignatureEmployee, secondSignatureIt]);

    const downloadBase64File = (base64Url: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = base64Url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleGenerate = async () => {
        modalConfirm("Se descargará el PDF", async () => {

            const fetchDoc = completeSignatures
                ? getSecondDoc
                : signaturesOneComplete
                    ? getFirstDoc
                    : null;

            if (!fetchDoc) return;

            try {
                setFeedback("loading");
                setFeedbackMsg("Descargando PDF...");

                const res = await fetchDoc({ idDoc: device.id });

                if (!res.success || !res.data) {
                    setFeedbackMsg(res.message || "No se pudo generar el reporte");
                    setFeedback("error");
                    return;
                }

                const { base64Url, fileName } = res.data;
                downloadBase64File(base64Url, fileName);

                setFeedbackMsg("PDF descargado correctamente");
                setFeedback("success");

            } catch {
                setFeedbackMsg("Error inesperado al generar el PDF");
                setFeedback("error");
            }
        });
    };



    return (
        <>
            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Cargando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => {
                        setFeedback(null);
                    }}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <Container className="py-3" style={{ maxWidth: "1600px" }}>

                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <div className="d-flex gap-2 flex-wrap">

                    </div>


                    <div className=" d-md-flex flex-wrap">
                        <Button
                            variant="outline-secondary"
                            onClick={handleBack}
                            disabled={feedback === "loading"}
                            className="d-inline-flex align-items-center gap-2 fw-semibold px-2 px-md-3"
                        >
                            <i className="bi bi-arrow-left" />
                            Regresar
                        </Button>
                    </div>
                </div>

                <div className="mb-3 mx-auto" style={{ maxWidth: "1200px" }}>
                    <h1 className="mb-1 ms-1">Carta Responsiva</h1>
                    <p className="text-muted mb-0 ms-1">
                        Información del dispositivo y condiciones de entrega.
                    </p>
                </div>

                <Card className="border shadow-sm rounded-4 mx-auto" style={{ maxWidth: "1200px" }}>
                    <Card.Body className="p-4">

                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <Image
                                    src="/image/logo.png"
                                    alt=""
                                    width={150}
                                    height={68}
                                    style={{ objectFit: "contain" }}
                                />
                                <h5 className="mb-0 fw-bold">Carta Responsiva</h5>
                            </div>

                            <span className="badge rounded-pill px-3 py-2 fw-semibold bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                Responsiva
                            </span>
                        </div>

                        <Card className="border rounded-0 mb-4">
                            <Card.Body>
                                <div className="d-flex flex-column gap-4 text-justify" style={{ lineHeight: 1.7, textAlign: "justify" }}>

                                    <p className="mb-0">
                                        Por medio de la presente que suscribe declara recibir como herramienta de trabajo{" "}
                                        <strong>{typeDevice(type)}</strong>, mismo que cuenta con las siguientes características:
                                        marca <strong>{marca}</strong>, modelo <strong>{modelo}</strong>, número de serie{" "}
                                        <strong>{numero_serie}</strong>, procesador <strong>{procesador}</strong>,{" "}
                                        <strong>{ram}</strong> de RAM, <strong>{almacenamiento}</strong> de almacenamiento,
                                        sistema operativo <strong>{formatLabel(sistema_operativo)}</strong>
                                        <ConditionalRender cond={isVLAN1.length > 0}>
                                            <>, con VLAN 1 de MAC <strong>{macVlan1}</strong></>
                                        </ConditionalRender>
                                        <ConditionalRender cond={isVLAN20.length > 0}>
                                            <>, con VLAN 20 de MAC <strong>{macVlan20}</strong></>
                                        </ConditionalRender>
                                        <ConditionalRender cond={isPhone !== false}>
                                            <>, y número Telcel: <strong>{number}</strong></>
                                        </ConditionalRender>

                                        <ConditionalRender cond={hasNotes !== ""}>
                                            <>, <strong>{hasNotes}.</strong></>
                                        </ConditionalRender>
                                    </p>

                                    <p className="mb-0">
                                        Comprometiéndose a mantenerlo en el estado en el que lo recibe, cuidando dicho material como si el mismo fuera
                                        de su propiedad, en el entendido de que en caso de que el mismo sufra cualquier daño ocasionado por su dolo o
                                        negligencia se hará responsable de la reparación del mismo. En caso de que, por causas inherentes al uso o
                                        desgaste normales del equipo, el mismo requiera cualquier reparación, el que suscribe notificará tal circunstancia a
                                        la empresa para que la misma le indique las condiciones en las que las reparaciones o trabajo de mantenimiento
                                        sobre el mismo habrán de realizarse.
                                    </p>

                                    <p className="mb-0">
                                        El suscriptor de este documento reconoce que el equipo que se le entrega solo podrá ser utilizado para cumplir las
                                        tareas que le encomienda la empresa en calidad de patrón y que no podrá hacer uso del mismo para cuestiones de
                                        carácter personal. Asimismo, se compromete a emplear el equipo únicamente de acuerdo con las condiciones y
                                        especificaciones que para dichos efectos haga de su conocimiento la empresa, obligándose a no modificarlo ni el
                                        hardware ni el software, es decir no agregar ni suprimir ningún programa de los que se encuentren cargados
                                        originalmente sin el expreso consentimiento por escrito de la empresa.
                                    </p>

                                    <p className="mb-0">
                                        El que suscribe reconoce que los derechos sobre el equipo objeto de la presente corresponden exclusivamente a
                                        Gama Consumibles Especiales S. de R.L. de C.V. en términos del contrato que tiene celebrado con el proveedor del
                                        mismo por lo que a la simple solicitud de la empresa se obliga a devolver el equipo que se le entrega a la firma del
                                        presente y, en todo caso, al terminar su relación laboral con la compañía dejará de utilizar el mismo haciendo
                                        entrega de él al personal que se le indique en el mismo estado en que lo haya recibido, salvo deterioro debido al
                                        uso normal del equipo.
                                    </p>

                                    <p className="mb-0 text-end">
                                        Tlaquepaque, Jal. a <strong>{fechaActual}</strong>
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="border rounded-4">
                            <Card.Body>
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-pen text-warning" />
                                    <h6 className="mb-0 fw-bold">Firmas</h6>
                                </div>

                                <Row className="g-3">
                                    {/* FIRMA UNO EMPLEADO */}
                                    <Col xs={12} md={6}>
                                        <div className="border rounded-3 p-3 d-flex flex-column align-items-center gap-2 text-center h-100 w-100">
                                            <span className="fw-semibold text-capitalize">{device.employee?.name} {device.employee?.lastName}</span>
                                            <span className="text-muted small">Empleado</span>

                                            <ConditionalRender cond={!firstSignatureEmployee}>
                                                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-2">
                                                    <div>
                                                        <i
                                                            className="bi bi-hourglass-split text-danger icon-hourglass-animated"
                                                            style={{ fontSize: "2rem" }}
                                                        />
                                                        <p className="text-danger mb-0"> Esperando firma del empleado</p>
                                                    </div>

                                                    <Button
                                                        className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3 btn-needs-signature mt-3"
                                                        variant="success"
                                                        onClick={handleSignatureEmployee}
                                                    >
                                                        <i className="bi bi-check-circle" />
                                                        <span className="d-none d-md-inline ms-2">Firmar</span>
                                                    </Button>
                                                </div>
                                            </ConditionalRender>

                                            {/* FIX 2: era `firmaUno !== null` — .find() regresa undefined, no null,
                                                así que esa condición era SIEMPRE true. Se cambia a chequeo explícito. */}
                                            <ConditionalRender cond={firstSignatureEmployee}>
                                                <Row className="g-3 w-100">
                                                    <ConditionalRender cond={!!firmaUno}>
                                                        <SignatureDevicewOne
                                                            key={`${firmaUno?.id}-${firmaUno?.url}`}
                                                            idDevice={Number(device.id)}
                                                            idEmployee={Number(firmaUno?.idSignatory)}
                                                            idSignature={Number(firmaUno?.id)}
                                                            status={String(firmaUno?.status)}
                                                            dateSigner={String(firmaUno?.dateSigner)}
                                                            label={firmaUno?.label}
                                                        />
                                                    </ConditionalRender>
                                                </Row>
                                            </ConditionalRender>
                                        </div>
                                    </Col>

                                    {/* FIRMA UNO IT */}
                                    <Col xs={12} md={6}>
                                        <div className="border rounded-3 p-3 d-flex flex-column align-items-center gap-2 text-center h-100">
                                            <span className="fw-semibold text-capitalize">{device.personIt?.name} {device.personIt?.lastName}</span>
                                            <span className="text-muted small">Persona IT</span>

                                            <ConditionalRender cond={!firstSignatureIt}>
                                                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-2">
                                                    <div>
                                                        <i
                                                            className="bi bi-hourglass-split text-danger icon-hourglass-animated"
                                                            style={{ fontSize: "2rem" }}
                                                        />
                                                        <p className="text-danger mb-0"> Esperando firma de IT</p>
                                                    </div>
                                                    <Button
                                                        className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3 btn-needs-signature mt-3"
                                                        variant="info"
                                                        onClick={handleSignatureIt}
                                                    >
                                                        <i className="bi bi-check-circle" />
                                                        <span className="d-none d-md-inline ms-2">Firmar</span>
                                                    </Button>
                                                </div>
                                            </ConditionalRender>

                                            <ConditionalRender cond={firstSignatureIt}>
                                                <Row className="g-3 w-100">
                                                    <ConditionalRender cond={!!firmaDos}>
                                                        <SignatureDevicewTwo
                                                            key={`${firmaDos?.id}-${firmaDos?.url}`}
                                                            idDevice={Number(device.id)}
                                                            idEmployee={Number(firmaDos?.idSignatory)}
                                                            idSignature={Number(firmaDos?.id)}
                                                            status={String(firmaDos?.status)}
                                                            dateSigner={String(firmaDos?.dateSigner)}
                                                            label={firmaDos?.label}
                                                        />
                                                    </ConditionalRender>
                                                </Row>
                                            </ConditionalRender>
                                        </div>
                                    </Col>
                                </Row>

                                <ConditionalRender cond={showSecondSignatures === true || completeSignatures === true}>
                                    <Row className="g-3 mt-2">
                                        {/* FIRMA DOS EMPLEADO */}
                                        <Col xs={12} md={6}>
                                            <div className="border rounded-3 p-3 d-flex flex-column align-items-center gap-2 text-center h-100 w-100">
                                                <span className="fw-semibold text-capitalize">{device.employee?.name} {device.employee?.lastName}</span>
                                                <span className="text-muted small">Empleado</span>

                                                <ConditionalRender cond={!secondSignatureEmployee}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-2">
                                                        <div>
                                                            <i
                                                                className="bi bi-hourglass-split text-danger icon-hourglass-animated"
                                                                style={{ fontSize: "2rem" }}
                                                            />
                                                            <p className="text-danger mb-0"> Esperando firma del empleado</p>
                                                        </div>

                                                        <Button
                                                            className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3 btn-needs-signature mt-3"
                                                            variant="success"
                                                            onClick={handleSignatureEmployeeTwo}
                                                        >
                                                            <i className="bi bi-check-circle" />
                                                            <span className="d-none d-md-inline ms-2">Firmar</span>
                                                        </Button>
                                                    </div>
                                                </ConditionalRender>

                                                <ConditionalRender cond={secondSignatureEmployee}>
                                                    <Row className="g-3 w-100">
                                                        <ConditionalRender cond={!!firmaTres}>
                                                            <SignatureDeviceThree
                                                                key={`${firmaTres?.id}-${firmaTres?.url}`}
                                                                idDevice={Number(device.id)}
                                                                idEmployee={Number(firmaTres?.idSignatory)}
                                                                idSignature={Number(firmaTres?.id)}
                                                                status={String(firmaTres?.status)}
                                                                dateSigner={String(firmaTres?.dateSigner)}
                                                                label={firmaTres?.label}
                                                            />
                                                        </ConditionalRender>
                                                    </Row>
                                                </ConditionalRender>
                                            </div>
                                        </Col>

                                        {/* FIRMA DOS DE IT */}
                                        <Col xs={12} md={6}>
                                            <div className="border rounded-3 p-3 d-flex flex-column align-items-center gap-2 text-center h-100">
                                                <span className="fw-semibold text-capitalize">{device.personIt?.name} {device.personIt?.lastName}</span>
                                                <span className="text-muted small">Persona IT</span>

                                                <ConditionalRender cond={!secondSignatureIt}>
                                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center gap-2">
                                                        <div>
                                                            <i
                                                                className="bi bi-hourglass-split text-danger icon-hourglass-animated"
                                                                style={{ fontSize: "2rem" }}
                                                            />
                                                            <p className="text-danger mb-0"> Esperando firma de IT</p>
                                                        </div>
                                                        <Button
                                                            className="d-inline-flex align-items-center justify-content-center fw-semibold px-2 px-md-3 btn-needs-signature mt-3"
                                                            variant="info"
                                                            onClick={handleSignatureItTwo}
                                                        >
                                                            <i className="bi bi-check-circle" />
                                                            <span className="d-none d-md-inline ms-2">Firmar</span>
                                                        </Button>
                                                    </div>
                                                </ConditionalRender>

                                                <ConditionalRender cond={secondSignatureIt}>
                                                    <Row className="g-3 w-100">
                                                        <ConditionalRender cond={!!firmaCuatro}>
                                                            <SignatureDevicewTwo
                                                                key={`${firmaCuatro?.id}-${firmaCuatro?.url}`}
                                                                idDevice={Number(device.id)}
                                                                idEmployee={Number(firmaCuatro?.idSignatory)}
                                                                idSignature={Number(firmaCuatro?.id)}
                                                                status={String(firmaCuatro?.status)}
                                                                dateSigner={String(firmaCuatro?.dateSigner)}
                                                                label={firmaCuatro?.label}
                                                            />
                                                        </ConditionalRender>
                                                    </Row>
                                                </ConditionalRender>
                                            </div>
                                        </Col>
                                    </Row>
                                </ConditionalRender>
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-end gap-2 mt-4">

                            <ConditionalRender cond={signaturesOneComplete}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowSecondSignatures(true)}
                                    disabled={showSecondSignatures === true || completeSignatures === true}
                                >
                                    Regresar equipo
                                </Button>
                            </ConditionalRender>


                            <Button
                                variant="warning"
                                disabled={!signaturesOneComplete && !completeSignatures}
                                onClick={handleGenerate}
                            >
                                <i className="bi bi-printer me-2" />
                                {completeSignatures ? "Descargar PDF de liberación" : "Descargar carta responsiva"}
                            </Button>
                        </div>

                    </Card.Body>
                </Card>

                <SignatureEmployeeModal
                    show={signatureEmployee}
                    onHide={() => setSignatureEmployee(false)
                    }
                    idDevice={device.id}
                    idEmployee={Number(device.employee?.id)}
                    idSignature={
                        device.currentAssignment?.signatures?.find((s) => s.label === "Empleado - Recibido")?.id ?? 0
                    }
                />

                <SignatureEmployeeModalTwo
                    show={signatureEmployeeTwo}
                    onHide={() => setSignatureEmployeeTwo(false)
                    }
                    idDevice={device.id}
                    idEmployee={Number(device.employee?.id)}
                    idSignature={
                        device.currentAssignment?.signatures?.find((s) => s.label === "Empleado - Entregado")?.id ?? 0
                    }
                />

                <SignatureITModal
                    show={signatureIt}
                    onHide={() => setSignatureIt(false)
                    }
                    idDevice={device.id}
                    idIt={Number(device.personIt?.id ?? 0)}
                    idSignature={
                        device.currentAssignment?.signatures?.find((s) => s.label === "IT - Entregado")?.id ?? 0
                    }
                />

                <SignatureITModalTwo
                    show={signatureItTwo}
                    onHide={() => setSignatureItTwo(false)
                    }
                    idDevice={device.id}
                    idIt={Number(device.personIt?.id ?? 0)}
                    idSignature={
                        device.currentAssignment?.signatures?.find((s) => s.label === "IT - Recibido")?.id ?? 0
                    }
                />
            </Container>
        </>
    );
}