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
import "@/styles/ai article generator/ai-article-generator.css";

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
      excerpt: "Exploring how AI is revolutionizing medical diagnosis and treatment...",
      publishDate: "31 Dec, 2024",
      comments: 42,
      likes: 128,
      authorImage: "/images/Ai article generator/author image 1.png",
      coverImage: "/images/Ai article generator/cover image 1.png"
    },
    {
      title: "Sustainable Living: Small Changes, Big Impact",
      author: "Michael Green",
      readTime: "5 min read", 
      excerpt: "Simple daily habits that can significantly reduce your carbon footprint...",
      publishDate: "28 Dec, 2024",
      comments: 35,
      likes: 96,
      authorImage: "/images/Ai article generator/author image 2.png",
      coverImage: "/images/Ai article generator/cover image 2.png"
    },
    {
      title: "The Rise of Remote Work Culture",
      author: "Emma Johnson",
      readTime: "6 min read",
      excerpt: "How companies are adapting to the new normal of distributed teams...",
      publishDate: "25 Dec, 2024",
      comments: 58,
      likes: 167,
      authorImage: "/images/Ai article generator/author image 3.png",
      coverImage: "/images/Ai article generator/cover image 3.png"
    },
    {
      title: "Machine Learning Fundamentals for Beginners",
      author: "Alex Kumar",
      readTime: "7 min read",
      excerpt: "A comprehensive guide to understanding the basics of machine learning...",
      publishDate: "22 Dec, 2024",
      comments: 73,
      likes: 234,
      authorImage: "/images/Ai article generator/author image 4.png",
      coverImage: "/images/Ai article generator/cover image 4.png"
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
    const words = text.trim().split(' ');
    // Enforce 50-word limit for user input
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
    // Toggle keyword selection with state management
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
    <div className="h-screen bg-white overflow-hidden flex">
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />
      
      <div className="flex pt-16 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-0"}`}>
          <div className="flex h-full">
            {/* AI Article Generator Main Section */}
            <div className="ai-generator-main flex-1 overflow-y-auto">
              {/* Title Section */}
              <div className="ai-generator-title justify-between">
                <div className="flex items-center gap-3">
                  {/* Menu Icon */}
                  <img 
                    src="/icons/menu icon.png" 
                    alt="Menu" 
                    className="ai-generator-menu-icon"
                  />
                  
                  {/* AI Article Generator Symbol */}
                  <img 
                    src="/icons/Ai article generator icon teel color.png" 
                    alt="AI Article Generator" 
                    className="ai-generator-ai-icon"
                  />
                  
                  <h1 className="ai-generator-title-text">AI Article Generator</h1>
                </div>
              </div>

              {currentView === "input" && (
                <>
                  {/* Trending Articles Slider */}
                  <div className="trending-section">
                    <div className="trending-header">
                      <img 
                        src="/icons/Trending icon.png" 
                        alt="Trending" 
                        className="trending-icon"
                      />
                      <h2 className="trending-title">Trending Articles</h2>
                    </div>
                    
                    <div className="trending-slider">
                      {/* Previous Button */}
                      <button 
                        onClick={() => handleManualSlide("prev")}
                        className="slider-chevron"
                      >
                        <img 
                          src="/icons/doble chevron icon  (2).png" 
                          alt="Previous" 
                          className="slider-chevron"
                        />
                      </button>
                      
                      {/* Article Content */}
                      <div className="slider-content">
                        <div className="slider-left-content">
                          <div className="author-info">
                            <img 
                              src={trendingArticles[currentArticleIndex].authorImage}
                              alt={trendingArticles[currentArticleIndex].author}
                              className="author-image"
                            />
                            <div className="author-details">
                              <div className="author-name">{trendingArticles[currentArticleIndex].author}</div>
                              <div className="publish-date">{trendingArticles[currentArticleIndex].publishDate}</div>
                            </div>
                          </div>
                          
                          <h3 className="article-title">
                            {trendingArticles[currentArticleIndex].title}
                          </h3>
                          
                          <p className="article-description">
                            {trendingArticles[currentArticleIndex].excerpt}
                          </p>
                          
                          <div className="article-stats">
                            <div className="stat-item">
                              <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                              </svg>
                              <span className="stat-number">{trendingArticles[currentArticleIndex].comments}</span>
                            </div>
                            
                            <div className="stat-item">
                              <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                              </svg>
                              <span className="stat-number">{trendingArticles[currentArticleIndex].likes}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="slider-right-content">
                          <img 
                            src={trendingArticles[currentArticleIndex].coverImage}
                            alt="Article cover" 
                            className="cover-image"
                          />
                          
                          <div className="bookmark-wrapper">
                            <svg className="bookmark-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next Button */}
                      <button 
                        onClick={() => handleManualSlide("next")}
                        className="slider-chevron"
                      >
                        <img 
                          src="/icons/doble chevron icon  (1).png" 
                          alt="Next" 
                          className="slider-chevron"
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* User Input Section */}
              <div>
                <p className="user-prompt-text">Hello, what do you hope to write today</p>
                
                {currentView === "input" ? (
                  <>
                    <div className="user-textbox">
                      <textarea
                        value={userInput}
                        onChange={handleUserInputChange}
                        placeholder="Enter your article idea (up to 50 words)..."
                      />
                      <span className="word-count">
                        {userInput.trim().split(' ').filter(word => word.length > 0).length}/50 words
                      </span>
                    </div>
                    
                    <button
                      onClick={handleContinueToKeywords}
                      disabled={!userInput.trim()}
                      className="continue-button"
                    >
                      <span className="continue-button-text">Continue to Keywords</span>
                      <svg className="continue-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </>
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
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                              selectedKeywords.includes(keyword)
                                ? "bg-[#1ABC9C] text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
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
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1ABC9C] focus:ring-2 focus:ring-[#1ABC9C]/20"
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
                          <label key={toneOption} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <input
                              type="radio"
                              name="tone"
                              value={toneOption}
                              checked={tone === toneOption}
                              onChange={(e) => setTone(e.target.value)}
                              className="w-5 h-5 text-[#1ABC9C] focus:ring-[#1ABC9C]"
                            />
                            <span className="capitalize text-gray-700 font-medium">{toneOption}</span>
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
                        <img 
                          src="/icons/Ai article generator icon white.png" 
                          alt="Generate AI Article" 
                          className="w-4 h-4"
                        />
                      </div>
                      Generate AI Article
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Insights Sidebar */}
            <div className="insights-sidebar">
              {/* Insights Title */}
              <div className="insights-header">
                <div className="insights-dots">
                  <div className="insights-dot-1"></div>
                  <div className="insights-dot-2"></div>
                </div>
                <h2 className="insights-title">Insights</h2>
              </div>

              {/* Top AI Assisted Articles */}
              <div className="mb-8">
                <h3 className="insights-section-title">TOP AI Assisted Articles</h3>
                <div className="space-y-3">
                  {topAIArticles.map((article, index) => (
                    <div key={index} className="insights-article-section">
                      <h4 className="insights-article-name">{article.title}</h4>
                      <p className="insights-author-name">{article.views} views</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h3 className="insights-section-title">Trending topics</h3>
                <div className="trending-topics-buttons">
                  {trendingTopics.map((topic, index) => (
                    <button
                      key={index}
                      className="topic-button"
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
