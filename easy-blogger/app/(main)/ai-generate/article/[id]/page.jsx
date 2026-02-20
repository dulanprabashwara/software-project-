/**
 * Article Details Page
 *
 * Route: /ai-generate/article/[id]
 *
 * Purpose: Display comprehensive details of a previously generated article
 * Features:
 * - Shows user input prompt, keywords, and settings used
 * - Displays original generated article and regenerated versions
 * - Read-only view without generation buttons
 * - Maintains consistent styling with main AI generator page
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSubscription } from "../../../../subscription/SubscriptionContext";
import "../../../../../styles/ai-article-generator/ai-article-generator.css";
import "../../../../../styles/ai-article-generator/articles-view.css";

export default function ArticleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isPremium, isLoading } = useSubscription();
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isPremium) {
      router.push("/subscription/upgrade");
      return;
    }

    const fetchArticleDetails = async () => {
      try {
        const response = await fetch(`/api/ai-generate?id=${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setArticleData(data);
      } catch (error) {
        console.error('Failed to fetch article details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticleDetails();
    }
  }, [params.id, isPremium, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }

  if (!isPremium) {
    return null;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Article</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/ai-generate')}
            className="px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors"
          >
            Back to AI Generator
          </button>
        </div>
      </div>
    );
  }

  if (!articleData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Article Not Found</h2>
          <button
            onClick={() => router.push('/ai-generate')}
            className="px-4 py-2 bg-[#1ABC9C] text-white rounded-lg hover:bg-[#16A085] transition-colors"
          >
            Back to AI Generator
          </button>
        </div>
      </div>
    );
  }

  const getArticleLengthDisplay = (length) => {
    const options = {
      'short': { left: 'Short', right: '300-1000' },
      'mid-length': { left: 'Mid-length', right: '1000-2000' },
      'long': { left: 'Long', right: '2000+' }
    };
    return options[length] || { left: 'Short', right: '300-1000' };
  };

  // Copy to clipboard function
  const handleCopyToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      
      // Reset copied status after 6 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 6000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Article Details Main Section */}
      <div className="ai-generator-main flex-1 overflow-y-auto article-details-page">     
        <div className="ai-content-wrapper">
          {/* Title Section */}
          <div className="ai-generator-title justify-between">
            <div className="flex items-center gap-3">
              {/* Menu Icon */}
              <button
                onClick={() => router.push("/ai-generate")}
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

          {/* User Input Section */}
          <div className="user-input-section">
            <div className="user-textbox">
              <textarea
                value={articleData.textPrompt}
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
              <span className="word-count">
                {
                  articleData.textPrompt
                    .trim()
                    .split(" ")
                    .filter((word) => word.length > 0).length
                }
                /50 words
              </span>
            </div>
          </div>

          {/* Keywords Selection Section */}
          <div className="selected-keywords-section">
            <div className="keyword-buttons-container">
              {articleData.keywordsPresented.map((keyword) => (
                <button
                  key={keyword}
                  className={`keyword-button ${
                    articleData.keywordsSelected.includes(keyword) ? "selected" : ""
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>

            <p className="selected-keywords-title">
              {articleData.keywordsSelected.length === 4
                ? "selected: 4 keywords(Maximum)"
                : "selected: " + articleData.keywordsSelected.length + " keywords"}
            </p>
          </div>

          {/* Article Length Section */}
          <div className="article-length-section">
            <p className="article-length-text">Article Length :</p>
            
            <div className="article-length-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-header-content">
                  <span className="dropdown-header-left">
                    {getArticleLengthDisplay(articleData.articleLengthSelected).left}
                  </span>
                  <span className="dropdown-header-right">
                    {getArticleLengthDisplay(articleData.articleLengthSelected).right}
                  </span>
                </div>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                >
                  <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Tone Selection Section */}
          <div className="tone-selection-section">
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
                      checked={articleData.toneSelected === toneOption}
                      disabled
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

          {/* Generated Article Content */}
          <div className="article-result-section">
            <div className="result-container">
              {/* Left side - empty for spacing */}
              <div className="result-left-side"></div>
              
              {/* Right side - content */}
              <div className="result-right-side">
                {/* Article title label */}
                <div className="article-title-label" onClick={() => setShowPreview(true)}>
                  <span className="article-title-text">{articleData.title}</span>
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
                  <button className="action-icon" title="Copy" onClick={() => handleCopyToClipboard(articleData.content)}>
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

          {/* Regenerated Articles */}
          {articleData.regeneratedArticles && articleData.regeneratedArticles.length > 0 && (
            <div className="regenerated-articles-section">
              {articleData.regeneratedArticles.map((regeneratedArticle, index) => (
                <div key={index} className="article-result-section">
                  <div className="result-container">
                    <div className="result-left-side"></div>
                    <div className="result-right-side">
                      <p className="heres-article-text">Regenerated Article {index + 1}..</p>
                        
                      <div className="article-title-label" onClick={() => setShowPreview(true)}>
                        <span className="article-title-text">Regenerated: {regeneratedArticle.title.replace('Regenerated: ', '')}</span>
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
                      
                      <div className="article-actions">
                        <button className="action-icon" title="Copy" onClick={() => handleCopyToClipboard(regeneratedArticle.content)}>
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
              ))}
            </div>
          )}
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
            {[
              { title: "Understanding Neural Networks", authors: "Sarah Chan" },
              { title: "Python for Data Science", authors: "Rebecca Hudson" },
              { title: "Machine Learning Basics", authors: "Danielle Cruise " },
              { title: "AI Ethics and Governance", authors: "Janet Wales" },
            ].map((article, index) => (
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
            {["Technology", "Health", "Business", "Science", "Education", "Environment"].map((topic, index) => (
              <button key={index} className="topic-button">
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div 
          className="preview-overlay"
          onClick={() => setShowPreview(false)}
        >
          {/* Close Button */}
          <div 
            className="preview-close-circle"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(false);
            }}
          >
            <button className="preview-close-button-circle" onClick={() => setShowPreview(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div 
            className="preview-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="preview-header">
              {/* Action Icons */}
              <div className="preview-header-actions">
                <button className="preview-copy-icon" title="Copy" onClick={() => handleCopyToClipboard(articleData.content)}>
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
            
            {/* Preview Content */}
            <div className="preview-content">
              <div className="preview-article-info">
                <h3 className="preview-article-title">{articleData.title}</h3>
                <p className="preview-article-excerpt">{articleData.content}</p>
              </div>
            </div>
            
            {/* Footer with word count */}
            <div className="preview-footer">
              <span className="preview-word-count">
                 word count: {articleData.content.split(' ').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
