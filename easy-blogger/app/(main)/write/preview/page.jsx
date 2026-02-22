"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";

// Article preview page
export default function Page() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    const rawArticle = sessionStorage.getItem("preview_article");
    const rawContext = sessionStorage.getItem("preview_context");

    if (!rawArticle || !rawContext) {
      router.replace("/write/create");
      return;
    }

    try {
      const parsed = JSON.parse(rawArticle);
      setArticle(parsed);
    } catch (e) {
      router.replace("/write/create");
    }
  }, [router]);

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  if (!article) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {/* Heading */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-serif font-bold text-[#111827]">
              Preview your Article
            </h1>
            <p className="text-[#6B7280] mt-1">
              After preview your article you can publish, save as draft or edit
              your article
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="px-8 py-10">
          <div className="mx-auto max-w-4xl border shadow-md">
            <div className="bg-emerald-100/60 px-10 py-10">
              <h2 className="font-serif text-4xl leading-tight text-[#111827]">
                {article.title}
              </h2>

              {/* Cover image */}
              {article.coverImage ? (
                <div className="mt-6 border bg-white overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt="Cover"
                    className="w-full h-[320px] object-cover"
                  />
                </div>
              ) : null}

              <hr className="my-8 border-black/30" />

              {/* Content (TinyMCE HTML) */}
              <div className="bg-white px-10 py-10">
                <div
                  className="prose max-w-none leading-loose"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="mx-auto mt-10 flex max-w-4xl items-center justify-between gap-4">
            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Exit from the editor ?</p>
              <button
                onClick={() => { 
                  sessionStorage.removeItem("preview_article");
                  sessionStorage.removeItem("preview_context");
                  router.push("/home"); }}
                className="rounded-full bg-black px-6 py-2 text-white"
              >
                Exit Editor
              </button>
            </div>

            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Publish Now ?</p>
              <button
                onClick={() => router.push("/write/publish")}
                className="rounded-full bg-[#1ABC9C] px-8 py-2 text-white"
              >
                Publish
              </button>
            </div>

            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Edit Again?</p>
              <button
                onClick={() => {
                  const raw = sessionStorage.getItem("preview_context");
                  const ctx = raw ? JSON.parse(raw) : null;

                  // If preview came from edit-existing, go back to that article editor
                  if (ctx?.mode === "edit-existing" && ctx?.id) {
                    router.push(`/write/edit-existing/${ctx.id}`);
                    return;
                  }

                  // If preview came from edit-as-new (optional)
                  if (ctx?.mode === "edit-as-new") {
                    router.push("/write/edit-as-new");
                    return;
                  }

                  // Default: create editor
                  router.push("/write/create");
                }}
                className="rounded-full bg-black px-8 py-2 text-white"
              >
  
                Edit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
