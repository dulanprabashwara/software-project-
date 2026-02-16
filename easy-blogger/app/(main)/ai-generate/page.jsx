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
import { useRouter } from "next/navigation";
import { useSubscription } from "../../subscription/SubscriptionContext";
import "../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../styles/ai-article-generator/ai-article-generator-view2.css";

export default function AIArticleGeneratorPage() {
  // NOTE: Header and Sidebar are provided by app/(main)/layout.jsx
  // We only need to manage local state for the AI generator features.

  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();
  const [currentView, setCurrentView] = useState("input"); // "input" or "keywords"
  const [userInput, setUserInput] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength, setArticleLength] = useState("short");
  const [tone, setTone] = useState("professional");
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const intervalRef = useRef(null);

  // Trending articles data
  const trendingArticles = [
    {
      title: "The Future of Artificial Intelligence in Healthcare",
      author: "Dr. Sarah Chen",
      readTime: "8 min read",
      excerpt:
        "Exploring how AI is revolutionizing medical diagnosis and treatment...",
      publishDate: "31 Dec, 2024",
      comments: 42,
      likes: 128,
      authorImage: "/images/Ai article generator/author image 1.png",
      coverImage: "/images/Ai article generator/cover image 1.png",
    },
    {
      title: "Sustainable Living: Small Changes, Big Impact",
      author: "Michael Green",
      readTime: "5 min read",
      excerpt:
        "Simple daily habits that can significantly reduce your carbon footprint...",
      publishDate: "28 Dec, 2024",
      comments: 35,
      likes: 96,
      authorImage: "/images/Ai article generator/author image 2.png",
      coverImage: "/images/Ai article generator/cover image 2.png",
    },
    {
      title: "The Rise of Remote Work Culture",
      author: "Emma Johnson",
      readTime: "6 min read",
      excerpt:
        "How companies are adapting to the new normal of distributed teams...",
      publishDate: "25 Dec, 2024",
      comments: 58,
      likes: 167,
      authorImage: "/images/Ai article generator/author image 3.png",
      coverImage: "/images/Ai article generator/cover image 3.png",
    },
    {
      title: "Machine Learning Fundamentals for Beginners",
      author: "Alex Kumar",
      readTime: "7 min read",
      excerpt:
        "A comprehensive guide to understanding the basics of machine learning...",
      publishDate: "22 Dec, 2024",
      comments: 73,
      likes: 234,
      authorImage: "/images/Ai article generator/author image 4.png",
      coverImage: "/images/Ai article generator/cover image 4.png",
    },
  ];

  // Keywords data
  const keywords = [
    "Algorithms",
    "Deep learning",
    "Neural networks",
    "Machine learning",
    "Computer science",
    "Computer vision",
    "Robotics",
    "Artificial intelligence",
    "Work automation",
    "AI services",
  ];

  // Insights sidebar data - Top AI assisted articles
  const topAIArticles = [
    { title: "Understanding Neural Networks", authors: "Sarah Chan" },
    { title: "Python for Data Science", authors: "Rebecca Hudson" },
    { title: "Machine Learning Basics", authors: "Danielle Cruise " },
    { title: "AI Ethics and Governance", authors: "Janet Wales" },
  ];

  // Trending topics
  const trendingTopics = [
    "Technology",
    "Health",
    "Business",
    "Science",
    "Education",
    "Environment",
  ];

  useEffect(() => {
    if (!isLoading && !isPremium) {
      router.push("/subscription/upgrade");
    }
  }, [isPremium, isLoading, router]);

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }

  if (!isPremium) {
    return null; // Return null while redirecting
  }

  const handleManualSlide = (direction) => {
    if (direction === "next") {
      setCurrentArticleIndex((prev) => (prev + 1) % trendingArticles.length);
    } else {
      setCurrentArticleIndex(
        (prev) =>
          (prev - 1 + trendingArticles.length) % trendingArticles.length,
      );
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
    const words = text.trim().split(" ");
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
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword],
    );
  };

  const handleGenerateArticle = () => {
    if (selectedKeywords.length > 0) {
      // Handle article generation
      console.log("Generating article with:", {
        input: userInput,
        keywords: selectedKeywords,
        length: articleLength,
        tone: tone,
      });
    }
  };

  const isGenerateButtonDisabled = selectedKeywords.length === 0 || !articleLength || !tone;

  const getArticleLengthDisplay = () => {
    const options = {
      'short': { left: 'Short', right: '300-1000' },
      'mid-length': { left: 'Mid-length', right: '1000-2000' },
      'long': { left: 'Long', right: '2000+' }
    };
    return options[articleLength] || { left: 'Short', right: '300-1000' };
  };

  return (
    <div className="flex h-full">
      {/* AI Article Generator Main Section */}
      <div className="ai-generator-main flex-1 overflow-y-auto">
        <div className="ai-content-wrapper">
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
                          src={
                            trendingArticles[currentArticleIndex].authorImage
                          }
                          alt={trendingArticles[currentArticleIndex].author}
                          className="author-image"
                        />
                        <div className="author-details">
                          <div className="author-name">
                            {trendingArticles[currentArticleIndex].author}
                          </div>
                          <div className="publish-date">
                            {trendingArticles[currentArticleIndex].publishDate}
                          </div>
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
                          <svg
                            className="stat-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span className="stat-number">
                            {trendingArticles[currentArticleIndex].comments}
                          </span>
                        </div>

                        <div className="stat-item">
                          <svg
                            className="stat-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                          <span className="stat-number">
                            {trendingArticles[currentArticleIndex].likes}
                          </span>
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
                        <svg
                          className="bookmark-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        <svg
                          className="three-dots-icon"
                          fill="none"
                          stroke="#1ABC9C"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="1" fill="#1ABC9C"/>
                          <circle cx="19" cy="12" r="1" fill="#1ABC9C"/>
                          <circle cx="5" cy="12" r="1" fill="#1ABC9C"/>
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
          <div className="user-input-section">
            <p className="user-prompt-text">
              Hello.. what do you hope to write today
            </p>

            {currentView === "input" ? (
              <>
                <div className="user-textbox">
                  <textarea
                    value={userInput}
                    onChange={handleUserInputChange}
                    placeholder="Enter your article idea (up to 50 words)..."
                  />
                  <span className="word-count">
                    {
                      userInput
                        .trim()
                        .split(" ")
                        .filter((word) => word.length > 0).length
                    }
                    /50 words
                  </span>
                </div>

                <button
                  onClick={handleContinueToKeywords}
                  disabled={!userInput.trim()}
                  className="continue-button"
                >
                  <span className="continue-button-text">
                    Continue to Keywords
                  </span>
                  <svg
                    className="continue-arrow"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="selected-keywords-section">
                  <h2 className="selected-keywords-title">
                    Choose the keywords that define the content of your article
                  </h2>

                  <div className="keyword-buttons-container">
                    {keywords.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => handleKeywordToggle(keyword)}
                        className={`keyword-button ${
                          selectedKeywords.includes(keyword) ? "selected" : ""
                        } ${selectedKeywords.length >= 4 && !selectedKeywords.includes(keyword) ? "disabled" : ""}`}
                        disabled={
                          selectedKeywords.length >= 4 && !selectedKeywords.includes(keyword)
                        }
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>

                  <p className="selected-keywords-title">
                    {selectedKeywords.length === 4
                      ? "selected: 4 keywords(Maximum)"
                      : "selected: " + selectedKeywords.length + " keywords"}
                  </p>
                </div>

                <div className="article-length-section">
                <p className="article-length-text">Article Length :</p>
                
                <div className="article-length-dropdown">
                  <div 
                    className="dropdown-header"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="dropdown-header-content">
                      <span className="dropdown-header-left">{getArticleLengthDisplay().left}</span>
                      <span className="dropdown-header-right">{getArticleLengthDisplay().right}</span>
                    </div>
                    <svg
                      className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                    >
                      <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <div 
                        className="menu-item"
                        onClick={() => {
                          setArticleLength('short');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="menu-item-left">Short</span>
                        <span className="menu-item-right">300-1000</span>
                      </div>
                      <div 
                        className="menu-item"
                        onClick={() => {
                          setArticleLength('mid-length');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="menu-item-left">Mid-length</span>
                        <span className="menu-item-right">1000-2000</span>
                      </div>
                      <div 
                        className="menu-item"
                        onClick={() => {
                          setArticleLength('long');
                          setIsDropdownOpen(false);
                        }}
                      >
                        <span className="menu-item-left">Long</span>
                        <span className="menu-item-right">2000+</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`tone-selection-section ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                <p className="tone-text">Tone :</p>
                
                <div className="tone-options">
                  {["professional", "casual", "humorous"].map(
                    (toneOption) => (
                      <div key={toneOption} className="tone-option">
                        <input
                          type="radio"
                          id={`tone-${toneOption}`}
                          name="tone"
                          value={toneOption}
                          checked={tone === toneOption}
                          onChange={(e) => setTone(e.target.value)}
                          className="radio-button"
                        />
                        <label htmlFor={`tone-${toneOption}`} className="tone-label">
                          {toneOption}
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="generate-button-section">
                <button
                  onClick={handleGenerateArticle}
                  disabled={isGenerateButtonDisabled}
                  className="generate-button"
                >
                  <div className="generate-button-icon">
                    <img
                      src="/icons/Ai article generator icon white.png"
                      alt="Generate AI Article"
                    />
                  </div>
                  <span className="generate-button-text">Generate AI Article</span>
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="insights-sidebar">
        <div className="insights-header">
          <h2 className="insights-title">Insights</h2>
          <div className="insights-dots">
            <div className="insights-dot-1"></div>
            <div className="insights-dot-2"></div>
          </div>
          
        </div>

        <div className="mb-8">
          <h3 className="insights-section-title">TOP AI Assisted Articles</h3>
          <div className="space-y-3">
            {topAIArticles.map((article, index) => (
              <div key={index} className="insights-article-section">
                <h4 className="insights-article-name">{article.title}</h4>
                <p className="insights-author-name">{article.authors} </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="insights-section-title">Trending topics</h3>
          <div className="trending-topics-buttons">
            {trendingTopics.map((topic, index) => (
              <button key={index} className="topic-button">
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
