"use client"

import { useModals } from "@/context/ModalContext";
import { ModalBasicProps } from "@/lib/definitions";
import { useRouter } from "next/navigation";
import { Button, Modal, Spinner, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { SignatureInput } from "../fields";
import toast from "react-hot-toast";
import ConditionalRender from "../ConditionalRender";
import Loading from "../LoadingSpinner";
import { useState } from "react";
import { sendSignatureOverTime } from "@/app/actions/overtime-actions";

type TInputs = {
    signature: string;
};

function SignatureDohModal({
    show,
    onHide,
    id,
}: ModalBasicProps & { id: string }) {
    const {
        reset,
        register,
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<TInputs>();

    const { modalError, modalConfirm } = useModals();
    const router = useRouter();

    const onSubmit: SubmitHandler<TInputs> = async (data) => {
        onHide();

        modalConfirm("¿Seguro que quieres guardar la firma?", async () => {
            try {

                setLoading(true);
                setMessageLoading("Enviando firma...");

                const res = await sendSignatureOverTime({
                    id: id ? Number(id) : null,
                    signature: data.signature,
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

    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState("");

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
                    <Modal.Title>Firma de enterado</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label className="fw-semibold">
                                Dibuja tu firma
                            </Form.Label>

                            <div>
                                <SignatureInput
                                    control={control}
                                    name="signature"
                                    register={register}
                                />
                            </div>
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

export default SignatureDohModal;