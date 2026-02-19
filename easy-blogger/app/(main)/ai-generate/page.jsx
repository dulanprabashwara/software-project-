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
import "../../../styles/ai-article-generator/articles-view.css";

export default function AIArticleGeneratorPage() {
  // NOTE: Header and Sidebar are provided by app/(main)/layout.jsx
  // We only need to manage local state for the AI generator features.

  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();
  const [currentView, setCurrentView] = useState("input"); // "input", "keywords", "articles"
  const [userInput, setUserInput] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [articleLength, setArticleLength] = useState("short");
  const [tone, setTone] = useState("professional");
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCursorInsidePreview, setIsCursorInsidePreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [articles, setArticles] = useState([]);
  const [inputError, setInputError] = useState("");
  const [isLoadingTransition, setIsLoadingTransition] = useState(false);
  const intervalRef = useRef(null);

  // Validation function for user input
  const validateUserInput = (text) => {
    // Check if text contains at least one English letter
    const hasEnglishLetter = /[a-zA-Z]/.test(text);
    
    if (!hasEnglishLetter) {
      setInputError("Please enter a valid text!");
      return false;
    }
    
    setInputError("");
    return true;
  };

  // Fetch articles list from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/ai-generate');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set articles list only
        if (data.articles) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      }
    };

    fetchArticles();
  }, []);

  // Copy to clipboard function
  const handleCopyToClipboard = async () => {
    if (generatedArticle) {
      try {
        const textToCopy = `${generatedArticle.title}\n\n${generatedArticle.content}`;
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        
        // Reset copied status after 6 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 6000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

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

  useEffect(() => {
    // Add or remove loading class from body based on isLoading state
    if (isLoading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('loading');
    };
  }, [isLoading]);

  useEffect(() => {
    // Add or remove loading class from body based on isGenerating state
    if (isGenerating) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
    }
    
    // Cleanup function
    return () => {
      document.body.classList.remove('loading');
    };
  }, [isGenerating]);

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

  // Articles View
  if (currentView === "articles") {
    return (
      <div className="flex h-full">
        {/* AI Article Generator Main Section */}
        <div className="ai-generator-main flex-1 overflow-y-auto">     
          <div className="ai-content-wrapper">
            {/* Title Section */}
            <div className="ai-generator-title justify-between">
              <div className="flex items-center gap-3">
                {/* Menu Icon */}
                <button
                  onClick={() => setCurrentView("input")}
                  className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
                >
                  <img
                    src="/icons/menu icon.png"
                    alt="Menu"
                    className="ai-generator-menu-icon"
                  />
                </button>

                {/* AI Article Generator Symbol */}
                <img
                  src="/icons/Ai article generator icon teel color.png"
                  alt="AI Article Generator"
                  className="ai-generator-ai-icon"
                />

                <h1 className="ai-generator-title-text">AI Article Generator</h1>
              </div>
            </div>

            {/* Previous Generations and New Article Section */}
            <div className="flex items-center justify-between mt-5">
              {/* Previous Generations */}
              <div className="previous-generations">
                {/* Chat Icon */}
                <div className="previous-generations-icon">
                  <img
                    src="/icons/chat.png"
                    alt="Chat"
                    className="w-4 h-4"
                    style={{ filter: "invert(1)" }}
                  />
                </div>
                
                {/* Previous Generations Text */}
                <span className="previous-generations-text">
                  Previous Generations
                </span>
              </div>

              {/* New Article Button */}
              <button
                onClick={() => setCurrentView("input")}
                className="new-article-button"
              >
                <span>+ New Article</span>
              </button>
            </div>

            {/* Articles Content */}
            <div className="px-6 py-8">
              {/* Articles List */}
              <div className="articles-list">
                {articles.map((article) => (
                  <div key={article.id} className="article-label">
                    <div className="article-title">
                      <span>{article.title}</span>
                    </div>
                    <div className="article-date">
                      <span>{article.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights Sidebar */}
        <div className="insights-sidebar">
          <div className="insights-header">
            <h2 className="insights-title">Insights</h2>
            <div className="insights-dots">
              <div className="insights-dot-1"></div>
              <div className="insights-dot-2"></div>
            </div>
            
          </div>

          <div className="mb-8">
            <h3 className="insights-section-title">Top AI Assisted Articles</h3>
            <div className="space-y-3">
              {topAIArticles.map((article, index) => (
                <div key={index} className="insights-article-section">
                  <div className="insights-article-header">
                    <span className="insights-article-number">{index + 1}</span> 
                    <h4 className="insights-article-name">{article.title}</h4>
                  </div>
                  <div className="insights-author-section">
                    <p className="insights-author-name">{article.authors} </p>
                  </div>
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
      // Clear error when user is typing
      setInputError("");
    }
  };

  const handleContinueToKeywords = () => {
    if (userInput.trim()) {
      if (validateUserInput(userInput)) {
        setIsLoadingTransition(true);
        
        // Add loading class to body for blur effect
        document.body.classList.add('loading-transition');
        
        // Transition to keywords view after 2 seconds
        setTimeout(() => {
          setIsLoadingTransition(false);
          document.body.classList.remove('loading-transition');
          setCurrentView("keywords");
        }, 2000);
      }
      // If validation fails, error will be shown by validateUserInput
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
      setIsGenerating(true);
      
      // Handle article generation
      console.log("Generating article with:", {
        input: userInput,
        keywords: selectedKeywords,
        length: articleLength,
        tone: tone,
      });
      
      // Fetch generated article from API
      const fetchGeneratedArticle = async () => {
        try {
          const response = await fetch('/api/ai-generate');
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.generatedArticle) {
            setGeneratedArticle(data.generatedArticle);
            setCurrentView("result");
          }
        } catch (error) {
          console.error('Failed to fetch generated article:', error);
        } finally {
          setIsGenerating(false);
        }
      };

      fetchGeneratedArticle();
    }
  };

  const isGenerateButtonDisabled = selectedKeywords.length === 0 || !articleLength || !tone;

// Check if continue button should be disabled
const isContinueButtonDisabled = !userInput.trim() || inputError !== "";

  const handleRegenerateArticle = () => {
    if (generatedArticle) {
      setIsGenerating(true);
      
      // Clear current article during loading
      setGeneratedArticle(null);
      
      // Handle article regeneration
      console.log("Regenerating article with:", {
        title: generatedArticle.title,
        content: generatedArticle.content,
        length: articleLength,
        tone: tone,
      });
      
      // Stop loading after 4 seconds and show result
      setTimeout(() => {
        setIsGenerating(false);
        // Set sample regenerated article data
        setGeneratedArticle({
          title: "Regenerated: " + generatedArticle.title,
          content: "This is a regenerated version of the article with updated content and insights..."
        });
        setCurrentView("result");
      }, 4000);
    }
  };

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
              <button
                onClick={() => setCurrentView("articles")}
                className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors duration-150"
              >
                <img
                  src="/icons/menu icon.png"
                  alt="Menu"
                  className="ai-generator-menu-icon"
                />
              </button>

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

                      <h3 className="article-title" onClick={() => console.log('Article clicked:', trendingArticles[currentArticleIndex].title)}>
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

                {/* Error Message */}
                {inputError && (
                  <div className="input-error-message">
                    {inputError}
                  </div>
                )}

                <button
                  onClick={handleContinueToKeywords}
                  disabled={isContinueButtonDisabled}
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
                {isGenerating ? (
                  <div className="generate-loading-container">
                    <div className="loading-spinner">
                      <svg
                        className="spinner-svg"
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          className="spinner-circle"
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="5"
                          stroke="#B4EFDD"
                          strokeDasharray="125.6"
                          strokeDashoffset="31.4"
                        />
                        <circle
                          className="spinner-circle-active"
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="5"
                          stroke="#1ABC9C"
                          strokeDasharray="125.6"
                          strokeDashoffset="31.4"
                        />
                      </svg>
                    </div>
                    <p className="loading-text">Generating the article..</p>
                  </div>
                ) : !generatedArticle || isGenerating ? (
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
                ) : null}
              </div>
              </>
            )}

            {/* View 3: Article Result */}
            {currentView === "result" && generatedArticle && (
              <div className="article-result-section">
                <div className="result-container">
                  {/* Left side - empty for spacing */}
                  <div className="result-left-side"></div>
                  
                  {/* Right side - content */}
                  <div className="result-right-side">
                    <p className="heres-article-text">Here's your article..</p>
                    
                    {/* Article title label */}
                    <div className="article-title-label" onClick={() => setShowPreview(true)}>
                      <span className="article-title-text">{generatedArticle.title}</span>
                      <svg 
                        className="open-book-icon" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#1E1E1E" 
                        strokeWidth="2"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    
                    {/* Action icons */}
                    <div className="article-actions">
                      <button className="back-button" title="Back" onClick={() => setCurrentView("input")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                          <path d="M19 12H5"></path>
                          <path d="M12 19l-7-7 7-7"></path>
                        </svg>
                        <span className="back-text">back</span>
                      </button>
                      <button className="action-icon" title="Regenerate" onClick={handleRegenerateArticle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6"></path>
                          <path d="M1 20v-6h6"></path>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                      </button>
                      <button className="action-icon" title="Copy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      <button className="action-icon" title="Like">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </button>
                      <button className="action-icon" title="Dislike">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
          <h3 className="insights-section-title">Top AI Assisted Articles</h3>
          <div className="space-y-3">
            {topAIArticles.map((article, index) => (
              <div key={index} className="insights-article-section">
                <div className="insights-article-header">
                  <span className="insights-article-number">{index + 1}</span> 
                  <h4 className="insights-article-name">{article.title}</h4>
                </div>
                <div className="insights-author-section">
                  <p className="insights-author-name">{article.authors} </p>
                </div>
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
      
      {/* Loading Transition Overlay */}
      {isLoadingTransition && (
        <div className="loading-transition-overlay">
          <div className="loading-spinner-container">
            <div className="loading-spinner-transition"></div>
          </div>
        </div>
      )}

      {/* Preview Overlay */}
      {showPreview && (
        <div 
          className="preview-overlay"
          onMouseEnter={() => setIsCursorInsidePreview(false)}
          onClick={() => setIsCursorInsidePreview(false)}
        >
          {/* Close Button - Only show when cursor is outside preview box */}
          {!isCursorInsidePreview && (
            <div 
              className="preview-close-circle"
              onMouseEnter={() => setIsCursorInsidePreview(false)}
              onMouseLeave={() => setIsCursorInsidePreview(false)}
            >
              <button className="preview-close-button-circle" onClick={() => setShowPreview(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          )}
          
          <div 
            className="preview-box"
            onMouseEnter={() => setIsCursorInsidePreview(true)}
            onMouseLeave={(e) => {
              // Only set to false if mouse is not entering close button area
              const relatedTarget = e.relatedTarget;
              const isEnteringCloseButton = relatedTarget && relatedTarget.classList && (
                relatedTarget.classList.contains('preview-close-circle') ||
                relatedTarget.classList.contains('preview-close-button-circle') ||
                relatedTarget.classList.contains('preview-copy-icon') ||
                relatedTarget.classList.contains('preview-save-icon') ||
                relatedTarget.classList.contains('preview-edit-button')
              );
              
              if (!isEnteringCloseButton) {
                setIsCursorInsidePreview(false);
              }
            }}
          >
            
            {/* Preview Header */}
            <div className="preview-header">
              {/* Action Icons */}
              <div className="preview-header-actions">
                <button className="preview-copy-icon" title="Copy" onClick={handleCopyToClipboard}>
                  {isCopied ? (
                    <span className="preview-copied-message">copied to clipboard</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1ABC9C" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
                
                <button className="preview-save-icon" title="save to unpublished articles">
                  <img 
                    src="/icons/Save.png" 
                    alt="Save"
                    width="16" 
                    height="16"
                  />
                  <span className="preview-save-text">save draft</span>
                </button>
                
                <button className="preview-edit-button" title="Edit">
                  <span className="preview-edit-text">edit</span>
                </button>
              </div>
            </div>
            
            {/* Preview Content - Common Layout Elements */}
            <div className="preview-content">
              <div className="preview-article-info">
                <h3 className="preview-article-title">{generatedArticle.title}</h3>
                <p className="preview-article-excerpt">{generatedArticle.content}</p>
              </div>
              
              {/* Action buttons */}
              <div className="preview-actions">
                <button className="preview-action-button"></button>
              </div>
            </div>
            
            {/* Footer with word count - Sibling to content */}
            <div className="preview-footer">
              <span className="preview-word-count">
                 word count: {generatedArticle.content.split(' ').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
