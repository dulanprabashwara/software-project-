"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";

export default function Page() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((p) => !p);
  const [articleMode, setArticleMode] = useState("draft");
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const seedRaw = sessionStorage.getItem("edit_as_new_seed");
    if (!seedRaw) {
      router.replace("/write/unpublished"); // change if your route differs
      return;
    }
    const seed = JSON.parse(seedRaw);
    setTitle(seed.title || "");
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >

        {/* Top Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 items-center">
              <div className="text-sm text-[#6B7280] justify-self-start">
                Saved / Saving...
              </div>
              
              <div className="text-center">
                <h1 className="text-4xl font-serif font-bold text-[#111827]">
                  Edit as a New Article
                </h1>
                <p className="text-[#6B7280] mt-1">
                  Here you can edit your existing article as a new article.
                </p>
              </div>

              <div className="justify-self-end">
                <span className="inline-flex items-center px-6 py-2.5 bg-[#1ABC9C] text-white rounded-full text-sm font-medium">
                  {articleMode === "draft" ? "Draft Article" : "New Article"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div
          className="px-8 py-8 overflow-y-auto"
          style={{ height: "calc(100vh - 260px)" }}
        >
          <div
            className="max-w-5xl mx-auto space-y-6"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            {/* Blog Title */}
            <div className="bg-[#F8FAFC] rounded-lg p-6">
              <label className="block text-sm font-semibold text-[#111827] mb-3">
                Blog Title
              </label>
              <input
                type="text"
                value={title}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-[#E5E7EB] rounded-lg text-[#111827] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="p-8">Title seed: {title}</div>
      </main>
    </div>
  );
}

