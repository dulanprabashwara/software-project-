"use client";
import { useState, useEffect, useCallback } from "react";
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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ArrowLeft, Calendar, Loader2 , Download} from "lucide-react";

import { auth } from "../../../lib/firebase"; 
import { api } from "../../../lib/api";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,Filler);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [view, setView] = useState("platform"); // "platform" | "engagement"
  const [timeframe, setTimeframe] = useState("30"); // "7" | "30"
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await api.getAdminDashboard(token);
          setStats(response.data);
        } catch (err) {
          setError("Could not load analytics. Make sure the backend server is running!");
        }
      } else {
        setError("You must be logged in to view this page.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchChartData = useCallback(async () => {
    if (view === "platform") return; // Platform data is already in initial 'stats'
    
    setChartLoading(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      // We ask the backend for specifically the engagement data for X days
      const response = await api.getEngagementAnalytics(token, timeframe); 
      
      // Update only the engagement part of our state
      setStats(prev => ({
        ...prev,
        engagementData: response.data
      }));
    } catch (err) {
      console.error("Failed to fetch engagement data:", err);
    } finally {
      setChartLoading(false);
    }
  }, [view, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  if (error) return <div className="p-8 text-red-500 font-bold">{error}</div>;
  if (!stats) return <div className="p-8 text-gray-500">Loading Dashboard Analytics...</div>;

  const downloadCSV = () => {
    if (!stats || !stats.chartData) return;

    // 1. Create the CSV Header row
    let csvContent = "Date,Reads,Ratings,Comments\n";

    // 2. Loop through the arrays and build the rows
    const labels = stats.chartData.labels;
    const reads = stats.chartData.datasets.reads;
    const ratings = stats.chartData.datasets.ratings;
    const comments = stats.chartData.datasets.comments;

    for (let i = 0; i < labels.length; i++) {
      csvContent += `${labels[i]},${reads[i]},${ratings[i]},${comments[i]}\n`;
    }

    // 3. Create a Blob and trigger the browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Names the file "platform_analytics_2026-05-03.csv" dynamically
    link.setAttribute("download", `platform_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
        min: 0,
        ticks: { stepSize: 100, color: '#6B7280' },
        grid: { color: '#E5E7EB', drawBorder: false }
      },
      x: {
        ticks: { color: '#6B7280', maxRotation: 45, minRotation: 45 },
        grid: { display: false, drawBorder: true, borderColor: '#D1D5DB' }
      }
    }
  };

  const currentChartData = view === "platform" ? {
    labels: stats.chartData.labels,
    datasets: [
      {
        label: 'Reads',
        data: stats.chartData.datasets.reads,
        borderColor: '#1E6091', // Dark blue
        backgroundColor: '#1E6091',
        tension: 0.3, 
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
  }: {
    labels: stats.engagementData?.labels || [],
    datasets: [{
      label: 'Daily Active Users',
      data: stats.engagementData?.values || [],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.3
    }]
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

        {/* TOGGLE CARD */}
        <button 
          onClick={() => setView(view === "engagement" ? "platform" : "engagement")}
          className={`block transform hover:scale-[1.02] transition-all text-left outline-none rounded-2xl ${view === "engagement" ? 'ring-4 ring-[#8B5CF6] ring-offset-2' : ''}`}
        >
          <div className={`${view === "engagement" ? 'bg-[#8B5CF6]' : 'bg-linear-to-br from-[#1ABC9C] to-[#128A72]'} rounded-2xl p-6 text-center h-full flex flex-col justify-center shadow-md transition-colors`}>
            <p className="text-white/90 text-sm mb-2">Daily Engagement</p>
            <h3 className="text-white text-4xl font-bold">{stats.kpis.dailyEngagement}</h3>
          </div>
        </button>
      </div>

      {/* CHART CONTAINER */}
      <div className="bg-gray-200/60 p-4 rounded-[2.5rem]">
        <div className="bg-white rounded-3xl p-8 shadow-sm min-h-125 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-700 flex items-center gap-3">
              {view === "engagement" && (
                <button onClick={() => setView("platform")} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <ArrowLeft size={20} />
                </button>
              )}
              {view === "platform" ? "Platform Activity (30 Days)" : "Engagement Trend"}
            </h2>

            {/* THE NEW BUTTON AREA */}
            <div className="flex gap-4 items-center">
              {view === "platform" && (
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 bg-[#1E6091] hover:bg-[#164a72] text-white px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              )}

              {view === "engagement" && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                  <Calendar size={16} className="text-gray-400" />
                  <select 
                    value={timeframe} 
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-gray-600 outline-none cursor-pointer"
                  >
                    <option value="7">Last Week</option>
                    <option value="30">Last Month</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {chartLoading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl transition-all">
                <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6] mb-3" />
                <p className="text-sm font-bold text-gray-500 animate-pulse">Syncing latest data...</p>
              </div>
            ) : null}
              <Line data={currentChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}