"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const GraphicOne = () => {
    const data = {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
        datasets: [
            {
                label: "Dataset",
                data: [20, -40, 60, 80, -20, 100],
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                pointStyle: "circle" as const,
                pointRadius: 10,
                pointHoverRadius: 15,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: "Point Style: circle",
            },
            legend: {
                display: true,
            },
        },
    };

    return (
        <div className="w-100 h-100 position-relative">
            <Line data={data} options={options} />
        </div>
    );
};

export default GraphicOne;