"use client";

//Imports de base
import ConditionalRender from "@/components/ConditionalRender";
import Loading from "@/components/LoadingSpinner";

import { createConstancy } from "@/app/actions/constancy-actions";
import { Constancy } from "@/lib/constancy/interface";
import { Employee } from "@/lib/definitions";
import { useModals } from "@/context/ModalContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FieldGroup } from "../templates/FormView";
import { Entry, RelationField } from "../fields";
import { formatDate } from "date-fns";


const DEFAULT_VALUES: Constancy = {
    idEmployee: 0,
    dateTheEventsscene: "",
    hourTheEvents: "",
    sceneOfTheEvents: "",
    backgroundIds: [],
    typeOfPenalty: [],
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
        handleSubmit,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<Constancy>({
        defaultValues: DEFAULT_VALUES,
    });

    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");

    const onSubmit: SubmitHandler<Constancy> = async (data) => {
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

                    <div className=" d-flex justify-content-left">
                    {/* Grupo para entrada de datos de la constancia */}
                    <FieldGroup>

                        
                        {/* //Cada Entry registra un campo de datos  */}

                        <RelationField
                            register={register("idEmployee", {
                                required: true,
                                valueAsNumber: true,
                            })}
                            label="Empleado"
                            control={control}
                            callBackMode="id"
                            className="text-uppercase"
                            options={employees.map((emp) => ({
                                id: emp.id as number,
                                displayName: `${emp.name} ${emp.lastName}`,
                                name: `${emp.name} ${emp.lastName}`,
                            }))}
                        />

                        <Entry
                            register={register("dateTheEventsscene", { required: true })}
                            type="date"
                            max={formatDate(new Date(), "yyyy-MM-dd")}
                            label="Fecha de los hechos"
                            invalid={!!errors.dateTheEventsscene}
                        />

                        <Entry
                            register={register("hourTheEvents", { required: true })}
                            type="time"
                            label="Hora de los hechos"
                            invalid={!!errors.hourTheEvents}
                        />

                        <Entry
                            register={register("sceneOfTheEvents", { required: true })}
                            label="Lugar de los hechos"
                            invalid={!!errors.sceneOfTheEvents}
                        />

                        <Entry
                            register={register("backgroundIds", { required: true })}
                            label="Antecedentes"
                            invalid={!!errors.backgroundIds}
                        />

                        <Entry
                            register={register("typeOfPenalty", { required: true })}
                            label="Tipo de penalización"
                            invalid={!!errors.typeOfPenalty}
                        />

                    </FieldGroup>
                    </div>
                </fieldset>
            </Form>
        </>
    )

}

