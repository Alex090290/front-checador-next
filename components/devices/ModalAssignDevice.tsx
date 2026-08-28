import { Branch, Department, Employee, ModalBasicProps } from "@/lib/definitions";
import { IAssignDevice, IDevices } from "@/lib/devices/interface";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import SuccessOverlay from "../SuccessOverlay";
import ErrorOverlay from "../ErrorOverlay";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Form, Overlay, Row } from "react-bootstrap";
import { Entry, RelationField } from "../fields";
import { storeAction } from "@/app/actions/storeActions";
import DatePicker, { registerLocale } from "react-datepicker";
import moment from "moment";
import { es } from "date-fns/locale";
import { useModals } from "@/context/ModalContext";
import { AssignDevice } from "@/app/actions/devices-actions";

registerLocale("es", es);

type FeedbackState = "loading" | "success" | "error" | null;


type ModalAction = {
    idDevice: number;
    device:IDevices;
    employees: Employee[];
    branches: Branch[];
    departments: Department[]
}


export default function ModalAssignDevice({
    onHide,
    idDevice,
    device,
    employees,
    branches,
    departments
}: ModalBasicProps & ModalAction) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<IAssignDevice>({
        // defaultValues: ,
    });

    //CONST
    const [loading] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState("");
    const [feedback, setFeedback] = useState<FeedbackState>(null);
    const [dataSystem, setDataSystem] = useState<Employee[] | []>([]);
    const { modalConfirm } = useModals();

    //Fecha
    const dateButtonRef = useRef(null);
    const [dateError] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const selectedDate = watch("assignedAt"); // lee el valor actual del form state
    const parsedDate = selectedDate
        ? moment(selectedDate, "YYYY-MM-DD").toDate()
        : null;

    const handleDateChange = (date: Date | null) => {
        setValue("assignedAt", date ? moment(date).format("YYYY-MM-DD") : "", { shouldDirty: true });
    };


    const handleStaging = useCallback(async () => {
        const { ENVIROMENT, ID_DEV_SISTEM_STAGING, ID_DEV_SISTEM_PRODUCTION } = await storeAction();
        let idDevSistem = 0;

        if (ENVIROMENT === "staging") {
            idDevSistem = Number(ID_DEV_SISTEM_STAGING);
        } else if (ENVIROMENT === "production") {
            idDevSistem = Number(ID_DEV_SISTEM_PRODUCTION);
        }

        const dataFilter: Employee[] = employees.filter(
            (e: Employee) => e?.department?.id === idDevSistem
        );
        setDataSystem(dataFilter);
    }, [employees]);

    useEffect(() => {
        handleStaging();
    }, [handleStaging]);

    const onSubmit: SubmitHandler<IAssignDevice> = async (data) => {

        modalConfirm("¿Seguro que quieres guardar los cambios?", async () => {
            try {
                setFeedback("loading");
                setFeedbackMsg("Asignando dispositivo...");

                const res = await AssignDevice({
                    idDevice: idDevice,
                    data: {
                        idEmployee: data.idEmployee,
                        idIt: data.idIt,
                        idBranch: data.idBranch,
                        idDepartment: data.idDepartment,
                        location: data.location,
                        assignedAt: data.assignedAt,
                        phoneNumber: !data.phoneNumber ? null : String(data.phoneNumber).trim(),
                        extentionNumber: !data.extentionNumber ? null : String(data.extentionNumber).trim(),
                        emailCompany: !data.emailCompany ? null : String(data.emailCompany).trim(),
                        emailGmail: !data.emailGmail ? null : String(data.emailGmail).trim(),
                    }
                });

                if (!res.success) {
                    setFeedbackMsg(res.message || "No se pudo asignar");
                    setFeedback("error");
                    return;
                }

                setFeedbackMsg(res.message || "Asignado correctamente");
                setFeedback("success");
            } catch {
                setFeedbackMsg("Error inesperado, intenta de nuevo");
                setFeedback("error");
            }
        })
    };

    return (
        <>
            <ConditionalRender cond={loading || isSubmitting}>
                <Loading message={isSubmitting ? "Guardando..." : "Cargando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "loading"}>
                <Loading message={feedbackMsg || "Guardando..."} />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "success"}>
                <SuccessOverlay
                    message={feedbackMsg}
                    onDone={() => {
                        setFeedback(null);
                        onHide();
                    }}
                />
            </ConditionalRender>

            <ConditionalRender cond={feedback === "error"}>
                <ErrorOverlay
                    message={feedbackMsg}
                    onDone={() => setFeedback(null)}
                />
            </ConditionalRender>

            <div className="p-2">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h4 className="mb-1 fw-bold">Asignación de Empleado</h4>
                        <p className="text-muted mb-0">
                            Asigna éste dispositivo al empleado correspondiente.
                        </p>
                    </div>

                    <span className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle">
                        Asignar
                    </span>
                </div>


                <Form onSubmit={handleSubmit(onSubmit)}>

                    <Row className="g-3">
                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-person-check text-primary" />
                                        Empleado asignado
                                    </label>
                                    <RelationField
                                        options={employees.map((e) => ({
                                            id: Number(e.id) || 0,
                                            displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                            name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                        }))}
                                        register={register("idEmployee")}
                                        control={control}
                                        callBackMode="id"
                                        label=""
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-person-vcard-fill text-success" />
                                        Empleado asignante
                                    </label>
                                    <RelationField
                                        options={dataSystem.map((e) => ({
                                            id: Number(e.id) || 0,
                                            displayName: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                            name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                        }))}
                                        register={register("idIt")}
                                        control={control}
                                        callBackMode="id"
                                        label=""
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-building text-warning" />
                                        Sucursal relacionada
                                    </label>
                                    <RelationField
                                        options={branches.map((e) => ({
                                            id: Number(e.id) || 0,
                                            displayName: `${e.name?.toUpperCase()}` || "",
                                            name: `${e.name?.toUpperCase()}`,
                                        }))}
                                        register={register("idBranch")}
                                        control={control}
                                        callBackMode="id"
                                        label=""
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-columns-gap text-info" />
                                        Departamento relacionado
                                    </label>
                                    <RelationField
                                        options={departments.map((e) => ({
                                            id: Number(e.id) || 0,
                                            displayName: `${e.nameDepartment?.toUpperCase()}` || "",
                                            name: `${e.nameDepartment?.toUpperCase()}`,
                                        }))}
                                        register={register("idDepartment")}
                                        control={control}
                                        callBackMode="id"
                                        label=""
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-geo-alt-fill text-danger" />
                                        Locación
                                    </label>
                                    <Entry
                                        register={register("location", { required: "Este campo es requerido" })}
                                        label=""
                                        className="text-uppercase border"
                                        invalid={!!errors.location}
                                        feedBack={errors.location?.message}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>

                        <ConditionalRender cond={device.type === "celular"}>
                            <Col md={12}>
                                <Card className="border rounded-4">
                                    <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-phone text-primary" />
                                        Celular
                                    </label>
                                        <Entry
                                            register={register("phoneNumber", { required: false })}
                                            label=""
                                            invalid={!!errors.phoneNumber}
                                            className="border text-uppercase"
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </ConditionalRender>

                        <ConditionalRender cond={device.type === "telefono_ip"}>
                            <Col md={12}>
                                <Card className="border rounded-4">
                                    <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-telephone-plus text-secondary" />
                                         Extensión
                                    </label>
                                        <Entry
                                            register={register("extentionNumber", { required: false })}
                                            label=""
                                            invalid={!!errors.extentionNumber}
                                            className="border text-uppercase"
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </ConditionalRender>

                        <ConditionalRender cond={["computadora","laptop","celular"].includes(String(device.type))}>
                            <Col md={12}>
                                    <Card className="border rounded-4">
                                        <Card.Body>
                                        <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                            <i className="bi bi-envelope-at-fill text-secondary" />
                                            Correo Corporativo
                                        </label>
                                            <Entry
                                                register={register("emailCompany", { required: false })}
                                                label=""
                                                invalid={!!errors.emailCompany}
                                                className="border text-uppercase"
                                            />
                                        </Card.Body>
                                    </Card>
                            </Col>
                        </ConditionalRender>
                        
                        <ConditionalRender cond={["computadora","laptop","celular"].includes(String(device.type))}>
                                <Col md={12}>
                                        <Card className="border rounded-4">
                                            <Card.Body>
                                            <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                                <i className="bi bi-envelope-fill text-warning" />
                                                Correo Gmail
                                            </label>
                                                <Entry
                                                    register={register("emailGmail", { required: false })}
                                                    label=""
                                                    invalid={!!errors.emailGmail}
                                                    className="border text-uppercase"
                                                />
                                            </Card.Body>
                                        </Card>
                                </Col>
                            </ConditionalRender>

                        <Col md={12}>
                            <Card className="border rounded-4">
                                <Card.Body>
                                    <label className="d-flex align-items-center gap-2 mb-2 fw-bold">
                                        <i className="bi bi-calendar-date text-secondary" />
                                        Fecha de asignación
                                    </label>

                                    <Button
                                        ref={dateButtonRef}
                                        variant="outline-secondary"
                                        className={`w-100 d-flex align-items-center justify-content-between text-uppercase ${dateError ? "border-danger text-danger" : ""}`}
                                        onClick={() => setShowCalendar((s) => !s)}
                                    >
                                        <span>{selectedDate ? selectedDate : "Selecciona una fecha"}</span>
                                        <i className="bi bi-calendar3" />
                                    </Button>

                                    <ConditionalRender cond={!dateError}>
                                        <small className="text-danger d-block mt-1">{dateError}</small>
                                    </ConditionalRender>
                                    <Overlay
                                        target={dateButtonRef.current}
                                        show={showCalendar}
                                        placement="top-start"
                                        rootClose
                                        container={() => document.body}
                                        onHide={() => setShowCalendar(false)}
                                    >
                                        {({ ref, style }) => (
                                            <div
                                                ref={ref}
                                                style={style}
                                                className="date-multi-popover mt-2 shadow-lg rounded-4 overflow-hidden bg-light text-capitalize"
                                            >
                                                <DatePicker
                                                    inline
                                                    selected={parsedDate}
                                                    onChange={handleDateChange}
                                                    shouldCloseOnSelect={false}
                                                    disabledKeyboardNavigation
                                                    monthsShown={1}
                                                    locale="es"
                                                />
                                            </div>
                                        )}
                                    </Overlay>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Acciones */}
                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            disabled={isSubmitting || feedback === "loading"}
                            onClick={onHide}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="success"
                            type="submit"
                            disabled={isSubmitting || feedback === "loading"}
                        >
                            {isSubmitting || feedback === "loading" ? "Guardando..." : "Actualizar"}
                        </Button>
                    </div>

                </Form>
            </div>
        </>
    )

}