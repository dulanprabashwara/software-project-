/**
 * AI Article Generator Page
 *
 * Route: /ai-generate
 *
 * Purpose: AI-powered article generation with trending articles display
 * Features:
 * - Trending articles slider with auto-play
 * - User input for article ideas (50-word limit)
 * - Keyword selection
 * - Article length and tone selection
 * - Generate AI articles
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AIArticleGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("input"); // "input" or "keywords"
  const [userInput, setUserInput] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength, setArticleLength] = useState("short");
  const [tone, setTone] = useState("professional");
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const intervalRef = useRef(null);

  // Trending articles data
  const trendingArticles = [
    {
      title: "The Future of Artificial Intelligence in Healthcare",
      author: "Dr. Sarah Chen",
      readTime: "8 min read",
      excerpt: "Exploring how AI is revolutionizing medical diagnosis and treatment..."
    },
    {
      title: "Sustainable Living: Small Changes, Big Impact",
      author: "Michael Green",
      readTime: "5 min read", 
      excerpt: "Simple daily habits that can significantly reduce your carbon footprint..."
    },
    {
      title: "The Rise of Remote Work Culture",
      author: "Emma Johnson",
      readTime: "6 min read",
      excerpt: "How companies are adapting to the new normal of distributed teams..."
    }
  ];

  // Keywords data
  const keywords = [
    "Machine learning", "Deep learning", "Neural networks", "Data science",
    "Artificial intelligence", "Python", "TensorFlow", "PyTorch", "Algorithms",
    "Big data", "Cloud computing", "Cybersecurity", "Blockchain", "IoT"
  ];

  // Insights sidebar data - Top AI assisted articles
  const topAIArticles = [
    { title: "Understanding Neural Networks", views: "12.5K" },
    { title: "Python for Data Science", views: "10.2K" },
    { title: "Machine Learning Basics", views: "8.7K" },
    { title: "AI Ethics and Governance", views: "7.3K" }
  ];

  // Trending topics
  const trendingTopics = [
    "Technology", "Health", "Business", "Science", "Education", "Environment"
  ];

  // Auto-play slider
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trendingArticles.length]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleManualSlide = (direction) => {
    if (direction === "next") {
      setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
    } else {
      setCurrentArticleIndex((prev) => (prev - 1 + trendingArticles.length) % trendingArticles.length);
    }
    // Reset auto-play timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
      }, 15000);
    }
  };

  const handleUserInputChange = (e) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);
    if (words.length <= 50) {
      setUserInput(text);
    }
  };

  const handleContinueToKeywords = () => {
    if (userInput.trim()) {
      setCurrentView("keywords");
    }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleGenerateArticle = () => {
    if (selectedKeywords.length > 0) {
      // Handle article generation
      console.log("Generating article with:", {
        input: userInput,
        keywords: selectedKeywords,
        length: articleLength,
        tone: tone
      });
    }
  };

  const isGenerateButtonDisabled = selectedKeywords.length === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0"}`}>
          <div className="flex">
            {/* AI Article Generator Main Section */}
            <div className="flex-1 bg-[#FAFAFA] min-h-screen p-8">
              {/* Title Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {/* AI Article Generator Symbol */}
                  <div className="w-10 h-10 bg-[#1ABC9C] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      <circle cx="18" cy="18" r="2" fill="white"/>
                      <path d="M16 8h2v2h-2z" fill="white"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-[#1ABC9C]">AI Article Generator</h1>
                </div>
                
                {/* Menu Bar */}
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#E8F8F5] rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-[#1ABC9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Trending Articles Slider */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-[#1ABC9C] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#1ABC9C]">Trending Articles</h2>
                </div>
                
                <div className="relative bg-[#DEEAE8] rounded-xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between">
                    {/* Previous Button */}
                    <button 
                      onClick={() => handleManualSlide("prev")}
                      className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <svg className="w-5 h-5 text-[#1ABC9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    
                    {/* Article Content */}
                    <div className="flex-1 mx-8 text-center" style={{ fontFamily: "Georgia, serif" }}>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {trendingArticles[currentArticleIndex].title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        By {trendingArticles[currentArticleIndex].author} • {trendingArticles[currentArticleIndex].readTime}
                      </p>
                      <p className="text-gray-700">
                        {trendingArticles[currentArticleIndex].excerpt}
                      </p>
                    </div>
                    
                    {/* Next Button */}
                    <button 
                      onClick={() => handleManualSlide("next")}
                      className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <svg className="w-5 h-5 text-[#1ABC9C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Slider Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {trendingArticles.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentArticleIndex ? "bg-[#1ABC9C]" : "bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* User Input Section */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-4">Hello, what do you hope to write today</p>
                
                {currentView === "input" ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <textarea
                      value={userInput}
                      onChange={handleUserInputChange}
                      placeholder="Enter your article idea (up to 50 words)..."
                      className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#1ABC9C]"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">
                        {userInput.trim().split(/\s+/).filter(word => word.length > 0).length}/50 words
                      </span>
                      <button
                        onClick={handleContinueToKeywords}
                        disabled={!userInput.trim()}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
                          userInput.trim()
                            ? "bg-[#1ABC9C] text-white hover:bg-[#16a085]"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Continue to Keywords
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Keyword Selection Section */
                  <div className="space-y-6">
                    {/* Keywords */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-medium mb-4" style={{ fontFamily: "Roboto, sans-serif" }}>
                        Choose the keywords which defines your article content
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {keywords.map((keyword) => (
                          <button
                            key={keyword}
                            onClick={() => handleKeywordToggle(keyword)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedKeywords.includes(keyword)
                                ? "bg-[#1ABC9C] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        Selected: {selectedKeywords.length} keywords
                      </p>
                    </div>

                    {/* Article Length */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Length
                      </label>
                      <select
                        value={articleLength}
                        onChange={(e) => setArticleLength(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1ABC9C]"
                      >
                        <option value="short">Short 300-1000</option>
                        <option value="mid-length">Mid-length 1000-2000</option>
                        <option value="long">Long 2000+</option>
                      </select>
                    </div>

                    {/* Tone Selection */}
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Tone
                      </label>
                      <div className="space-y-3">
                        {["humorous", "professional", "casual"].map((toneOption) => (
                          <label key={toneOption} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="tone"
                              value={toneOption}
                              checked={tone === toneOption}
                              onChange={(e) => setTone(e.target.value)}
                              className="w-5 h-5 text-[#1ABC9C] focus:ring-[#1ABC9C]"
                            />
                            <span className="capitalize text-gray-700">{toneOption}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerateArticle}
                      disabled={isGenerateButtonDisabled}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-colors ${
                        isGenerateButtonDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-[#1ABC9C] text-white hover:bg-[#16a085]"
                      }`}
                    >
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#1ABC9C]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      Generate AI Article
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Insights Sidebar */}
            <div className="w-80 bg-[#F6F6F6] min-h-screen p-6 border-l border-gray-200">
              {/* Insights Title */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#1ABC9C] rounded-full"></div>
                  <div className="w-2 h-2 bg-[#1ABC9C] rounded-full"></div>
                </div>
                <h2 className="text-lg font-bold text-gray-800">Insights</h2>
              </div>

              {/* Top AI Assisted Articles */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Top AI assisted articles</h3>
                <div className="space-y-3">
                  {topAIArticles.map((article, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-800 mb-1">{article.title}</h4>
                      <p className="text-xs text-gray-500">{article.views} views</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm hover:bg-[#1ABC9C] hover:text-white transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
