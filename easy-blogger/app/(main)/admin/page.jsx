"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/users?type=dashboardStats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <div className="p-8 text-gray-500">Loading Dashboard Analytics...</div>;

  // Chart Configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { family: 'sans-serif', weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 13, weight: 'bold' },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        min: 0, max: 700,
        ticks: { stepSize: 100, color: '#6B7280' },
        grid: { color: '#E5E7EB', drawBorder: false }
      },
      x: {
        ticks: { color: '#6B7280', maxRotation: 45, minRotation: 45 },
        grid: { display: false, drawBorder: true, borderColor: '#D1D5DB' }
      }
    }
  };

  const chartData = {
    labels: stats.chartData.labels,
    datasets: [
      {
        label: 'Reads',
        data: stats.chartData.datasets.reads,
        borderColor: '#1E6091', // Dark blue
        backgroundColor: '#1E6091',
        tension: 0.3, // Adds the slight curve
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Ratings',
        data: stats.chartData.datasets.ratings,
        borderColor: '#F28C28', // Orange
        backgroundColor: '#F28C28',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Comments',
        data: stats.chartData.datasets.comments,
        borderColor: '#116C31', // Dark green
        backgroundColor: '#116C31',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-8 relative">
      <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: "Georgia, serif" }}>
        Dashboard
      </h1>

      {/* KPI CARDS - Now Interactive Links */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Link href="/admin/moderation/queue" className="block transform hover:scale-[1.02] transition-transform duration-200">
          <div className="bg-linear-to-br from-[#1ABC9C] to-[#128A72] rounded-2xl p-6 shadow-md text-center h-full flex flex-col justify-center">
            <p className="text-white/90 text-sm font-medium mb-2">Pending Reports</p>
            <h3 className="text-white text-4xl font-bold">{stats.kpis.pendingReports}</h3>
          </div>
        </Link>
        
        <Link href="/admin/users?filter=Premium" className="block transform hover:scale-[1.02] transition-transform duration-200">
          <div className="bg-linear-to-br from-[#1ABC9C] to-[#128A72] rounded-2xl p-6 shadow-md text-center h-full flex flex-col justify-center">
            <p className="text-white/90 text-sm font-medium mb-2">Active Premium Users</p>
            <h3 className="text-white text-4xl font-bold">{stats.kpis.activePremiumUsers}</h3>
          </div>
        </Link>

        <Link href="/admin/users" className="block transform hover:scale-[1.02] transition-transform duration-200">
          <div className="bg-linear-to-br from-[#1ABC9C] to-[#128A72] rounded-2xl p-6 shadow-md text-center h-full flex flex-col justify-center">
            <p className="text-white/90 text-sm font-medium mb-2">Total Users</p>
            <h3 className="text-white text-4xl font-bold">{stats.kpis.totalUsers}</h3>
          </div>
        </Link>

        <Link href="/admin/analytics" className="block transform hover:scale-[1.02] transition-transform duration-200">
          <div className="bg-linear-to-br from-[#1ABC9C] to-[#128A72] rounded-2xl p-6 shadow-md text-center h-full flex flex-col justify-center">
            <p className="text-white/90 text-sm font-medium mb-2">Daily Engagement</p>
            <h3 className="text-white text-4xl font-bold">{stats.kpis.dailyEngagement}</h3>
          </div>
        </Link>
      </div>

      {/* CHART CONTAINER */}
      <div className="bg-gray-200/60 p-4 rounded-4xl">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-700 mb-6 font-sans">
            Platform Activity (Last 30 days)
          </h2>
          <div className="h-100 w-full relative">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
      
    </div>
  );
}