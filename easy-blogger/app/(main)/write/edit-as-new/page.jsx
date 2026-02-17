"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";

export default function Page() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((p) => !p);

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
        <div className="p-8">Title seed: {title}</div>
      </main>
    </div>
  );
}

