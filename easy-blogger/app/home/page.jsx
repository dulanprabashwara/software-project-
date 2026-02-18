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
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <Sidebar isOpen={sidebarOpen} />

      <main className="pt-16 flex h-[calc(100vh-64px)] overflow-hidden">
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
