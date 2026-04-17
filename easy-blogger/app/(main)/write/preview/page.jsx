/* easy-blogger/app/(main)/write/preview/page.jsx */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import { getDraftById } from "../../../../lib/articles/api";

const STORAGE_KEYS = {
  publishArticleTitle: "publish_article_title",
  publishSourceArticleId: "publish_source_article_id",
  publishDraft: "publish_article_draft",
  previewContext: "preview_context",
};

function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
}

export default function Page() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [article, setArticle] = useState(null);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const loadPreviewArticle = async () => {
      const rawContext = sessionStorage.getItem(STORAGE_KEYS.previewContext);

      if (!rawContext) {
        router.replace("/write/create");
        return;
      }

      try {
        const parsedContext = JSON.parse(rawContext);
        setContext(parsedContext);

        if (!parsedContext?.id) {
          router.replace("/write/create");
          return;
        }

        const response = await getDraftById(parsedContext.id);
        const fetchedArticle = getArticleFromResponse(response);

        setArticle(fetchedArticle);
      } catch (error) {
        console.error("Failed to load preview article:", error);
        router.replace("/write/create");
      }
    };

    void loadPreviewArticle();
  }, [router]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />

      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
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

        <div className="px-8 py-10">
          <div className="mx-auto max-w-4xl border shadow-md">
            <div className="bg-emerald-100/60 px-10 py-10">
              <h2 className="font-serif text-4xl leading-tight text-[#111827]">
                {article.title}
              </h2>

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

              <div className="bg-white px-10 py-10">
                <div
                  className="prose max-w-none leading-loose"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-4xl items-center justify-between gap-4">
            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Exit from the editor ?</p>
              <button
                onClick={() => {
                  sessionStorage.removeItem(STORAGE_KEYS.previewContext);
                  router.push("/home");
                }}
                className="rounded-full bg-black px-6 py-2 text-white"
              >
                Exit Editor
              </button>
            </div>

            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Publish Now ?</p>
              <button
                onClick={() => {
                  const currentArticleId = article.id || "";
                  const previousArticleId =
                    sessionStorage.getItem(STORAGE_KEYS.publishSourceArticleId) || "";

                  if (previousArticleId && previousArticleId !== currentArticleId) {
                    sessionStorage.removeItem(STORAGE_KEYS.publishDraft);
                  }

                  sessionStorage.setItem(
                    STORAGE_KEYS.publishArticleTitle,
                    article.title || "",
                  );
                  sessionStorage.setItem(
                    STORAGE_KEYS.publishSourceArticleId,
                    currentArticleId,
                  );

                  router.push("/write/publish");
                }}
                className="rounded-full bg-[#1ABC9C] px-8 py-2 text-white"
              >
                Publish
              </button>
            </div>

            <div className="text-center">
              <p className="mb-2 italic text-[#6B7280]">Edit Again?</p>
              <button
                onClick={() => {
                  if (context?.mode === "edit-existing" && context?.id) {
                    router.push(`/write/edit-existing/${context.id}`);
                    return;
                  }

                  if (
                    context?.mode === "edit-as-new" &&
                    context?.sourceId
                  ) {
                    router.push(`/write/edit-as-new/${context.sourceId}`);
                    return;
                  }

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