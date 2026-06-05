"use client"

import { createOverTime } from "@/app/actions/overtime-actions";
import { useModals } from "@/context/ModalContext";
import { Employee } from "@/lib/definitions"
import { OverTime } from "@/lib/overTime/interface";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Form, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const DEFAULT_VALUES: OverTime = {
    // _id: "",
    id: 0,
    idEmployee: 0,
    motive: "",
    date: "",
    hourInit: "",
    hourEnd: "",
};


export default function CreateOvertimeComponent({
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
    } = useForm<OverTime>({
        defaultValues: DEFAULT_VALUES,
    });

    // Aqwi los const
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");
    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    //Helpers
    const onSubmit: SubmitHandler<OverTime> = async (data) => {
        console.log("DATA:", data)
        modalConfirm("¿Seguro que quieres guardar el registro?", async () => {
            try {
                setLoading(true);
                setMessageLoading("Guardando registro...");

                console.log("DATA:", data);

                const res = await createOverTime({ data });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                router.push("/app/overtime")
            } finally {
                setLoading(false);
                setMessageLoading("");
            }
        });
    };

    const handleBack = () => {
        setLoading(true);
        setMessageLoading("Cargando...");
        router.push("/app/overtime");
    };

    return (
        <>
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Crear registro</h1>

                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleBack}
                        >
                            Cancelar
                        </Button>

                        <Button
                            className="bg-success border-success"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </div>
                <Row className="justify-content-center">
                    <Col xs={12} xl={12} xxl={12}>
                        <Card className="rounded-4 shadow-sm border">
                            <Card.Body className="p-4 p-md-5">
                                {/* <Form onSubmit={handleSubmit(onSubmit)}>

                                    <Row className="g-4 align-items-start">

                                    </Row>
                                </Form> */}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
