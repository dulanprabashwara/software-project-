"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { useSavedArticles } from "../../hooks/feeds/useSavedArticles";
import { searchArticles, searchUsers } from "../../lib/searchApi";
import SearchArticleCard from "./SearchArticleCard";
import UserCard from "./UserCard";
import RightFeed from "../article/RightFeed";
import { Loader2, SearchX } from "lucide-react";

const FIRST_PAGE          = 1;
const SCROLL_THRESHOLD_PX = 300; // distance from bottom (px) that triggers the next page fetch

// Renders tabbed search results for articles and user profiles with infinite scroll.
// The initialTab prop controls which tab is active on first render —
// "profiles" when navigated from a person autocomplete suggestion.
export default function SearchResults({ query, initialTab = "articles" }) {
  const [activeTab,     setActiveTab]     = useState(initialTab);
  const { user: firebaseUser }            = useAuth();

  // Fetched once for the logged-in user and passed down to every SearchArticleCard.
  const { savedArticles } = useSavedArticles();

  // ── Articles state ────────────────────────────────────────────────

  const [articles,           setArticles]           = useState([]);
  const [articlesTotal,      setArticlesTotal]      = useState(0);
  const [articlesPage,       setArticlesPage]       = useState(FIRST_PAGE);
  const [articlesTotalPages, setArticlesTotalPages] = useState(0);
  const [articlesLoading,    setArticlesLoading]    = useState(false);
  const [articlesLoaded,     setArticlesLoaded]     = useState(false);

  // ── Users state ───────────────────────────────────────────────────

  const [users,           setUsers]           = useState([]);
  const [usersTotal,      setUsersTotal]      = useState(0);
  const [usersPage,       setUsersPage]       = useState(FIRST_PAGE);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersLoading,    setUsersLoading]    = useState(false);
  const [usersLoaded,     setUsersLoaded]     = useState(false);

  // Ref attached to the scrollable results container, used by the scroll listener.
  const scrollContainerRef = useRef(null);

  // ── Load functions ────────────────────────────────────────────────

  // Fetches a page of article results and appends them to the existing list.
  // When page is FIRST_PAGE the list is replaced (fresh search or tab switch).
  const loadArticles = useCallback(async (q, page) => {
    setArticlesLoading(true);
    if (page === FIRST_PAGE) setArticlesLoaded(false);
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const data  = await searchArticles(q, page, token);
      setArticles((prev) =>
        page === FIRST_PAGE
          ? (data?.articles || [])
          : [...prev, ...(data?.articles || [])]
      );
      setArticlesTotal(data?.total || 0);
      setArticlesTotalPages(data?.totalPages || 0);
      setArticlesPage(page);
    } catch (err) {
      console.error("Article search failed:", err);
      if (page === FIRST_PAGE) setArticles([]);
    } finally {
      setArticlesLoading(false);
      setArticlesLoaded(true);
    }
  }, [firebaseUser]);

  // Fetches a page of user results and appends them to the existing list.
  // When page is FIRST_PAGE the list is replaced (fresh search or tab switch).
  const loadUsers = useCallback(async (q, page) => {
    setUsersLoading(true);
    if (page === FIRST_PAGE) setUsersLoaded(false);
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const data  = await searchUsers(q, page, token);
      setUsers((prev) =>
        page === FIRST_PAGE
          ? (data?.users || [])
          : [...prev, ...(data?.users || [])]
      );
      setUsersTotal(data?.total || 0);
      setUsersTotalPages(data?.totalPages || 0);
      setUsersPage(page);
    } catch (err) {
      console.error("User search failed:", err);
      if (page === FIRST_PAGE) setUsers([]);
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  }, [firebaseUser]);

  // ── Query change — reset everything and load the active tab ───────

  // Resets both tabs and loads page 1 for the active tab on every new query.
  // The inactive tab is loaded lazily on first click.
  useEffect(() => {
    if (!query) return;
    setArticles([]);
    setUsers([]);
    setArticlesPage(FIRST_PAGE);
    setUsersPage(FIRST_PAGE);
    setArticlesTotalPages(0);
    setUsersTotalPages(0);
    setArticlesLoaded(false);
    setUsersLoaded(false);
    setActiveTab(initialTab);

    if (initialTab === "profiles") {
      loadUsers(query, FIRST_PAGE);
    } else {
      loadArticles(query, FIRST_PAGE);
    }
  }, [query, initialTab, loadArticles, loadUsers]);

  // ── Tab switching ─────────────────────────────────────────────────

  // Switches the active tab and triggers a lazy first-page load if that tab has not yet been fetched.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "profiles" && !usersLoaded    && !usersLoading)    loadUsers(query, FIRST_PAGE);
    if (tab === "articles" && !articlesLoaded && !articlesLoading) loadArticles(query, FIRST_PAGE);
  };

  // ── Infinite scroll ───────────────────────────────────────────────

  // Listens to scroll events on the results container and fetches the next page
  // when the user scrolls within SCROLL_THRESHOLD_PX of the bottom.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceFromBottom > SCROLL_THRESHOLD_PX) return;

      if (activeTab === "articles" && articlesPage < articlesTotalPages && !articlesLoading) {
        loadArticles(query, articlesPage + 1);
      }

      if (activeTab === "profiles" && usersPage < usersTotalPages && !usersLoading) {
        loadUsers(query, usersPage + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    query,
    articlesPage, articlesTotalPages, articlesLoading,
    usersPage,    usersTotalPages,    usersLoading,
    loadArticles, loadUsers,
  ]);

  // ── Derived flags ─────────────────────────────────────────────────

  const hasMoreArticles = articlesPage < articlesTotalPages;
  const hasMoreUsers    = usersPage    < usersTotalPages;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex h-full overflow-hidden">

      <div ref={scrollContainerRef} className="p-8 mx-auto h-full overflow-y-auto flex-1">
        <p className="text-sm text-[#6B7280] mb-5">
          Results for <span className="font-semibold text-[#111827]">"{query}"</span>
        </p>

        <div className="flex gap-6 border-b border-[#E5E7EB] mb-1">
          <TabButton
            label="Articles"
            count={articlesLoaded ? articlesTotal : null}
            active={activeTab === "articles"}
            onClick={() => handleTabChange("articles")}
          />
          <TabButton
            label="Profiles"
            count={usersLoaded ? usersTotal : null}
            active={activeTab === "profiles"}
            onClick={() => handleTabChange("profiles")}
          />
        </div>

        {activeTab === "articles" && (
          <>
            {/* Full-page spinner shown only while the first page is loading */}
            {articlesLoading && articles.length === 0 && <Spinner />}

            {!articlesLoading && articlesLoaded && articles.length === 0 && (
              <EmptyState
                message={`No articles found for "${query}"`}
                hint="Try a different keyword or check the Profiles tab."
              />
            )}

            {articles.map((article) => (
              <SearchArticleCard
                key={article.id}
                article={article}
                savedArticles={savedArticles}
              />
            ))}     
             {/* small spinner at end of page when scrolled further*/}      
            {articlesLoading && articles.length > 0 && <InlineSpinner />}
            {!hasMoreArticles && articlesLoaded && articles.length > 0 && <EndOfResults />}
          </>
        )}

        {activeTab === "profiles" && (
          <>
            {/* Full-page spinner shown only while the first page is loading */}
            {usersLoading && users.length === 0 && <Spinner />}

            {!usersLoading && usersLoaded && users.length === 0 && (
              <EmptyState
                message={`No profiles found for "${query}"`}
                hint="Try searching by username or display name."
              />
            )}

            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
             {/* small spinner at end of page when scrolled further*/}
            {usersLoading && users.length > 0 && <InlineSpinner />}
            {!hasMoreUsers && usersLoaded && users.length > 0 && <EndOfResults />}
          </>
        )}
      </div>

      <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto">
        <RightFeed/>
      </div>

    </div>
  );
}

// Renders a single tab button with an optional result count badge.
function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-[15px] font-medium transition-colors duration-150 border-b-2 -mb-px ${
        active
          ? "border-[#1ABC9C] text-[#1ABC9C]"
          : "border-transparent text-[#6B7280] hover:text-[#111827]"
      }`}
    >
      {label}
      {count !== null && (
        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
          active ? "bg-[#E8F8F5] text-[#1ABC9C]" : "bg-gray-100 text-[#6B7280]"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Displays a centered full-page loading spinner for the initial page fetch.
function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
    </div>
  );
}

// Displays a small inline spinner at the bottom of the list while fetching subsequent pages.
function InlineSpinner() {
  return (
    <div className="flex justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-[#1ABC9C]" />
    </div>
  );
}

// Displays a no-results message with an optional hint.
function EmptyState({ message, hint }) {
  return (
    <div className="flex flex-col items-center py-16 text-center text-[#6B7280]">
      <SearchX className="w-10 h-10 mb-3" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#111827]">{message}</p>
      {hint && <p className="text-xs mt-1">{hint}</p>}
    </div>
  );
}

// Displayed at the bottom of the list when all pages have been loaded.
function EndOfResults() {
  return (
    <p className="text-center text-xs text-[#6B7280] py-8">
      You've reached the end of the results.
    </p>
  );
}