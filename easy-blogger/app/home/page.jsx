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
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      {/* Header row (fixed height) */}
      <div className="h-16 shrink-0">
        <Header onToggleSidebar={() => setSidebarOpen((p) => !p)} />
      </div>

      {/* Main takes remaining height */}
      <main className={`flex-1 flex overflow-hidden transition-[margin] duration-300 ease-in-out ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <Sidebar isOpen={sidebarOpen}/>
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

