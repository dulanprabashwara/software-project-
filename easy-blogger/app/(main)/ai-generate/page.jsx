/**
 * AI Generate Page - AI Writing Assistant
 * 
 * Route: /ai-generate
 * 
 * Purpose: AI-powered content generation tools for Premium users
 * 
 * Features:
 * - Generate article ideas
 * - AI-assisted writing
 * - Content suggestions
 * - Tone adjustment
 * - Grammar and style improvements
 * - SEO optimization suggestions
 * 
 * Access: Premium users only
 * Non-premium users will see upgrade prompt
 */

'use client';

import { useState } from 'react';

export default function AIGeneratePage() {
  const [prompt, setPrompt] = useState('');
  const isPremium = false; // Placeholder - would be determined by auth

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#1ABC9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-4">AI Generate</h1>
          <p className="text-gray-500 mb-6">
            Unlock AI-powered writing tools to create better content faster.
            This feature is available for Premium members only.
          </p>
          <button className="px-6 py-3 bg-[#1ABC9C] text-white rounded-full font-medium hover:bg-[#16a085] transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-[#111827] mb-2">AI Generate</h1>
        <p className="text-gray-500 mb-8">Use AI to help you write better content</p>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#D1FAE5] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#1ABC9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">Generate Ideas</h3>
            <p className="text-sm text-gray-500">Get AI-powered article topic suggestions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#DBEAFE] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">Write with AI</h3>
            <p className="text-sm text-gray-500">Co-write articles with AI assistance</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#FEF3C7] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">Improve Writing</h3>
            <p className="text-sm text-gray-500">Enhance grammar, style, and clarity</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#FCE7F3] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">SEO Optimize</h3>
            <p className="text-sm text-gray-500">Get SEO suggestions for better reach</p>
          </div>
        </div>

        {/* Quick Generate */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Generate</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to write about..."
            className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1ABC9C]"
          />
          <button className="mt-4 px-6 py-3 bg-[#1ABC9C] text-white rounded-full font-medium hover:bg-[#16a085] transition-colors">
            Generate Content
          </button>
        </div>
      </div>
    </div>
  );
}
