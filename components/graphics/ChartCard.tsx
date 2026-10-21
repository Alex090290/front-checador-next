"use client";

import moment from "moment-timezone";
import { Col, Form } from "react-bootstrap";
import { ReactNode } from "react";
import Loading from "../LoadingSpinner";

const FIRST_YEAR = 2026;

// Año y trimestre actuales en hora de México
export function currentYearQuarter() {
    const now = moment.tz("America/Mexico_City");
    return { year: now.year(), quarter: Math.ceil((now.month() + 1) / 3) };
}

export function yearOptions(): number[] {
    const { year } = currentYearQuarter();
    const years: number[] = [];
    for (let y = year; y >= FIRST_YEAR; y--) years.push(y);
    return years.length ? years : [year];
}

export function YearSelect({ id, value, onChange }: { id: string; value: number; onChange: (year: number) => void }) {
    return (
        <Form.Select
            id={id}
            size="sm"
            aria-label="Año"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: "auto" }}
        >
            {yearOptions().map((y) => (
                <option key={y} value={y}>{y}</option>
            ))}
        </Form.Select>
    );
}

// Tarjeta común de las gráficas del dashboard: título, filtros y el estado (cargando / mensaje del back / vacío)
export default function ChartCard({
    title,
    subtitle,
    icon,
    controls,
    loading,
    message,
    children,
}: {
    title: string;
    subtitle?: string;
    icon: string;
    controls?: ReactNode;
    loading: boolean;
    message?: string;
    children: ReactNode;
}) {
    return (
        <Col xs={12} lg={6}>
            <div className="border rounded-3 p-3 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div style={{ minWidth: 0 }}>
                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                            <i className={`bi bi-${icon} text-primary`} />
                            {title}
                        </h6>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                    <div className="d-flex gap-2">{controls}</div>
                </div>

                <div className="position-relative flex-grow-1" style={{ height: 300 }}>
                    {/* Mientras carga se usa el loading del sistema (pantalla completa), no un texto propio */}
                    {loading ? (
                        <Loading message="Cargando gráficas..." />
                    ) : message ? (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted small text-center px-3">
                            <i className="bi bi-bar-chart fs-3 mb-2" />
                            {message}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </Col>
    );
}
