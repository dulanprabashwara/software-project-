// components/search/SearchResults.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { searchArticles, searchUsers } from "../../lib/searchApi";
import { useAuth } from "../../app/context/AuthContext";
import SearchArticleCard from "./SearchArticleCard";
import UserCard from "./UserCard";
import RightFeed from "../article/RightFeed";
import { DATA } from "../article/ArticleList";
import { Loader2, SearchX } from "lucide-react";

export default function SearchResults({ query }) {
  const [activeTab, setActiveTab] = useState("articles");

  // Auth context — token is passed to searchUsers so the backend can resolve
  // isFollowing for each returned user from the database (not a frontend guess)
  const { user: firebaseUser } = useAuth();

  // ── Articles state ────────────────────────────────────────────────────────
  const [articles,        setArticles]        = useState([]);
  const [articlesTotal,   setArticlesTotal]   = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesLoaded,  setArticlesLoaded]  = useState(false);

  // ── Users state ───────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([]);
  const [usersTotal,   setUsersTotal]   = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded,  setUsersLoaded]  = useState(false);

  // ── Load articles (no auth needed — articles are public) ──────────────────
  const loadArticles = useCallback(async (q) => {
    setArticlesLoading(true);
    setArticlesLoaded(false);
    try {
      const data = await searchArticles(q);
      setArticles(data?.articles || []);
      setArticlesTotal(data?.total || 0);
    } catch (err) {
      console.error("[SearchResults] article search failed:", err);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
      setArticlesLoaded(true);
    }
  }, []);

  // ── Load users (passes token so backend resolves isFollowing from DB) ─────
  const loadUsers = useCallback(async (q) => {
    setUsersLoading(true);
    setUsersLoaded(false);
    try {
      // Get a fresh Firebase token if the user is logged in
      // Token is forwarded to the backend optionalAuth middleware which stamps
      // isFollowing: true/false on each user using a single DB query
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const data  = await searchUsers(q, 1, token);
      setUsers(data?.users || []);
      setUsersTotal(data?.total || 0);
    } catch (err) {
      console.error("[SearchResults] user search failed:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!query) return;
    setActiveTab("articles");
    setArticles([]);
    setUsers([]);
    setArticlesLoaded(false);
    setUsersLoaded(false);
    loadArticles(query);
  }, [query, loadArticles]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "profiles" && !usersLoaded && !usersLoading) {
      loadUsers(query);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left column: results ──────────────────────────────────────────── */}
      <div className="p-8 mx-auto h-full overflow-y-auto flex-1">

        <p className="text-sm text-[#6B7280] mb-5">
          Results for{" "}
          <span className="font-semibold text-[#111827]">"{query}"</span>
        </p>

        {/* Tabs */}
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

        {/* Articles */}
        {activeTab === "articles" && (
          <>
            {articlesLoading && <Spinner />}
            {!articlesLoading && articlesLoaded && articles.length === 0 && (
              <EmptyState
                message={`No articles found for "${query}"`}
                hint='Try a different keyword or check the Profiles tab.'
              />
            )}
            {articles.map((article) => (
              <SearchArticleCard key={article.id} article={article} />
            ))}
          </>
        )}

        {/* Profiles */}
        {activeTab === "profiles" && (
          <>
            {usersLoading && <Spinner />}
            {!usersLoading && usersLoaded && users.length === 0 && (
              <EmptyState
                message={`No profiles found for "${query}"`}
                hint="Try searching by username or display name."
              />
            )}
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </>
        )}
      </div>

      {/* ── Right column: RightFeed ───────────────────────────────────────── */}
      <div className="hidden lg:block w-80 flex-none h-full overflow-y-auto">
        <RightFeed
          trending={DATA.trending}
          topics={DATA.topics}
          usersToFollow={DATA.usersToFollow}
        />
      </div>

    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TabButton({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      // CHANGED: text-sm (14px) → text-[15px] — was barely readable before
      className={`pb-3 text-[15px] font-medium transition-colors duration-150 border-b-2 -mb-px ${
        active
          ? "border-[#1ABC9C] text-[#1ABC9C]"
          : "border-transparent text-[#6B7280] hover:text-[#111827]"
      }`}
    >
      {label}
      {count !== null && (
        <span
          className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            active
              ? "bg-[#E8F8F5] text-[#1ABC9C]"
              : "bg-gray-100 text-[#6B7280]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-[#1ABC9C]" />
    </div>
  );
}

function EmptyState({ message, hint }) {
  return (
    <div className="flex flex-col items-center py-16 text-center text-[#6B7280]">
      <SearchX className="w-10 h-10 mb-3" strokeWidth={1.5} />
      <p className="text-sm font-medium text-[#111827]">{message}</p>
      {hint && <p className="text-xs mt-1">{hint}</p>}
    </div>
  );
}