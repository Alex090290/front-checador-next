"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    BarController,
    LineController,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import moment from "moment";
import { getLunchExcess } from "@/app/actions/statisticsCompany-actions";
import { ILunchExcessPeriod } from "@/lib/statisticsCompany/interface";
import ChartCard, { currentYearQuarter, YearSelect } from "./ChartCard";
import { useChartTheme, withAlpha } from "./useChartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, BarController, LineController, Tooltip, Legend);

function formatMinutes(total: number) {
    const minutes = Math.max(Math.round(total), 0);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

const shortDate = (value: string) => moment(value, "YYYY-MM-DD").format("DD/MM");
const longDate = (value: string) => moment(value, "YYYY-MM-DD").format("DD/MM/YYYY");

// Exceso de tiempo de comida por periodo del trimestre: barras = horas excedidas, línea = empleados distintos
export default function LunchExcessChart() {
    const initial = currentYearQuarter();
    const [year, setYear] = useState(initial.year);
    const [quarter, setQuarter] = useState(initial.quarter);
    const [rows, setRows] = useState<ILunchExcessPeriod[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [hidden, setHidden] = useState(false);
    const theme = useChartTheme();

    useEffect(() => {
        let active = true;
        setLoading(true);

        getLunchExcess(year, quarter)
            .then((res) => {
                if (!active) return;
                if (res.forbidden) {
                    setHidden(true);
                    return;
                }
                setRows(res.data);
                setMessage(res.success ? "" : res.message);
            })
            .catch(() => {
                if (active) setMessage("No se pudo cargar la gráfica, intenta de nuevo");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [year, quarter]);

    if (hidden) return null;

    const allZero = rows.every((r) => !r.totalMinutes);
    const emptyMessage = rows.length === 0
        ? "No hay periodos en este trimestre"
        : allZero
            ? "Sin excesos de comida en este trimestre"
            : "";

    const data: ChartData<"bar" | "line"> = {
        labels: rows.map((r) => [`P${r.numberPeriod}`, `${shortDate(r.dateInit)} – ${shortDate(r.dateEnd)}`]),
        datasets: [
            {
                type: "bar" as const,
                label: "Horas excedidas",
                data: rows.map((r) => Math.round((r.totalMinutes / 60) * 10) / 10),
                backgroundColor: withAlpha(theme.colors.orange, 0.35),
                borderColor: theme.colors.orange,
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: "y",
                order: 2,
            },
            {
                type: "line" as const,
                label: "Empleados",
                data: rows.map((r) => r.employees),
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primary,
                pointRadius: 4,
                tension: 0.3,
                yAxisID: "y1",
                order: 1,
            },
        ],
    };

    const options: ChartOptions<"bar" | "line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { position: "top", labels: { color: theme.text, boxWidth: 14 } },
            tooltip: {
                backgroundColor: theme.tooltipBg,
                displayColors: false,
                // Un solo renglón por periodo (no uno por serie)
                filter: (item) => item.datasetIndex === 0,
                callbacks: {
                    title: (items) => {
                        const r = rows[items[0]?.dataIndex ?? 0];
                        return r ? `Periodo ${r.numberPeriod} (${longDate(r.dateInit)} – ${longDate(r.dateEnd)})` : "";
                    },
                    label: (item) => {
                        const r = rows[item.dataIndex];
                        return r ? `Minutos excedidos: ${r.totalMinutes} (${formatMinutes(r.totalMinutes)})` : "";
                    },
                    afterLabel: (item) => {
                        const r = rows[item.dataIndex];
                        return r ? [`Empleados: ${r.employees}`, `Veces: ${r.times}`] : [];
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: theme.muted },
                grid: { color: theme.grid },
            },
            y: {
                beginAtZero: true,
                position: "left",
                title: { display: true, text: "Horas", color: theme.muted },
                ticks: { color: theme.muted },
                grid: { color: theme.grid },
            },
            y1: {
                beginAtZero: true,
                position: "right",
                title: { display: true, text: "Empleados", color: theme.muted },
                ticks: { color: theme.muted, precision: 0 },
                grid: { drawOnChartArea: false },
            },
        },
    };

    return (
        <ChartCard
            title="Exceso de tiempo de comida"
            subtitle="Por periodo del trimestre"
            icon="cup-hot"
            loading={loading}
            message={message || emptyMessage}
            controls={
                <>
                    <YearSelect id="lunch-excess-year" value={year} onChange={setYear} />
                    <Form.Select
                        id="lunch-excess-quarter"
                        size="sm"
                        aria-label="Trimestre"
                        value={quarter}
                        onChange={(e) => setQuarter(Number(e.target.value))}
                        style={{ width: "auto" }}
                    >
                        {[1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>T{q}</option>
                        ))}
                    </Form.Select>
                </>
            }
        >
            <Chart type="bar" data={data} options={options} />
        </ChartCard>
    );
}
