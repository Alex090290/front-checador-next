"use client";

import { useModals } from "@/context/ModalContext";
import { Constancy, typeOfPenalty } from "@/lib/constancy/interface"
import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { FieldGroupFluid } from "../templates/FormView";
import { Entry } from "../fields";
import { Button, Form } from "react-bootstrap";
import moment from "moment-timezone";
import { EmployeeLite } from "../configSystem/formUpdate";
import { fetchPenalties, findConstancyByIdEmployee, updateConstancy } from "@/app/actions/constancy-actions";
import toast from "react-hot-toast";

type ModalAction = {
    sendData: (data: Constancy) => Promise<ActionResponse<boolean | null>>;
    constancy?: Constancy | null;
    employees?: EmployeeLite[];
    penalty?: typeOfPenalty[];
};


function getDefaultValues(constancy?: Constancy | null): Constancy {

    return {
        id: constancy?.id ?? 0,
        idEmployee: constancy?.idEmployee ?? 0,
        dateTheEvents: constancy?.dateAndTimeOfTheEvents ? moment.utc(constancy.dateAndTimeOfTheEvents).format("YYYY-MM-DD") : "",
        hourTheEvents: constancy?.dateAndTimeOfTheEvents ? moment.utc(constancy.dateAndTimeOfTheEvents).format("HH:mm") : "",
        sceneOfTheEvents: constancy?.sceneOfTheEvents ?? "",
        backgrounds: constancy?.backgrounds ?? [],
        typeOfPenalty: constancy?.typeOfPenalty ?? [],
        signatures: constancy?.signatures ?? [],
        witness: constancy?.witness ?? 0,
        involved: constancy?.involved ?? [],
        tableOfContents: constancy?.tableOfContents ?? "",
        discountData: {
            amount: constancy?.discountData?.amount ?? 0,
            typeDiscount: constancy?.discountData?.typeDiscount ?? ""
        },
        daysWithoutPay: constancy?.daysWithoutPay ? constancy.daysWithoutPay.map(date => moment.utc(date).format("YYYY-MM-DD")) : [],
    };
}

export default function FormUpdateConstancy({
    onHide,
    constancy,
    employees = [],
}: ModalBasicProps & ModalAction) {
    const {
        reset,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Constancy>({
        defaultValues: getDefaultValues(constancy),
    });

    const watchedInvolved = watch("involved") ?? [];

    const currentInvolvedEmployees = Array.isArray(watchedInvolved)
  ? watchedInvolved.flatMap((inv) => inv.employees ?? [])
  : [];

    const [loading, setLoading] = useState(false);
    const { modalError, modalConfirm } = useModals();
    console.log("sendData: ", constancy);

    useEffect(() => {
        setLoading(true);

        try {
            reset(getDefaultValues(constancy));
        } catch {
            modalError("No se pudo cargar la información de la constancia");
        } finally {
            setLoading(false);
        }
    }, [constancy, reset, modalError]);

    //Cargar constancias por empleado 
    const idEmployeeSelected = watch("idEmployee"); //whatch para indicar que campo es el que nos dice cuando hay alguna constancia previa (se filtra por id empleado)
    const [previousConstancies, setPreviousConstancies] = useState<Constancy[] | null>(null); //Guarda y renderiza 

    const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<number[]>([]); //para la seleccion de antecedentes
    const existenConstancy = Number(idEmployeeSelected) > 0;

    const [availablePenalties, setAvailablePenalties] = useState<typeOfPenalty[]>([]);
    const selectedPenalties = watch("typeOfPenalty");

    //Para los condicionales de Penalties
    const penaltiesSelected = selectedPenalties?.[0]?.id;

    const esDescuento = penaltiesSelected === 1;
    const esDiasSinGoce = penaltiesSelected === 2;

    //Condicional para dias sin goce
    const [fechasSancion, setFechasSancion] = useState<string[]>([""]);


    //Paraa hacer dinamico el campo de antecedentes y que aparezcan constancias previas 
    useEffect(() => {
        const loadConstancies = async () => {
            if (!existenConstancy) {
                setPreviousConstancies([]);
                setSelectedBackgroundIds([]);
                setValue("backgroundIds", []);
                return;
            }

            const result = await findConstancyByIdEmployee({
                idEmployee: Number(idEmployeeSelected),
            });

            const currentBackgrounds =
                constancy?.backgrounds?.map((background) => Number(background.id)) ?? [];

            setPreviousConstancies(
                (result ?? []).filter(
                    (item) => Number(item.id) !== Number(constancy?.id)
                )
            );

            setSelectedBackgroundIds(currentBackgrounds);
            setValue("backgroundIds", currentBackgrounds);
        };

        loadConstancies();
    }, [existenConstancy, idEmployeeSelected, constancy?.backgrounds, constancy?.id, setValue]);

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


    const handleToggleBackground = (id: number) => {
        const updatedIds = selectedBackgroundIds.includes(id)
            ? selectedBackgroundIds.filter((item) => item !== id)
            : [...selectedBackgroundIds, id];

        setSelectedBackgroundIds(updatedIds);
        setValue("backgroundIds", updatedIds);
    };

    const onSubmit: SubmitHandler<Constancy> = async (data) => {

        onHide();

        modalConfirm("¿Deseas guardar los cambios de esta constancia?", async () => {
            // const res = await sendData(data);
            const res = await updateConstancy({
                id: Number(data.id),
                constancy: data,
            });

            if (!res.success) {
                modalError(res.message);
                return;
            }
        });
    };


    return (
        <>
            {/* Condicional para caragar la pagina */}
            <ConditionalRender cond={loading}>
                <Loading message="Cargando..." />
            </ConditionalRender>

            {/* Condicional para guardar cambios  */}
            <ConditionalRender cond={isSubmitting}>
                <Loading message="Guardando..." />
            </ConditionalRender>


            <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={loading || isSubmitting}>
                    <div className="p-2">
                        <FieldGroupFluid>

                            {/* Fecha de los hechos */}
                            <div className="mb-3">
                                <Entry
                                    register={register("dateTheEvents")}
                                    label="Fecha de los hechos:"
                                    type="date"
                                    invalid={!!errors.dateTheEvents}
                                    feedBack={errors.dateTheEvents?.message}
                                />
                            </div>

                            {/* Hora de los hechos */}
                            <div className="mb-4">
                                <Entry
                                    register={register("hourTheEvents")}
                                    label="Hora de los hechos:"
                                    type="time"
                                    invalid={!!errors.hourTheEvents}
                                    feedBack={errors.hourTheEvents?.message}
                                />
                            </div>

                            <div className="mb-4">
                                <Entry
                                    register={register("sceneOfTheEvents")}
                                    label="Lugar de los hechos:"
                                    type="text"
                                    invalid={!!errors.sceneOfTheEvents}
                                    feedBack={errors.sceneOfTheEvents?.message}
                                />
                            </div>

                            {/* Antecedentes de constancias previas */}

                            <ConditionalRender cond={existenConstancy}>
                                <div className="mt-3">
                                    <label className="form-label">Antecedentes</label>

                                    {previousConstancies === null ? (
                                        <Loading message="Cargando..." />
                                    ) : previousConstancies.length === 0 ? (
                                        <div className="alert alert-info">
                                            No se encontraron antecedentes
                                        </div>
                                    ) : (
                                        <div className="alert alert-secondary">
                                            <strong>Constancias previas encontradas:</strong>

                                            <ul className="list-group mt-2">
                                                {previousConstancies.map((constancy) => {
                                                    const isSelected = selectedBackgroundIds.includes(constancy.id);

                                                    return (
                                                        <li
                                                            key={constancy.id}
                                                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center `}
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

                            <div className="mb-3">
                                <label className="form-label fw-semibold">Involucrados:</label>

                                <select
                                    className="form-select date-hover-effect mb-2"
                                    defaultValue=""
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);

                                        if (!selectedId) return;

                                        const yaExiste = watchedInvolved.some((inv) =>
                                            inv.ids.includes(selectedId)
                                        );

                                        if (yaExiste) {
                                            e.target.value = "";
                                            return;
                                        }

                                        const empleadoEncontrado = employees.find(
                                            (emp) => emp.id === selectedId
                                        );

                                        if (!empleadoEncontrado) {
                                            e.target.value = "";
                                            return;
                                        }

                                        const nuevoInvolvedItem = {
                                            ids: [selectedId],
                                            employees: [
                                                {
                                                    id: empleadoEncontrado.id!,
                                                    name: empleadoEncontrado.name ?? "",
                                                    lastName: empleadoEncontrado.lastName ?? "",
                                                },
                                            ],
                                        };

                                        setValue("involved", [...watchedInvolved, nuevoInvolvedItem], {
                                            shouldDirty: true,
                                        });

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

                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {currentInvolvedEmployees.map((empleado) => (
                                        <span
                                            key={empleado.id}
                                            className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary d-inline-flex align-items-center gap-2 p-2"
                                            style={{ fontSize: "0.9rem" }}
                                        >
                                            {`${empleado.lastName?.toUpperCase()} ${empleado.name?.toUpperCase()}`}

                                            <button
                                                type="button"
                                                className="btn-close"
                                                style={{
                                                    width: "0.5em",
                                                    height: "0.5em",
                                                    fontSize: "0.75rem",
                                                }}
                                                aria-label="Remove"
                                                onClick={() => {
                                                    const nuevosInvolved = watchedInvolved.filter(
                                                        (inv) => !inv.ids.includes(empleado.id)
                                                    );

                                                    setValue("involved", nuevosInvolved, {
                                                        shouldDirty: true,
                                                    });
                                                }}
                                            />
                                        </span>
                                    ))}
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

                            <div className="d-flex justify-content-between align-items-center pt-2">
                                <Button type="submit" disabled={loading || isSubmitting}>
                                    {isSubmitting ? "Guardando..." : "Guardar"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onHide}
                                    disabled={loading || isSubmitting}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </FieldGroupFluid>
                    </div>
                </fieldset>
            </Form>
        </>
    );
}