"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import ArticleContentRenderer from "../../../../components/article/ArticleContentRenderer";
import {EditorHeader,EditorBottomActions,} from "../../../../components/article/EditorSharedLayout";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { getDraftById, updateDraft, clearEditExistingBackup, } from "../../../../lib/articles/api";

function getArticleFromResponse(response) {
  return response?.data ?? response?.article ?? response ?? null;
}

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const articleId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const sourceId = searchParams.get("sourceId");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { modalState, openModal, closeModal } = useConfirmDialog();

  const isReplayingNavigationRef = useRef(false);

  useEffect(() => {
    const loadPreviewArticle = async () => {
      if (!articleId || !mode) {
        router.replace("/write/create");
        return;
      }

      try {
        const response = await getDraftById(articleId);
        const fetchedArticle = getArticleFromResponse(response);

        if (!fetchedArticle) {
          router.replace("/write/create");
          return;
        }

        setArticle(fetchedArticle);
      } catch (error) {
        console.error("Failed to load preview article:", error);
        router.replace("/write/create");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPreviewArticle();
  }, [articleId, mode, router]);

  const mainClassName = `pt-3 min-h-screen transition-all duration-300 ease-in-out ${
    sidebarOpen ? "ml-60" : "ml-0"
  }`;

  const handleExitEditor = () => {
    router.push("/home");
  };

  const handlePublish = async () => {
    if (!article?.id) 
      return;

    try {
      await updateDraft(article.id, {
        status: "draft",
      });

      router.push(`/write/publish?id=${article.id}&mode=${mode}`);
    } catch (error) {
      console.error("Failed to move to publish page:", error);
    }
  };

  const handleEditAgain = async () => {
    if (!article?.id) 
      return;

    try {
      if (mode === "edit-existing" && articleId) {
        router.push(`/write/edit-existing?id=${articleId}`);
        return;
      }
      if (mode === "edit-as-new" && sourceId) {
        router.push(`/write/edit-as-new?id=${sourceId}`);
        return;
      }
      if (mode === "create" && articleId) {
        await updateDraft(article.id, {
          status: "editing",
        });

        router.push("/write/create");
        return;
      }
      router.push("/write/create");
    } catch (error) {
      console.error("Failed to reopen article for editing:", error);
      router.push("/write/create");
    }
  };

  useEffect(() => {
    if (mode !== "edit-existing" || !articleId || modalState.isOpen) return;

    const handleNavigationClick = async (event) => {
      if (isReplayingNavigationRef.current) 
        return;

      const target = event.target;
      if (!(target instanceof Element)) 
        return;

      const clickableElement = target.closest("button, a, [role='button']");
      if (!clickableElement)
        return;

      if (clickableElement.closest("[data-keep-edit-backup='true']"))
        return;

      event.preventDefault();
      event.stopPropagation();

      try {
        await clearEditExistingBackup(articleId);
      } catch (error) {
        console.error("Failed to clear edit backup before leaving preview:", error);
      }

      isReplayingNavigationRef.current = true;

      Promise.resolve().then(() => {
        clickableElement.click();

        setTimeout(() => {
          isReplayingNavigationRef.current = false;
        }, 0);
      });
    };

    document.addEventListener("click", handleNavigationClick, true);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
    };
  }, [mode, articleId, modalState.isOpen]);

  return (
    <>
      <ConfirmDialog
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        isLoading={modalState.isLoading}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.onCancel}
        onClose={modalState.onClose}
      />

      <div className="min-h-screen bg-white">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <Sidebar isOpen={sidebarOpen} />

        <main className={mainClassName}>
          <EditorHeader
            title="Preview your Article"
            subtitle="Review the saved article before publishing or editing again"
          />

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center px-8">
              <p className="text-[#6B7280]">Loading preview...</p>
            </div>
          ) : !article ? null : (
            <>
              <div className="px-8 py-6">
                <div className="mx-auto max-w-4xl pb-6">
                  <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-md">
                    <div className="bg-emerald-100/60 px-8 py-8">
                      <h2 className="font-serif text-3xl leading-tight text-[#111827]">
                        {article.title}
                      </h2>

                      {article.coverImage ? (
                        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white p-4">
                          <div className="flex min-h-[220px] max-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-white">
                            <img
                              src={article.coverImage}
                              alt="Cover preview"
                              className="max-h-[420px] max-w-full object-contain"
                            />
                          </div>
                        </div>
                      ) : null}

                      <hr className="my-8 border-black/20" />

                      <div className="rounded-lg bg-white px-8 py-8">
                        <ArticleContentRenderer
                          content={article.content}
                          className="prose-teal"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <EditorBottomActions
                actions={[
                  {
                    label: "Exit Editor",
                    onClick: handleExitEditor,
                  },
                  {
                    label: "Publish",
                    onClick: handlePublish,
                    variant: "primary",
                    keepEditBackup: true,
                  },
                  {
                    label: "Edit",
                    onClick: handleEditAgain,
                    keepEditBackup: true,
                  },
                ]}
              />
            </>
          )}
        </main>
      </div>
    </>
  );
}