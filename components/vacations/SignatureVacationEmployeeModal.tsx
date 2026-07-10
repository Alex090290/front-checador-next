"use client";

import { sendSignatureVacations } from "@/app/actions/vacations-actions";
import ConditionalRender from "@/components/ConditionalRender";
import { SignatureInput } from "@/components/fields";
import Loading from "@/components/LoadingSpinner";
import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TInputs = {
    signature: string;
};

function SignatureEmployeeModal({
    show,
    onHide,
    id,
    idPeriod,
}: ModalBasicProps & {
    id: string;
    idPeriod: number | null;
}) {
    const {
        reset,
        register,
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<TInputs>();

    const { modalError, modalConfirm } = useModals();
    const router = useRouter(); const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");


    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        onHide();

        modalConfirm("¿Seguro que quieres guardar la firma?", async () => {
            try {

                setLoading(true);
                setMessageLoading("Enviando firma...");

                const res = await sendSignatureVacations({
                    id: id ? Number(id) : null,
                    idPeriod: idPeriod ? Number(idPeriod) : null,
                    signature: data.signature
                });

                if (!res.success) {
                    modalError(res.message);
                    return;
                }

                toast.success(res.message);
                onHide();
                router.refresh();

            } finally {

                setLoading(false);
                setMessageLoading("");

            }
        });
    };

    const handleOnExited = () => {
        reset({ signature: "" });
    };

    return (
        <>
            <ConditionalRender cond={loading}>
                <Loading message={messageLoading || "Enviando firma..."} />
            </ConditionalRender>

            <Modal
                show={show}
                onHide={onHide}
                backdrop="static"
                onExited={handleOnExited}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Firma del Empleado</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group className="mb-2">
                            <SignatureInput
                                control={control}
                                name="signature"
                                register={register}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-success border-success"
                            disabled={isSubmitting}
                        >
                            Enviar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default SignatureEmployeeModal;
