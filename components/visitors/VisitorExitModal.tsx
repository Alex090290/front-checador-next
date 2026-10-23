"use client";

import { Badge, Button, Card, Container, Form } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import ModalBlur from "../ModalBlur";
import { SignatureInput } from "../fields";
import { IVisitor } from "@/lib/visitors/interface";
import { formatDateHours } from "@/lib/helpers";

//Registrar la salida de un visitante con su firma (la hora la pone el back)
export default function VisitorExitModal({
    visitor,
    onClose,
    onSubmit,
}: {
    visitor: IVisitor;
    onClose: () => void;
    onSubmit: (signature: string) => void;
}) {
    const { control, register, handleSubmit } = useForm<{ signature: string }>({
        defaultValues: { signature: "" },
    });

    const { modalError } = useModals();

    // La firma se revisa al guardar, como en los demás módulos con firma
    const submit: SubmitHandler<{ signature: string }> = (data) => {
        if (!data.signature) {
            modalError("La firma de salida es obligatoria");
            return;
        }
        onSubmit(data.signature);
    };

    return (
        <ModalBlur onClose={onClose}>
            <Container className="mt-4">
                <div className="p-2">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                        <h4 className="mb-0 fw-bold">Registrar salida</h4>

                        <Badge bg="warning-subtle" text="warning-emphasis" className="rounded-pill px-3 py-2 fw-semibold border border-warning-subtle">
                            Dentro
                        </Badge>
                    </div>

                    <Card className="rounded-4 shadow-sm mb-3">
                        <Card.Body className="p-3 p-md-4">
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between gap-3 border-bottom pb-2">
                                    <span className="text-muted"><i className="bi bi-person text-primary me-2" />Visitante</span>
                                    <span className="fw-semibold text-uppercase text-end">{visitor.name}</span>
                                </div>
                                <div className="d-flex justify-content-between gap-3 border-bottom pb-2">
                                    <span className="text-muted"><i className="bi bi-building text-primary me-2" />Empresa</span>
                                    <span className="fw-semibold text-uppercase text-end">{visitor.company || "—"}</span>
                                </div>
                                <div className="d-flex justify-content-between gap-3">
                                    <span className="text-muted"><i className="bi bi-box-arrow-in-right text-success me-2" />Entrada</span>
                                    <span className="fw-semibold text-end">{formatDateHours(visitor.entryAt)}</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Form onSubmit={handleSubmit(submit)}>
                        <Card className="rounded-4 shadow-sm">
                            <Card.Body className="p-3 p-md-4">
                                <div className="fw-semibold mb-2">Firma de salida:</div>
                                <SignatureInput
                                    name="signature"
                                    register={register}
                                    control={control}
                                />
                            </Card.Body>
                        </Card>

                        <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 mt-4">
                            <Button type="button" variant="secondary" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="success">
                                Registrar salida
                            </Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </ModalBlur>
    );
}
