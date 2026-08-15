"use client";

import { useEffect, useState } from "react";
import ArticleCard from "../../../../components/article/ArticleCard";
import { getMyScheduledArticles, rescheduleArticle } from "../../../../lib/articles/api";
import { CalendarClock, X } from "lucide-react";

export default function Scheduled() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const response = await getMyScheduledArticles(1, 20);
      setArticles(response?.data || []);
    } catch (error) {
      console.error("Failed to load scheduled articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  // Open modal and pre-fill date/time values from article
  const handleOpenRescheduleModal = (article) => {
    setRescheduleTarget(article);
    setErrorMessage("");

    const baseDate = article.scheduledAt ? new Date(article.scheduledAt) : new Date(Date.now() + 3600000);
    
    // Format local date YYYY-MM-DD
    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
    const dd = String(baseDate.getDate()).padStart(2, "0");
    setRescheduleDate(`${yyyy}-${mm}-${dd}`);

    // Format local time HH:mm
    const hh = String(baseDate.getHours()).padStart(2, "0");
    const min = String(baseDate.getMinutes()).padStart(2, "0");
    setRescheduleTime(`${hh}:${min}`);
  };

  const handleCloseModal = () => {
    setRescheduleTarget(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setErrorMessage("");
    setIsSubmitting(false);
  };

  // Helper to validate future date
  const getSelectedDateTime = () => {
    if (!rescheduleDate || !rescheduleTime) return null;
    const dt = new Date(`${rescheduleDate}T${rescheduleTime}`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  const selectedDateTime = getSelectedDateTime();
  const isPastTime = Boolean(selectedDateTime && selectedDateTime <= new Date());
  const isValidSelection = Boolean(selectedDateTime && !isPastTime);

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget || !isValidSelection) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await rescheduleArticle(rescheduleTarget.id, selectedDateTime.toISOString());
      handleCloseModal();
      await loadArticles();
    } catch (error) {
      console.error("Reschedule failed:", error);
      setErrorMessage(error?.message || "Failed to reschedule article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Min date string for input (today)
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <section className="px-8 min-w-0">
      <div className="w-full">
        {isLoading ? (
          <p className="text-sm text-brand-muted py-6">Loading scheduled articles...</p>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-brand-muted">
            <p className="text-base font-medium">You have not scheduled any articles yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              When you schedule an article to publish later, it will appear here.
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article}
              onReschedule={handleOpenRescheduleModal}
            />
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-black p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
              <CalendarClock className="w-6 h-6 text-brand-primary" />
            </div>

            <h3 className="text-xl font-bold text-brand-black mb-1">Reschedule Article</h3>
            <p className="text-sm text-brand-muted mb-6 line-clamp-1">
              {rescheduleTarget.title || "Untitled Article"}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Select Date
                </label>
                <input 
                  type="date"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-primary border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Select Time
                </label>
                <input 
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-primary border-gray-300"
                />
              </div>

              {isPastTime && (
                <p className="text-xs text-red-500 font-medium">
                  Scheduled time must be in the future.
                </p>
              )}

              {errorMessage && (
                <p className="text-xs text-red-500 font-medium">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={handleCloseModal} 
                disabled={isSubmitting}
                className="px-4 py-2.5 text-sm font-semibold text-brand-muted bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReschedule} 
                disabled={isSubmitting || !isValidSelection}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
