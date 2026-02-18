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
    <div className="h-screen bg-white overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} />

      
      <main className={`mt-16 h-[calc(100vh-64px)] flex overflow-hidden duration-600 ease-in-out ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <MainFeed articles={DATA.articles} />
        <RightFeed trending={DATA.trending} topics={DATA.topics} usersToFollow={DATA.usersToFollow} />
      </main>
    </div>
  );
}
