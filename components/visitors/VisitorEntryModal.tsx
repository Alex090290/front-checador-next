"use client";

import { Badge, Button, Card, Container, Form } from "react-bootstrap";
import { Controller, FieldErrors, SubmitHandler, useForm } from "react-hook-form";
import { useModals } from "@/context/ModalContext";
import ModalBlur from "../ModalBlur";
import { Entry, SignatureInput } from "../fields";
import SuggestInput from "./SuggestInput";
import { suggestVisitorCompanies, suggestVisitorNames } from "@/app/actions/visitors-actions";
import { IVisitorCompanySuggestion, IVisitorNameSuggestion } from "@/lib/visitors/interface";

export type TVisitorEntryInputs = {
    name: string;
    company: string;
    reason: string;
    signature: string;
};

const textRules = (label: string) => ({
    validate: (value: string) => {
        const text = (value ?? "").trim();
        if (text.length < 2) return `${label} debe tener al menos 2 caracteres`;
        if (text.length > 120) return `${label} no puede tener más de 120 caracteres`;
        return true;
    },
});

//Registrar la entrada de un visitante: nombre y empresa con autocompletado, motivo y firma de entrada
export default function VisitorEntryModal({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (data: TVisitorEntryInputs) => void;
}) {
    const {
        control,
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<TVisitorEntryInputs>({
        defaultValues: { name: "", company: "", reason: "", signature: "" },
    });

    const { modalError } = useModals();

    // Igual que en permisos y vacaciones: la firma se revisa al guardar (el input oculto de SignatureInput
    // siempre vale "" y una regla "required" ahí bloqueaba el envío sin avisar)
    const submit: SubmitHandler<TVisitorEntryInputs> = (data) => {
        if (!data.signature) {
            modalError("La firma de entrada es obligatoria");
            return;
        }
        onSubmit(data);
    };

    // Si falta algún dato se avisa con el modal de error, además del texto bajo el campo
    const invalid = (errs: FieldErrors<TVisitorEntryInputs>) => {
        const first = errs.name?.message || errs.company?.message || errs.reason?.message;
        if (first) modalError(String(first));
    };

    return (
        <ModalBlur onClose={onClose}>
            <Container className="mt-4">
                <div className="p-2">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
                        <h4 className="mb-0 fw-bold">Registrar entrada</h4>

                        <Badge bg="success-subtle" text="success-emphasis" className="rounded-pill px-3 py-2 fw-semibold border border-success-subtle">
                            Visitante
                        </Badge>
                    </div>

                    <p className="text-muted">La hora de entrada se registra al guardar con la firma.</p>

                    <Form onSubmit={handleSubmit(submit, invalid)}>
                        <Card className="rounded-4 shadow-sm mb-3">
                            <Card.Body className="p-3 p-md-4">
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={textRules("El nombre")}
                                    render={({ field }) => (
                                        <SuggestInput<IVisitorNameSuggestion>
                                            id="visitor-name"
                                            label="Nombre del visitante:"
                                            value={field.value}
                                            onChange={field.onChange}
                                            fetchSuggestions={suggestVisitorNames}
                                            getKey={(s) => s.name}
                                            renderItem={(s) => (
                                                <span className="text-uppercase">
                                                    {s.name}
                                                    <span className="text-muted">
                                                        {s.lastCompany ? ` · ${s.lastCompany}` : ""} · {s.visits} visita{s.visits !== 1 ? "s" : ""}
                                                    </span>
                                                </span>
                                            )}
                                            onSelect={(s) => {
                                                field.onChange(s.name);
                                                // La empresa solo se llena si todavía está vacía
                                                if (!getValues("company").trim() && s.lastCompany) {
                                                    setValue("company", s.lastCompany, { shouldValidate: true });
                                                }
                                            }}
                                            invalid={!!errors.name}
                                            feedback={errors.name?.message}
                                            maxLength={120}
                                            autoFocus
                                        />
                                    )}
                                />

                                <Controller
                                    name="company"
                                    control={control}
                                    rules={textRules("La empresa")}
                                    render={({ field }) => (
                                        <SuggestInput<IVisitorCompanySuggestion>
                                            id="visitor-company"
                                            label="Empresa:"
                                            value={field.value}
                                            onChange={field.onChange}
                                            fetchSuggestions={suggestVisitorCompanies}
                                            getKey={(s) => s.company}
                                            renderItem={(s) => (
                                                <span className="text-uppercase">
                                                    {s.company}
                                                    <span className="text-muted"> · {s.visits} visita{s.visits !== 1 ? "s" : ""}</span>
                                                </span>
                                            )}
                                            onSelect={(s) => field.onChange(s.company)}
                                            invalid={!!errors.company}
                                            feedback={errors.company?.message}
                                            maxLength={120}
                                        />
                                    )}
                                />

                                <Entry
                                    register={register("reason", {
                                        validate: (value) => {
                                            const text = (value ?? "").trim();
                                            if (!text) return "El motivo de la visita es requerido";
                                            if (text.length > 300) return "El motivo no puede tener más de 300 caracteres";
                                            return true;
                                        },
                                    })}
                                    label="Motivo de la visita:"
                                    invalid={!!errors.reason}
                                    feedBack={errors.reason?.message}
                                    className="border rounded-3 text-uppercase"
                                    as={"textarea"}
                                    rows={3}
                                />
                            </Card.Body>
                        </Card>

                        <Card className="rounded-4 shadow-sm">
                            <Card.Body className="p-3 p-md-4">
                                <div className="fw-semibold mb-2">Firma de entrada:</div>
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
                                Registrar entrada
                            </Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </ModalBlur>
    );
}
