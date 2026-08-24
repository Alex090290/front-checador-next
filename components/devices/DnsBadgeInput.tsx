import { Control, Controller, FieldErrors } from "react-hook-form";
import { IDevices } from "@/lib/devices/interface";
import { Button, Col, Form } from "react-bootstrap";
import { useState } from "react";

export default function DnsBadgeInput({
    networkIndex,
    control,
    errors,
}: {
    networkIndex: number;
    control: Control<IDevices>;
    errors: FieldErrors<IDevices>;
}) {
    const [inputValue, setInputValue] = useState("");

    return (
        <Controller
            control={control}
            name={`networkInfo.${networkIndex}.dns`}
            defaultValue={[]}
            render={({ field }) => {
                const dnsList: string[] = field.value || [];

                const handleAdd = () => {
                    const trimmed = inputValue.trim();
                    if (!trimmed || dnsList.includes(trimmed)) {
                        setInputValue("");
                        return;
                    }
                    field.onChange([...dnsList, trimmed]);
                    setInputValue("");
                };

                const handleRemove = (dnsValue: string) => {
                    field.onChange(dnsList.filter((d) => d !== dnsValue));
                };

                const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                    }
                };

                return (
                    <Col md={12}>
                        <Form.Label className="fw-semibold">Dns:</Form.Label>

                        <div className="d-flex gap-2 mb-2">
                            <Form.Control
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ej. 8.8.8.8"
                                className="border"
                            />
                            <Button variant="outline-primary" type="button" onClick={handleAdd}>
                                <i className="bi bi-plus-lg" />
                            </Button>
                        </div>

                        {errors.networkInfo?.[networkIndex]?.dns && (
                            <div className="text-danger small mb-2">
                                {errors.networkInfo[networkIndex]?.dns?.message as string}
                            </div>
                        )}

                        <div className="d-flex flex-wrap gap-2">
                            {dnsList.map((dns) => (
                                <span
                                    key={dns}
                                    className="badge rounded-pill px-3 py-2 fw-semibold bg-info-subtle text-info-emphasis border border-info-subtle d-flex align-items-center gap-2"
                                >
                                    {dns}
                                    <i
                                        role="button"
                                        className="bi bi-x-circle-fill"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleRemove(dns)}
                                    />
                                </span>
                            ))}
                        </div>
                    </Col>
                );
            }}
        />
    );
}