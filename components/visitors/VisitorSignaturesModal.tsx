"use client";

import { Card, Col, Container, Row } from "react-bootstrap";
import ModalBlur from "../ModalBlur";
import { IVisitor } from "@/lib/visitors/interface";
import { formatDateHours } from "@/lib/helpers";

export type VisitorSignatureImages = {
    entry: string | null;
    exit: string | null;
    // Mensaje cuando una firma no se pudo cargar (ej. "Todavía no registra su salida")
    entryMessage: string;
    exitMessage: string;
};

function SignatureCard({
    title,
    icon,
    image,
    message,
    signedAt,
    registeredBy,
}: {
    title: string;
    icon: string;
    image: string | null;
    message: string;
    signedAt?: string;
    registeredBy?: string;
}) {
    return (
        <Card className="border rounded-4 h-100">
            <Card.Body className="p-3 p-md-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={icon} />
                    <h6 className="mb-0 fw-bold">{title}</h6>
                </div>

                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={title} className="img-fluid border rounded bg-white w-100" style={{ objectFit: "contain", maxHeight: 220 }} />
                ) : (
                    <div className="border rounded p-4 text-center text-muted">{message}</div>
                )}

                {signedAt && (
                    <div className="small text-muted mt-2">
                        {formatDateHours(signedAt)}
                        {registeredBy ? ` · Registró: ${registeredBy}` : ""}
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

//Firmas de entrada y salida de una visita (las imágenes ya vienen cargadas)
export default function VisitorSignaturesModal({
    visitor,
    images,
    onClose,
}: {
    visitor: IVisitor;
    images: VisitorSignatureImages;
    onClose: () => void;
}) {
    return (
        <ModalBlur onClose={onClose}>
            <Container className="mt-4">
                <div className="p-2">
                    <h4 className="mb-1 fw-bold">Firmas</h4>
                    <p className="text-muted text-uppercase mb-3">
                        {visitor.name}{visitor.company ? ` · ${visitor.company}` : ""}
                    </p>

                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <SignatureCard
                                title="Entrada"
                                icon="bi bi-box-arrow-in-right text-success"
                                image={images.entry}
                                message={images.entryMessage}
                                signedAt={visitor.entrySignature?.signedAt ?? visitor.entryAt}
                                registeredBy={visitor.entrySignature?.registeredBy?.name}
                            />
                        </Col>
                        <Col xs={12} md={6}>
                            <SignatureCard
                                title="Salida"
                                icon="bi bi-box-arrow-right text-danger"
                                image={images.exit}
                                message={images.exitMessage}
                                signedAt={visitor.exitSignature?.signedAt ?? visitor.exitAt ?? undefined}
                                registeredBy={visitor.exitSignature?.registeredBy?.name}
                            />
                        </Col>
                    </Row>
                </div>
            </Container>
        </ModalBlur>
    );
}
