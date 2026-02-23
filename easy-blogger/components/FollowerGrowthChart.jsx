"use client";

import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import growthData from "../data/followerGrowth.json";

export default function FollowerGrowthChart() {

  const data = {
    labels: growthData.weeks,
    datasets: [
      {
        label: "Follower Growth",
        data: growthData.followers,
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Week"
        }
      },
      y: {
        title: {
          display: true,
          text: "Follower Count"
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <Line data={data} options={options} />
    </div>
  );
}