"use client";

//Imports de base
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

import { createConstancy, fetchPenalties, findConstancyByIdEmployee } from "@/app/actions/constancy-actions";
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
    tableOfContents: "",
    discountData: {
        amount: 0,
        typeDiscount: "",
    },
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


    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");

    const [availablePenalties, setAvailablePenalties] = useState<typeOfPenalty[]>([]);
    const selectedPenalties = watch("typeOfPenalty");

    //Para los condicionales de Penalties
    const penaltiesSelected = selectedPenalties?.[0]?.id;

    const esDescuento = penaltiesSelected === 1;
    const esDiasSinGoce = penaltiesSelected === 2;

    //Condicional para dias sin goce
    const [fechasSancion, setFechasSancion] = useState<string[]>([""]);

    //Seleccion de involucrados
    const [selectedInvolvedIds, setSelectedInvolvedIds] = useState<number[]>([]);

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
    useEffect(() => {
        const loadPenalties = async () => {
            try {
                const result = await fetchPenalties();
                setAvailablePenalties(result ?? []);

            } catch (error) {
                console.log("Error al cargar penalizasciones:", error);
                toast.error("No se pudieron cargar las penalizaciones")
            }
        }; loadPenalties();
    }, [])

    //Nos deja saber si son una o varias fechas sin goce
    useEffect(() => {
        setValue("daysWithoutPay", fechasSancion.filter(f => f !== ""));
    }, [fechasSancion, setValue]);

    //Varios involucrados
    useEffect(() => {
        const involvedData = selectedInvolvedIds.map((id) => {
            const empleado = employees.find((e) => e.id === id);

            return {
                ids: [id],
                employees: empleado
                    ? [{
                        id: empleado.id!,
                        name: empleado.name ?? "",
                        lastName: empleado.lastName ?? "",
                    }]
                    : [],
            };
        });

        setValue("involved", involvedData);
    }, [selectedInvolvedIds, employees, setValue]);

    //Alerta para antes de guardar 
    const onSubmit: SubmitHandler<Constancy> = async (data) => {
        console.log("DATA:", data)
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
            {/* Condicional para cargar la pagina */}
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading || "Guardando constancia..."} />
            </ConditionalRender>

            {/* Condicional para guardar cambios  */}
            <ConditionalRender cond={isSubmitting}>
                <Loading message="Guardando..." />
            </ConditionalRender>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={isSubmitting || loading}>
                    <div className="d-flex justify-content-between align-items-center m-4 ms-0">
                        <h1 className="mb-0">Crear constancia</h1>

                        {/* Botones esquina superior derecha  */}
                        <div className="d-flex gap-2 ">
                            <ConditionalRender cond={isDirty}>
                                <Button
                                    className="btn-success"
                                    type="submit" disabled={isSubmitting || loading || !isDirty}>
                                    {isSubmitting || loading ? "Guardando..." : "Guardar"}
                                </Button>
                            </ConditionalRender>

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
                                label="Lugar de los hechos:"
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
                                        <div className="alert alert-danger">
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
                                    Tipo de penalización:
                                </label>

                                <select
                                    className="form-select"

                                    defaultValue=""
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setValue("typeOfPenalty", []);
                                            return;
                                        }
                                        const selectedPenalty = availablePenalties.find(
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
                                    {availablePenalties.map((penalty) => (
                                        <option
                                            key={penalty.id}
                                            value={penalty.id}
                                        >
                                            {penalty.name}
                                        </option>
                                    ))}
                                </select>

                                {/* En caso de que la penalizacion sea descuento */}
                                <ConditionalRender cond={esDescuento}>
                                    <div className="card p-3 mb-3 mt-2 border-light animate__animated animate__fadeIn">
                                        <Entry
                                            register={register("discountData.amount", { required: esDescuento })}
                                            type="number"
                                            label="Monto a descontar ($):"
                                            invalid={!!errors.discountData?.amount}
                                            className="border-light form-control"
                                        />

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Tipo de descuento:</label>
                                            <select
                                                {...register("discountData.typeDiscount", { required: esDescuento })}
                                                className="form-select date-hover-effect"
                                            >
                                                <option value="">-- Selecciona el tipo --</option>
                                                <option value="bono">Bono</option>
                                                <option value="sueldo">Sueldo</option>
                                            </select>

                                            {/* Mensaje de error en caso de que no seleccionen uno */}
                                            {errors.discountData?.typeDiscount && (
                                                <span className="text-danger small mt-1 d-block">
                                                    Por favor, selecciona un tipo de descuento.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </ConditionalRender>

                                {/* En caso de que la penalizacion sean dias sin goce de sueldo */}
                                <ConditionalRender cond={esDiasSinGoce}>
                                    <div className="card p-3 mb-3 mt-2 border-light animate__animated animate__fadeIn">
                                        <div className="d-flex justify-content-between align-items-center mb-3">

                                            {/* Botón para meter un string vacío al arreglo (lo que creará un nuevo input) */}
                                            <Button
                                                className="text-secondary"
                                                size="sm"
                                                variant="outline-info"
                                                type="button"
                                                onClick={() => setFechasSancion([...fechasSancion, ""])}
                                            >
                                                <i className="bi bi-plus-lg me-1 text-light"></i> Agregar otro día
                                            </Button>
                                        </div>

                                        <div className="d-flex flex-column gap-2">
                                            {fechasSancion.map((fecha, index) => (
                                                <div key={index} className="d-flex gap-2 align-items-center animate__animated animate__fadeInUp">
                                                    <div className="flex-grow-1">
                                                        <label className="form-label mb-1 small text-">Fecha del día #{index + 1}:</label>
                                                        <input
                                                            type="date"
                                                            className="form-control border-light form-control"
                                                            value={fecha}
                                                            required={esDiasSinGoce}
                                                            onChange={(e) => {
                                                                const nuevasFechas = [...fechasSancion];
                                                                nuevasFechas[index] = e.target.value;
                                                                setFechasSancion(nuevasFechas);
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Botón para remover este campo específico si hay más de uno */}
                                                    {fechasSancion.length > 1 && (
                                                        <Button
                                                            variant="outline-danger"
                                                            type="button"
                                                            className="align-self-end"
                                                            style={{ height: "38px" }}
                                                            onClick={() => {
                                                                const filtradas = fechasSancion.filter((_, i) => i !== index);
                                                                setFechasSancion(filtradas);
                                                            }}
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ConditionalRender>
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

                            {/* Campo Involucrados con Selección Múltiple y Remoción */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Involucrados:</label>

                                <select
                                    className="form-select date-hover-effect mb-2"
                                    defaultValue=""
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        if (!selectedId) return;

                                        if (!selectedInvolvedIds.includes(selectedId)) {
                                            setSelectedInvolvedIds([...selectedInvolvedIds, selectedId]);
                                        }
                                        e.target.value = "";
                                    }}
                                >
                                    <option value="">-- Selecciona uno o más empleados --</option>
                                    {employees.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {`${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`}
                                        </option>
                                    ))}
                                </select>

                                {/* Renderizado de los empleados seleccionados */}
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {selectedInvolvedIds.map((id) => {
                                        const empleado = employees.find((e) => e.id === id);
                                        if (!empleado) return null;

                                        return (
                                            <span
                                                key={id}
                                                className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary d-inline-flex align-items-center gap-2 p-2 animate__animated animate__fadeIn"
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                {`${empleado.lastName?.toUpperCase()} ${empleado.name?.toUpperCase()}`}

                                                {/* Botón X para eliminar al empleado si se equivocan */}
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    style={{ width: "0.5em", height: "0.5em", fontSize: "0.75rem" }}
                                                    aria-label="Remove"
                                                    onClick={() => {
                                                        const actualizados = selectedInvolvedIds.filter((item) => item !== id);
                                                        setSelectedInvolvedIds(actualizados);
                                                    }}
                                                />
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Indice del reglamento */}
                            <Entry
                                as={"textarea"}
                                rows={5}
                                className="w-full"
                                register={register("tableOfContents")}
                                label="Índice del reglamento:"
                                invalid={!!errors.tableOfContents}
                            />
                        </FieldGroup>
                    </div>
                </fieldset>
            </Form>
        </>
    )

}

