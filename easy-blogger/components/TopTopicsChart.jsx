"use client";

import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import topTopics from "../data/topTopics.json";

export default function TopTopicsChart() {
  const data = {
    labels: topTopics.labels,
    datasets: [
      {
        label: "Topic Popularity",
        data: topTopics.values,
        backgroundColor: [
          "#6366F1",
          "#8B5CF6",
          "#EC4899",
          "#F43F5E",
          "#F97316",
          "#EAB308",
          "#22C55E",
          "#14B8A6",
          "#0EA5E9",
          "#64748B",
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Top 10 Most Popular Topics",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.05)",
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow">
      <Bar data={data} options={options} />
    </div>
  );
}