"use client";

//Imports de base
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

import { createConstancy, findConstancyByIdEmployee } from "@/app/actions/constancy-actions";
import { Employee } from "@/lib/definitions";
import { useModals } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FieldGroup } from "../templates/FormView";
import { Entry, RelationField, SignatureInput } from "../fields";
import { formatDate } from "date-fns";
import moment from "moment-timezone";
import { Constancy, typeOfPenalty } from "@/lib/constancy/interface";


const DEFAULT_VALUES: Constancy = {
    // _id: "",
    id: 0,
    idEmployee: 0,
    dateAndTimeOfTheEvents: "",
    dateTheEvents: "",
    hourTheEvents: "",
    sceneOfTheEvents: "",
    backgrounds: [],
    backgroundIds: [],
    typeOfPenalty: [],
    witness: 0,
    signature: "",
};

export default function CreateConstancyComponent({
    employees = [],
}: {
    employees?: Employee[];
}) {
    const {
        register,
        reset,
        control,
        setValue,
        watch,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<Constancy>({
        defaultValues: DEFAULT_VALUES,
    });

    //Cargar constancias por empleado 
    const idEmployeeSelected = watch("idEmployee"); //whatch para indicar que campo es el que nos dice cuando hay alguna constancia previa (se filtra por id empleado)
    const [previousConstancies, setPreviousConstancies] = useState<Constancy[]>([]); //Guarda y renderiza 

    const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<number[]>([]); //para la seleccion de antecedentes
    const existenConstancy = Number(idEmployeeSelected) > 0;

    //Paraa hacer dinamico el campo de antecedentes y que aparezcan constancias previas 
    useEffect(() => {
        const loadConstancies = async () => {
            //En caso de que no haya constancias previas, sale de la busqueda
            if (!existenConstancy) {
                setPreviousConstancies([]);
                setSelectedBackgroundIds([]);
                setValue("backgroundIds", []);
                return;
            }

            //En caso de que si se dirige a buscar la constancia previa 
            const result = await findConstancyByIdEmployee({
                idEmployee: Number(idEmployeeSelected),
            });

            setPreviousConstancies(result ?? []); //Para guardar los resultados en el estado 
            setSelectedBackgroundIds([]);
            setValue('backgroundIds', []);
        };

        loadConstancies(); //Ejcuta la funcion 
    }, [existenConstancy, idEmployeeSelected]); //Dependencias 

    //Para el arreglo de penalizaciones, las que tenemos de cajon
    const penalties: typeOfPenalty[] = [{ id: 1, name: "Descuento" },];

    //Para el arreglo de firmas, las preestablecidas
    // const signatures: signatures[] = [{ id: 1, idSignatory: 10, name: " Juan Perez", url: "", sendNotify: true }]

    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");

    //Alerta para antes de guardar 
    const onSubmit: SubmitHandler<Constancy> = async (data) => {
        console.log("DATA A ENVIAR: ", data);
        modalConfirm("¿Seguro que quieres guardar la constancia?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Guardando constancia...");

                console.log("DATA:", data);

                const res = await createConstancy({ data });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/constancy")
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    const handleToggleBackground = (id: number) => {
        const updatedIds = selectedBackgroundIds.includes(id)
            ? selectedBackgroundIds.filter((item) => item !== id)
            : [...selectedBackgroundIds, id];

        setSelectedBackgroundIds(updatedIds);
        setValue("backgroundIds", updatedIds);
    };

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading || "Guardando constancia..."} />
            </ConditionalRender>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isSubmitting || loading}>
                    <div className="d-flex justify-content-between align-items-center m-4 ms-0">
                        <h1 className="mb-0">Crear constancia</h1>

                        {/* Botones esquina superior derecha  */}
                        <div className="d-flex gap-2 ">
                            <Button
                                className="btn-success"
                                type="submit" disabled={isSubmitting || loading}>
                                {isSubmitting || loading ? "Guardando..." : "Guardar"}
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                disabled={isSubmitting || loading || !isDirty}
                                onClick={() => reset(DEFAULT_VALUES)}
                            >
                                Limpiar
                            </Button>
                        </div>
                    </div>

                    <div className=" d-flex justify-content-left w-full">
                        {/* Grupo para entrada de datos de la constancia */}
                        <FieldGroup className="w-full">


                            {/* //Cada Entry registra un campo de datos  */}

                            {/* Campo Seleccion de empleados */}
                            <Row>
                                <div className="d-flex align-items-center gap-2 mb-2">

                                    <label className="fw-semibold mb-0">
                                        Empleado:
                                    </label>

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
                                    register={register("idEmployee")}
                                    options={employees.map((e) => ({
                                        id: e.id!,
                                        displayName:
                                            `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                        name:
                                            `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                    }))}
                                    label=""
                                    callBackMode="id"
                                    control={control}
                                />
                            </Row>

                            {/* Campo Fecha de los hechos  */}
                            <Entry
                                register={register("dateTheEvents", { required: true })}
                                type="date"
                                max={formatDate(new Date(), "yyyy-MM-dd")}
                                label="Fecha de los hechos: "
                                invalid={!!errors.dateTheEvents}
                            />

                            {/* Campo Hora de los hechos  */}
                            <Entry
                                register={register("hourTheEvents", { required: true })}
                                type="time"
                                label="Hora de los hechos"
                                invalid={!!errors.hourTheEvents}
                            />

                            {/* Campo Lugar de los hechos  */}
                            <Entry
                                as={"textarea"}
                                rows={5}
                                className="w-full"
                                register={register("sceneOfTheEvents", { required: true })}
                                label="Lugar de los hechos"
                                invalid={!!errors.sceneOfTheEvents}
                            />

                            {/* Antecedentes de constancias previas */}
                            <ConditionalRender cond={existenConstancy}>
                                <div className="mt-3">
                                    <label className="form-label">Antecedentes</label>

                                    {previousConstancies.length === 0 ? (
                                        <div className="alert alert-success">
                                            El empleado no tiene constancias previas.
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <strong>Constancias previas encontradas:</strong>

                                            <ul className="list-group mt-2">
                                                {previousConstancies.map((constancy) => {
                                                    const isSelected = selectedBackgroundIds.includes(constancy.id);

                                                    return (
                                                        <li
                                                            key={constancy.id}
                                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isSelected ? "active" : ""
                                                                }`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => handleToggleBackground(constancy.id)}
                                                        >
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Constancia #{constancy.id}
                                                                </div>

                                                                <small>
                                                                    {constancy.dateAndTimeOfTheEvents
                                                                        ? moment
                                                                            .utc(constancy.dateAndTimeOfTheEvents)
                                                                            .format("DD/MM/YYYY HH:mm")
                                                                        : "Sin fecha"}
                                                                </small>
                                                            </div>

                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                readOnly
                                                            />
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </ConditionalRender>


                            {/* Campo penalizaciones  */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Tipo de penalización
                                </label>

                                <select
                                    className="form-select"

                                    defaultValue=""
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setValue("typeOfPenalty", []);
                                            return;
                                        }
                                        const selectedPenalty = penalties.find(
                                            (p) => p.id === Number(e.target.value)
                                        );
                                        setValue(
                                            "typeOfPenalty",
                                            selectedPenalty ? [selectedPenalty] : []
                                        );
                                    }}
                                >
                                    <option value="">
                                        -- Selecciona --
                                    </option>
                                    {penalties.map((penalty) => (
                                        <option
                                            key={penalty.id}
                                            value={penalty.id}
                                        >
                                            {penalty.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo Testigo  */}
                            <div className="mb-3">
                                <RelationField
                                    register={register("witness", { required: true, valueAsNumber: true, })}
                                    options={employees.map((e) => ({
                                        id: e.id!,
                                        displayName:
                                            `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                        name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                    }))}
                                    label="Testigo:"
                                    callBackMode="id"
                                    control={control}
                                />
                            </div>
                        </FieldGroup>
                    </div>
                </fieldset>
            </Form>
        </>
    )

}

