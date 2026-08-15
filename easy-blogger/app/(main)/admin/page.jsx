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
import { ArrowLeft, Calendar, Loader2, Download, FileText, Activity } from "lucide-react";

import { auth } from "../../../lib/firebase";
import { api } from "../../../lib/api";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Helper function for relative time
const timeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [feeds, setFeeds] = useState({ recentArticles: [], recentActivity: [] });
  const [feedsLoading, setFeedsLoading] = useState(true);

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

          const feedRes = await api.getDashboardFeeds(token);
          if (feedRes.success || feedRes.data) {
            setFeeds(feedRes.data);
          }

        } catch (err) {
          setError("Could not load analytics. Make sure the backend server is running!");
        } finally {
          setFeedsLoading(false);
        }
      } else {
        setError("You must be logged in to view this page.");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchChartData = useCallback(async () => {
    if (view === "platform") return;

    setChartLoading(true);
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await api.getEngagementAnalytics(token, timeframe);

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

    // CSV Header row
    let csvContent = "Date,Reads,Ratings,Comments\n";

    //Loop through the arrays and build the rows
    const labels = stats.chartData.labels;
    const reads = stats.chartData.datasets.reads;
    const ratings = stats.chartData.datasets.ratings;
    const comments = stats.chartData.datasets.comments;

    for (let i = 0; i < labels.length; i++) {
      csvContent += `${labels[i]},${reads[i]},${ratings[i]},${comments[i]}\n`;
    }

    // Blob and trigger the browser download
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
        borderColor: '#1E6091',
        backgroundColor: '#1E6091',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Ratings',
        data: stats.chartData.datasets.ratings,
        borderColor: '#F28C28',
        backgroundColor: '#F28C28',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Comments',
        data: stats.chartData.datasets.comments,
        borderColor: '#116C31',
        backgroundColor: '#116C31',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  } : {
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

      {/* KPI CARDS - Interactive Links */}
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

            {/* EXPORT BUTTON */}
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

      {/* FEEDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        
        {/* Recent Articles Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-[#1ABC9C]" size={20} />
              Recent Articles
            </h2>
          </div>
          
          {feedsLoading ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg w-full"></div>)}
            </div>
          ) : feeds.recentArticles.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No recent articles found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {feeds.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img 
                      src={article.author?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.displayName || 'User')}&background=1ABC9C&color=fff`} 
                      alt="Author" 
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{article.title}</p>
                      <p className="text-xs text-gray-500">{article.author?.displayName || 'Unknown Author'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${article.status === 'PUBLISHED' ? 'bg-[#E8F8F5] text-[#1ABC9C]' : 'bg-gray-100 text-gray-600'}`}>
                      {article.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(article.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Pulse Card */}
        {/* Platform Pulse Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-[#3B82F6]" size={20} />
              Platform Pulse
            </h2>
          </div>
          
          {feedsLoading ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg w-full"></div>)}
            </div>
          ) : feeds.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No activity events found yet.</p>
          ) : (
            <div className="flex flex-col">
              {feeds.recentActivity.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  {/* The Timeline Line & Dot */}
                  <div className="flex flex-col items-center relative min-w-[12px]">
                    <div className="w-3 h-3 rounded-full border-2 border-[#3B82F6] bg-white mt-1.5 z-10 relative" />
                    {/* Hides the line on the very last item for a cleaner look */}
                    {index !== feeds.recentActivity.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 absolute top-3" />
                    )}
                  </div>
                  
                  {/* The Content Card */}
                  <div className="flex-1 pb-5">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">
                          {event.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {timeAgo(event.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{event.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}