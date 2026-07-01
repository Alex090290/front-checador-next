"use client";

import { Entry } from "@/components/fields";
import { useModals } from "@/context/ModalContext";
import { Button, Form } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useState } from "react";

type TInputs = {
    namePosition: string;
};

type PositionFormCreateProps = {
    show: boolean;
    onHide: () => void;
    idDepartment: number;
    positionData: {
        activeId: number | null;
        namePosition: string;
    };
    sendData: (idDepartment: number, namePosition: string) => Promise<void>;
};

function CreatePositionModal({
    onHide,
    sendData,
    idDepartment,
    positionData,
}: PositionFormCreateProps) {
    const {
        reset,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<TInputs>({
        defaultValues: {
            namePosition: positionData.namePosition || "",
        },
    });

    const [loading] = useState(false);
    const { modalConfirm } = useModals();

    const handleClose = () => {
        reset({ namePosition: "" });
        onHide();
    };


    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        onHide();

        modalConfirm("¿Deseas guardar los cambios de este puesto?", async () => {
            await sendData(idDepartment, data.namePosition);
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
                        <h5 className="mb-3">
                            {positionData.activeId ? "Editar Puesto" : "Nuevo Puesto"}
                        </h5>

                        <Form.Group className="mb-3">
                            <Entry
                                register={register("namePosition", {
                                    required: "Nombre es requerido",
                                    maxLength: {
                                        value: 50,
                                        message:
                                            "El nombre del puesto no puede exceder los 50 caracteres",
                                    },
                                })}
                                label="Nombre:"
                                invalid={!!errors.namePosition}
                                feedBack={errors.namePosition?.message}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between align-items-center pt-2">
                            <Button type="submit" disabled={loading || isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </fieldset>
            </Form>
        </>
    );

}

export default CreatePositionModal;