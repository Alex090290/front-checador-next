"use client";

import {
    ArcElement,
    Chart,
    ChartEvent,
    Chart as ChartJS,
    Legend,
    LegendElement,
    LegendItem,
    Title,
    Tooltip,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const GraphicTwo = () => {
  const handleHover = (
    _: ChartEvent,
    item: LegendItem,
    legend: LegendElement<"pie">
  ) => {
    const chart = legend.chart as Chart<"pie">;
    const colors = chart.data.datasets[0].backgroundColor as string[];

    colors.forEach((color, index) => {
      colors[index] =
        index === item.index || color.length === 9 ? color : color + "4D";
    });

    chart.update();
  };

  const handleLeave = (
    _: ChartEvent,
    __: LegendItem,
    legend: LegendElement<"pie">
  ) => {
    const chart = legend.chart as Chart<"pie">;
    const colors = chart.data.datasets[0].backgroundColor as string[];

    colors.forEach((color, index) => {
      colors[index] = color.length === 9 ? color.slice(0, -2) : color;
    });

    chart.update();
  };

  const data = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "#CB4335",
          "#1F618D",
          "#F1C40F",
          "#27AE60",
          "#884EA0",
          "#D35400",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        onHover: handleHover,
        onLeave: handleLeave,
      },
      title: {
        display: true,
        text: "Distribución de votos",
      },
    },
  };

  return (
    <div className="w-100 h-100 position-relative">
      <Pie data={data} options={options} />
    </div>
  );
};

export default GraphicTwo;