/**
 * Stories Page - Main Stories View
 * 
 * Route: /stories
 * 
 * Purpose: Shows user's articles organized by status
 * 
 * Features:
 * - Tab navigation: Unpublished | Published | Scheduled
 * - Article cards with thumbnail, title, excerpt
 * - Author info and date
 * - Manage your own articles
 */

'use client';

import { useState } from 'react';

// Placeholder article data
const unpublishedArticles = [
  {
    id: 1,
    author: 'Emma Richardson',
    date: 'Dec 12, 2025',
    title: 'Why Green is the best colour',
    excerpt: 'We all have a favourite colour that we love. While there are certainly a plethora of colours and a plethora of reasons to choose one, I\'m going to to prove to you definitively why green is the right answer.',
  },
  {
    id: 2,
    author: 'Emma Richardson',
    date: 'Dec 3, 2025',
    title: '<<Title for a fashion article>>',
    excerpt: 'The best season of all is fashion week. [10 looks]. [Inspired by spring]. (High cature meets functionality?)',
  },
  {
    id: 3,
    author: 'Emma Richardson',
    date: 'Aug 3, 2025',
    title: 'Test Draft......',
    excerpt: 'nsjsnsjsisls gnialnisk ankicsmkcsmknakskmsksck',
  },
];

const publishedArticles = [
  {
    id: 1,
    author: 'Emma Richardson',
    date: 'Nov 15, 2025',
    title: 'The Art of Minimalist Design',
    excerpt: 'Discover how less can truly be more in modern design principles.',
  },
];

const scheduledArticles = [
  {
    id: 1,
    author: 'Emma Richardson',
    date: 'Jan 15, 2026',
    title: 'New Year, New Design Trends',
    excerpt: 'Explore the upcoming design trends that will dominate 2026.',
    scheduledFor: 'Jan 15, 2026 at 9:00 AM',
  },
];

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState('unpublished');

  const getArticles = () => {
    switch (activeTab) {
      case 'published':
        return publishedArticles;
      case 'scheduled':
        return scheduledArticles;
      default:
        return unpublishedArticles;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Tab Navigation */}
        <div className="flex gap-12 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('unpublished')}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === 'unpublished'
                ? 'text-[#111827]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Unpublished
            {activeTab === 'unpublished' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === 'published'
                ? 'text-[#111827]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Published
            {activeTab === 'published' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-4 text-lg font-medium transition-colors relative ${
              activeTab === 'scheduled'
                ? 'text-[#111827]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Scheduled
            {activeTab === 'scheduled' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111827]"></div>
            )}
          </button>
        </div>

        {/* Article List */}
        <div className="space-y-6">
          {getArticles().map((article) => (
            <article key={article.id} className="flex gap-6 pb-6 border-b border-gray-100">
              {/* Article Content */}
              <div className="flex-1">
                {/* Author Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-medium text-[#111827]">{article.author}</span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-400">{article.date}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-[#111827] mb-2 hover:text-[#1ABC9C] cursor-pointer transition-colors">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                {/* Scheduled Info */}
                {article.scheduledFor && (
                  <div className="flex items-center gap-2 text-sm text-[#1ABC9C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Scheduled for {article.scheduledFor}</span>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-32 h-24 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] rounded-lg"></div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {getArticles().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No articles found in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
}
