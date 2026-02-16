// Admin Moderation queue Page

"use client";
import { useState, useEffect } from 'react';

export default function QueuePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the Mock Data
  useEffect(() => {
    // In a real app, this fetches from /api/reports
    // For now, we simulate a delay to show the "Loading..." skeleton
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake 1s delay
      
      setReports([
        { id: 101, reason: "Hate Speech", postTitle: "Politics Discussion", reporter: "user_22" },
        { id: 102, reason: "Spam", postTitle: "Win an iPhone 15", reporter: "bot_hunter" },
        { id: 103, reason: "Harassment", postTitle: "Reply to John", reporter: "anon_99" },
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // 2. Handle the "Delete" Action (For the Demo)
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setReports(reports.filter(report => report.id !== id));
      alert("Post deleted and user warned!");
    }
  };

  // 3. Handle the "Dismiss" Action
  const handleDismiss = (id) => {
    setReports(reports.filter(report => report.id !== id));
    // No alert needed, just remove it cleanly
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-2">Fetching reports...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Moderation Queue ({reports.length})</h2>
      
      {reports.length === 0 ? (
        <div className="alert alert-success">
          <span>All caught up! No pending reports.</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="card bg-base-100 shadow-md border hover:shadow-lg transition">
              <div className="card-body p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="card-title text-base">{report.postTitle}</h3>
                    <div className="badge badge-error text-white badge-sm mt-1">{report.reason}</div>
                    <p className="text-xs text-gray-400 mt-2">Reported by: {report.reporter}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDismiss(report.id)}
                      className="btn btn-sm btn-ghost"
                    >
                      Keep
                    </button>
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="btn btn-sm btn-error text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
