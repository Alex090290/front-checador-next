"use client";

import { useModals } from "@/context/ModalContext";
import { Constancy, typeOfPenalty } from "@/lib/constancy/interface"
import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { FieldGroupFluid } from "../templates/FormView";
import { Entry, RelationField } from "../fields";
import { Button, Form } from "react-bootstrap";
import moment from "moment-timezone";
import { EmployeeLite } from "../configSystem/formUpdate";
import { findConstancyByIdEmployee, updateConstancy } from "@/app/actions/constancy-actions";

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
        dateTheEvents: constancy?.dateAndTimeOfTheEvents? moment.utc(constancy.dateAndTimeOfTheEvents).format("YYYY-MM-DD"): "",
        hourTheEvents: constancy?.dateAndTimeOfTheEvents? moment.utc(constancy.dateAndTimeOfTheEvents).format("HH:mm"): "",
        sceneOfTheEvents: constancy?.sceneOfTheEvents ?? "",
        backgrounds: constancy?.backgrounds ?? [],
        typeOfPenalty: constancy?.typeOfPenalty ?? [],
        signatures: constancy?.signatures ?? [],
        signature: constancy?.signature ?? "",
        witness: constancy?.witness ?? 0,
    };
}

export default function FormUpdateConstancy({
    onHide,
    sendData,
    constancy,
    employees = [],
}: ModalBasicProps & ModalAction) {
    const {
        reset,
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Constancy>({
        defaultValues: getDefaultValues(constancy),
    });

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
    const [previousConstancies, setPreviousConstancies] = useState<Constancy[]>([]); //Guarda y renderiza 

    const [selectedBackgroundIds, setSelectedBackgroundIds] = useState<number[]>([]); //para la seleccion de antecedentes
    const existenConstancy = Number(idEmployeeSelected) > 0;

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

            const currentBackgrounds = constancy?.backgroundIds ?? [];

            setPreviousConstancies(
                (result ?? []).filter(
                    (item) => Number(item.id) !== Number(constancy?.id)
                )
            );

            setSelectedBackgroundIds(currentBackgrounds);
            setValue("backgroundIds", currentBackgrounds);
        };

        loadConstancies();
    }, [existenConstancy, idEmployeeSelected, constancy?.id]);

    const penalties: typeOfPenalty[] = [{ id: 1, name: "Descuento" },];


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

    const dateTest = moment

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

                            {/* Empleadoooo */}
                            <div className="mb-3">
                                <RelationField
                                    register={register("idEmployee")}
                                    options={employees.map((e) => ({
                                        id: e.id!,
                                        displayName:
                                            `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                        name:
                                            `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                    }))}
                                    label="Empleado: "
                                    callBackMode="id"
                                    control={control}
                                />
                            </div>

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