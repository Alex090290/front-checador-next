"use client";

import { useModals } from "@/context/ModalContext";
import { Constancy } from "@/lib/constancy/interface"
import { ActionResponse, ModalBasicProps } from "@/lib/definitions";
import { useEffect, useState } from "react";
import { Form, SubmitHandler, useForm } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { FieldGroupFluid } from "../templates/FormView";
import { RelationField } from "../fields";

type ModalAction = {
    sendData: (data: Constancy) => Promise<ActionResponse<boolean | null>>;
    constancy?: Constancy | null;
};

function getDefaultValues(constancy?: Constancy | null): Constancy {
    return {
        id: constancy?.id ?? 0,
        idEmployee: constancy?.idEmployee ?? 0,
        dateTheEvents: constancy?.dateTheEvents ?? "",
        hourTheEvents: constancy?.hourTheEvents ?? "",
        sceneOfTheEvents: constancy?.sceneOfTheEvents ?? "",
        backgroundIds: constancy?.backgroundIds ?? [],
        typeOfPenalty: constancy?.typeOfPenalty ?? [],
        signatures: constancy?.signatures ?? [],
    };
}

export default function FormUpdateConstancy({
    onHide,
    sendData,
    constancy,
}: ModalBasicProps & ModalAction) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Constancy>({
        defaultValues: getDefaultValues(constancy),
    });

    const [loading, setLoading] = useState(false);
    const { modalError, modalConfirm } = useModals();

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

    const onSubmit: SubmitHandler<Constancy> = async (data) => {
        modalConfirm("¿Deseas guardar los cambios de esta constancia?", async () => {

            const res = await sendData(data);

            if (!res.success) {
                modalError(res.message);
                return;
            }

            onHide();
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

            {/* <Form onSubmit={handleSubmit(onSubmit)}>
                <fieldset disabled={loading ?? isSubmitting}>
                    <FieldGroupFluid>
                        <RelationField
                            callBackMode="id"
                            control={control}
                            label="Empleado"
                            options={employees.map((em) => ({
                                id: Number(em.id),
                                displayName: `${em.lastName} ${em.name}`.toUpperCase(),
                                name: `${em.lastName} ${em.name}`.toUpperCase(),
                            }))}
                            register={register("idEmployee", { required: true })}
                            readonly={session?.uid?.role === "EMPLOYEE"}
                        />
                    </FieldGroupFluid>
                </fieldset>
            </Form> */}
        </>
    );
}