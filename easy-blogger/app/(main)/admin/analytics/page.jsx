'use client';

import React, { useEffect, useState } from 'react';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { api } from '../../../../lib/api'; 
import { auth } from '../../../../lib/firebase'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          // Call it from the api object with the token
          const response = await api.getAnalyticsCharts(token);
          
          if (response.success) {
            setAnalyticsData(response.data);
          }
        } catch (err) {
          console.error("Failed to load analytics:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError("You must be logged in to view analytics.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="p-8 text-gray-500">Loading advanced analytics...</div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          {error || "Failed to load analytics data. Please check your connection or backend terminal."}
        </div>
      </div>
    );
  }

  // User Demographics (Donut Chart)
  const demographicsConfig = {
    labels: ['Premium Users', 'Regular Users'],
    datasets: [{
      data: [analyticsData.demographics.premium, analyticsData.demographics.regular],
      backgroundColor: ['#8B5CF6', '#E5E7EB'], 
      hoverBackgroundColor: ['#7C3AED', '#D1D5DB'],
      borderWidth: 0,
    }]
  };

  // Growth (Mixed Bar & Line Chart)
  const growthConfig = {
    labels: analyticsData.growth.labels,
    datasets: [
      {
        type: 'line',
        label: 'Growth Trend',
        data: analyticsData.growth.values,
        borderColor: '#3B82F6', 
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        type: 'bar',
        label: 'New Users',
        data: analyticsData.growth.values,
        backgroundColor: 'rgba(59, 130, 246, 0.15)', 
        borderRadius: 4,
      }
    ]
  };

  // Content Usage (Radar Chart)
  const usageConfig = {
    labels: ['Reads', 'Comments', 'Ratings', 'Shares'],
    datasets: [{
      label: 'Platform Engagement',
      data: [
        analyticsData.usage.reads,
        analyticsData.usage.comments,
        analyticsData.usage.ratings,
        analyticsData.usage.shares
      ],
      backgroundColor: 'rgba(16, 185, 129, 0.2)', 
      borderColor: '#10B981',
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#10B981'
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Charts</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time data aggregation from your database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Demographics */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full mb-4">
            <h2 className="text-lg font-bold text-gray-900">User Demographics</h2>
            <p className="text-sm text-gray-500">Premium vs Regular distribution</p>
          </div>
          <div className="w-full max-w-[250px] aspect-square">
            <Doughnut 
              data={demographicsConfig} 
              options={{ maintainAspectRatio: true, cutout: '70%', plugins: { legend: { position: 'bottom' } } }} 
            />
          </div>
        </div>

        {/* Middle Column: Growth Trends */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
            <p className="text-sm text-gray-500">Signups over the last 6 months</p>
          </div>
          <div className="h-[300px] w-full">
            <Bar 
              data={growthConfig} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, grid: { color: '#F3F4F6' } }, x: { grid: { display: false } } }
              }} 
            />
          </div>
        </div>

        {/* Bottom Wide Column: Engagement Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-3">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Engagement Radar</h2>
            <p className="text-sm text-gray-500">Distribution of user interactions across the platform</p>
          </div>
          <div className="h-[400px] w-full flex justify-center">
            <div className="w-full max-w-[500px]">
              <Radar 
                data={usageConfig} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { r: { ticks: { display: false } } } 
                }} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}