"use client";

import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraphicFour = () => {
  const [easing] = useState<
    "easeOutQuad" | "easeOutCubic" | "easeOutQuart" | "easeOutQuint"
  >("easeOutQuad");

  const { dataOne, dataTwo } = useMemo(() => {
    const dataOne: { x: number; y: number }[] = [];
    const dataTwo: { x: number; y: number }[] = [];

    let prev = 100;
    let prev2 = 80;

    for (let i = 0; i < 1000; i++) {
      prev += 5 - Math.random() * 10;
      dataOne.push({ x: i, y: prev });

      prev2 += 5 - Math.random() * 10;
      dataTwo.push({ x: i, y: prev2 });
    }

    return { dataOne, dataTwo };
  }, []);

  const data = {
    datasets: [
      {
        label: "Serie roja",
        borderColor: "#dc3545",
        borderWidth: 1,
        pointRadius: 0,
        data: dataOne,
      },
      {
        label: "Serie azul",
        borderColor: "#0d6efd",
        borderWidth: 1,
        pointRadius: 0,
        data: dataTwo,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 5000,
      easing,
    },
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: easing,
      },
    },
    scales: {
      x: {
        type: "linear" as const,
      },
    },
  };

  return (
    <div className="w-100 h-100 position-relative">
      <Line data={data} options={options} />
    </div>
  );
};

export default GraphicFour;