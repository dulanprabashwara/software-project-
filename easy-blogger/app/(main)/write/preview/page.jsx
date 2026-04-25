"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import ArticleContentRenderer from "../../../../components/article/ArticleContentRenderer";
import {EditorHeader,EditorBottomActions,} from "../../../../components/article/EditorSharedLayout";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { getDraftById, updateDraft } from "../../../../lib/articles/api";
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

  const handlePublish = () => {
    if (!article?.id) return;

    openModal({
      title: "Save article?",
      message: "Do you want to save this article before moving to publish page?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          await updateDraft(article.id, { status: "draft" });
          closeModal();
          router.push(`/write/publish?id=${article.id}`);
        } catch (error) {
          console.error("Failed to save article before publish:", error);
          closeModal();
        }
      },
      onCancel: async () => {
        closeModal();
      },
      onClose: async () => {},
    });
  };

  const handleEditAgain = () => {
    if (mode === "edit-existing" && articleId) {
      router.push(`/write/edit-existing?id=${articleId}`);
      return;
    }

    if (mode === "edit-as-new" && sourceId) {
      router.push(`/write/edit-as-new?id=${sourceId}`);
      return;
    }

    router.push("/write/create");
  };

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
                        <div className="mt-6 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
                          <img
                            src={article.coverImage}
                            alt="Cover"
                            className="h-80 w-full object-cover"
                          />
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
                  },
                  {
                    label: "Edit",
                    onClick: handleEditAgain,
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