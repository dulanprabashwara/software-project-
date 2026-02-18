"use client";

import { useState } from "react";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";

import { DATA } from "../../components/article/ArticleList";
import MainFeed from "../../components/article/MainFeed";
import RightFeed from "../../components/article/RightFeed";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Sidebar isOpen={sidebarOpen} />

      <main
  className={`pt-16 flex h-[calc(100vh-64px)] overflow-hidden transition-[margin] duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
>
  <MainFeed articles={DATA.articles} />
  <RightFeed
    trending={DATA.trending}
    topics={DATA.topics}
    usersToFollow={DATA.usersToFollow}
  />
</main>

    </div>
  );
}
