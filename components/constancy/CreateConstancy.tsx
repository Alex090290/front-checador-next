"use client";

//Imports de base
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

import { createConstancy, findConstancyByIdEmployee } from "@/app/actions/constancy-actions";
import { Constancy, signatures, typeOfPenalty } from "@/lib/constancy/interface";
import { Employee } from "@/lib/definitions";
import { useModals } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FieldGroup } from "../templates/FormView";
import { Entry, RelationField } from "../fields";
import { formatDate } from "date-fns";
import moment from "moment-timezone";



const DEFAULT_VALUES: Constancy = {
    // _id: "",
    id: 0,
    idEmployee: 0,
    dateAndTimeOfTheEvents: "",
    dateTheEvents: "",
    hourTheEvents: "",
    sceneOfTheEvents: "",
    backgroundIds: [],
    typeOfPenalty: [],
    signatures: [],
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


    const existenConstancy = Number(idEmployeeSelected) > 0;
    const [selectedConstancy, setSelectedConstancy] = useState<Constancy | null>(null);

    //Paraa hacer dinamico el campo de antecedentes y que aparezcan constancias previas 
    useEffect(() => {
        const loadConstancies = async () => {
            //En caso de que no haya constancias previas, sale de la busqueda
            if (!existenConstancy) {
                setPreviousConstancies([]);
                setSelectedConstancy(null);
                return;
            }

            //En caso de que si se dirige a buscar la constancia previa 
            const result = await findConstancyByIdEmployee({
                idEmployee: Number(idEmployeeSelected),
            });

            setPreviousConstancies(result ?? []); //Para guardar los resultados en el estado 

            if (!result || result.length === 0) {
                setSelectedConstancy(null);
            }
        };

        loadConstancies(); //Ejcuta la funcion 
    }, [existenConstancy, idEmployeeSelected]); //Dependencias 

    //Para el arreglo de penalizaciones, las que tenemos de cajon
    const penalties: typeOfPenalty[] = [{ id: 1, name: "Descuento" },];

    //Para el arreglo de firmas, las preestablecidas
    const signatures: signatures[] = [{ id: 1, idSignatory: 10, name: " Juan Perez", url: "", sendNotify: true }]

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

                const res = await createConstancy({ data });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.back();
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
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
                            <RelationField
                                register={register("idEmployee")}
                                options={employees.map((e) => ({
                                    id: e.id!,
                                    displayName:
                                        `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}` || "",
                                    name: `${e.lastName?.toUpperCase()} ${e.name?.toUpperCase()}`,
                                }))}
                                label="Empleado:"
                                callBackMode="id"
                                control={control}
                            />

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
                                                {previousConstancies.map((constancy) => (
                                                    <li
                                                        key={constancy.id}
                                                        className="list-group-item list-group-item-action"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setSelectedConstancy(constancy)}
                                                    >
                                                        constancia: {constancy.id}
                                                        {constancy.dateTheEvents}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {selectedConstancy && (
                                        <div className="card mt-3">
                                            <div className="card-header ">
                                                Detalles de la constancia
                                            </div>

                                            <div className="card-body">
                                                <p><strong>ID:</strong> {selectedConstancy.id}</p>
                                                <p><strong>Fecha: </strong> {moment.utc(selectedConstancy.dateAndTimeOfTheEvents).format("DD/MM/YYYY")}</p>
                                                <p><strong>Hora: </strong> {moment.utc(selectedConstancy.dateAndTimeOfTheEvents).format("hh:mm")}</p>
                                                <p><strong>Lugar:</strong> {selectedConstancy.sceneOfTheEvents}</p>
                                            </div>
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

                            {/* Campo firmas  */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Firmas
                                </label>

                                <select
                                    className="form-select"
                                    defaultValue=""
                                    onChange={(e) => {
                                        if (!e.target.value) {
                                            setValue("signatures", []);
                                            return;
                                        }

                                        const selectedSignature = signatures.find(
                                            (s) => s.id === Number(e.target.value)
                                        );

                                        setValue(
                                            "signatures",
                                            selectedSignature ? [selectedSignature] : []
                                        );
                                    }}
                                >
                                    <option value="">-- Selecciona --</option>

                                    {signatures.map((signature) => (
                                        <option key={signature.id} value={signature.id}>
                                            {signature.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </FieldGroup>
                    </div>
                </fieldset>
            </Form>
        </>
    )

}

