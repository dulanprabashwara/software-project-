"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../app/context/AuthContext";
import { useSavedArticles } from "../../hooks/useSavedArticles";
import { searchArticles, searchUsers } from "../../lib/searchApi";
import SearchArticleCard from "./SearchArticleCard";
import UserCard from "./UserCard";
import RightFeed from "../article/RightFeed";
import { DATA } from "../article/ArticleList";
import { Loader2, SearchX } from "lucide-react";

// Renders tabbed search results for articles and user profiles.
// The initialTab prop controls which tab is active on first render —
// "profiles" when navigated from a person autocomplete suggestion.
export default function SearchResults({ query, initialTab = "articles" }) {
  const [activeTab,       setActiveTab]       = useState(initialTab);
  const { user: firebaseUser }                = useAuth();

  // savedArticles is fetched once for the logged-in user and passed to every
  const { savedArticles } = useSavedArticles();

  const [articles,        setArticles]        = useState([]);
  const [articlesTotal,   setArticlesTotal]   = useState(0);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesLoaded,  setArticlesLoaded]  = useState(false);

  const [users,        setUsers]        = useState([]);
  const [usersTotal,   setUsersTotal]   = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded,  setUsersLoaded]  = useState(false);

  const loadArticles = useCallback(async (q) => {
    setArticlesLoading(true);
    setArticlesLoaded(false);
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const data  = await searchArticles(q, 1, token);
      setArticles(data?.articles || []);
      setArticlesTotal(data?.total || 0);
    } catch (err) {
      console.error("Article search failed:", err);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
      setArticlesLoaded(true);
    }
  }, [firebaseUser]);

  const loadUsers = useCallback(async (q) => {
    setUsersLoading(true);
    setUsersLoaded(false);
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      const data  = await searchUsers(q, 1, token);
      setUsers(data?.users || []);
      setUsersTotal(data?.total || 0);
    } catch (err) {
      console.error("User search failed:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  }, [firebaseUser]);

  useEffect(() => {
    if (!query) return;
    setArticles([]);
    setUsers([]);
    setArticlesLoaded(false);
    setUsersLoaded(false);
    setActiveTab(initialTab);

    // Load the active tab immediately; the other tab loads lazily on first click.
    if (initialTab === "profiles") {
      loadUsers(query);
    } else {
      loadArticles(query);
    }
  }, [query, initialTab, loadArticles, loadUsers]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "profiles" && !usersLoaded   && !usersLoading)    loadUsers(query);
    if (tab === "articles" && !articlesLoaded && !articlesLoading) loadArticles(query);
  };

  return (
    <div className="flex h-full overflow-hidden">

      <div className="p-8 mx-auto h-full overflow-y-auto flex-1">
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
            {articlesLoading && <Spinner />}
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
          </>
        )}

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