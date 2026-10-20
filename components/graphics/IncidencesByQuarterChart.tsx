"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { getIncidencesByQuarter } from "@/app/actions/statisticsCompany-actions";
import { IIncidencesByQuarter } from "@/lib/statisticsCompany/interface";
import ChartCard, { currentYearQuarter, YearSelect } from "./ChartCard";
import { useChartTheme, withAlpha } from "./useChartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type IncidenceKey = Exclude<keyof IIncidencesByQuarter, "quarter">;

// Mismos tipos y colores que las tarjetas de "Incidencias del año"
const SERIES: { key: IncidenceKey; label: string; color: string }[] = [
    { key: "permissions", label: "Permisos", color: "primary" },
    { key: "vacations", label: "Vacaciones", color: "pink" },
    { key: "inabilities", label: "Incapacidades", color: "orange" },
    { key: "overtime", label: "Horas extra", color: "teal" },
    { key: "penalties", label: "Penalizaciones", color: "danger" },
    { key: "justifiedAbsences", label: "Faltas justificadas", color: "success" },
    { key: "unjustifiedAbsences", label: "Faltas injustificadas", color: "purple" },
];

const QUARTER_LABELS = ["T1 (ene–mar)", "T2 (abr–jun)", "T3 (jul–sep)", "T4 (oct–dic)"];

// Incidencias del año por trimestre, en barras apiladas por tipo
export default function IncidencesByQuarterChart() {
    const [year, setYear] = useState(currentYearQuarter().year);
    const [rows, setRows] = useState<IIncidencesByQuarter[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [hidden, setHidden] = useState(false);
    const theme = useChartTheme();

    useEffect(() => {
        let active = true;
        setLoading(true);

        getIncidencesByQuarter(year)
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
    }, [year]);

    if (hidden) return null;

    const byQuarter = [1, 2, 3, 4].map((q) => rows.find((r) => Number(r.quarter) === q));
    const total = (row?: IIncidencesByQuarter) => SERIES.reduce((sum, s) => sum + (Number(row?.[s.key]) || 0), 0);
    const allZero = byQuarter.every((row) => total(row) === 0);

    const data: ChartData<"bar"> = {
        labels: QUARTER_LABELS,
        datasets: SERIES.map((s) => ({
            label: s.label,
            data: byQuarter.map((row) => Number(row?.[s.key]) || 0),
            backgroundColor: withAlpha(theme.colors[s.color], 0.6),
            borderColor: theme.colors[s.color],
            borderWidth: 1,
            stack: "incidencias",
        })),
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { position: "top", labels: { color: theme.text, boxWidth: 12, font: { size: 11 } } },
            tooltip: {
                backgroundColor: theme.tooltipBg,
                // Solo los tipos con incidencias, más el total del trimestre
                filter: (item) => Number(item.raw) > 0,
                callbacks: {
                    footer: (items) => {
                        const row = byQuarter[items[0]?.dataIndex ?? 0];
                        return `Total: ${total(row)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: { color: theme.muted },
                grid: { color: theme.grid },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { color: theme.muted, precision: 0 },
                grid: { color: theme.grid },
            },
        },
    };

    return (
        <ChartCard
            title="Incidencias por trimestre"
            subtitle="Total de la empresa por tipo"
            icon="calendar3"
            loading={loading}
            message={message || (allZero ? "Sin incidencias registradas en este año" : "")}
            controls={<YearSelect id="incidences-quarter-year" value={year} onChange={setYear} />}
        >
            <Bar data={data} options={options} />
        </ChartCard>
    );
}
