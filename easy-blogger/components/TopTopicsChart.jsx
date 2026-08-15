"use client";
import { Bar } from "react-chartjs-2";
import { usePopularTags } from "../hooks/usePopularTags";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// 1. Register Chart.js components (required to prevent crashes)
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TopTopicsChart() {
  // 2. Call the hook properly to get the data and loading state
  const { tags, isLoading } = usePopularTags();

  // 3. Show a loading screen while data fetches
  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading chart...</p>
      </div>
    );
  }

  // 4. Show a fallback if there is no data
  if (!tags || tags.length === 0) {
    return (
      <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow flex items-center justify-center">
        <p className="text-gray-500">No trending topics right now.</p>
      </div>
    );
  }

  const data = {
    // 5. Map over the array to pull out the labels and counts
    labels: tags.map((item) => item.name),
    datasets: [
      {
        label: "Articles",
        data: tags.map((item) => item.count),
        backgroundColor: [
          "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
          "#F97316", "#EAB308", "#22C55E", "#14B8A6",
          "#0EA5E9", "#64748B",
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
        // Ensures the Y-axis only shows whole numbers (1, 2, 3 instead of 1.5)
        ticks: {
          stepSize: 1, 
        },
      },
    },
  };

  return (
    // 6. Replaced invalid "h-100" with "h-[400px]"
    <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow">
      <Bar data={data} options={options} />
    </div>
  );
}