"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../../components/layout/Header";
import Sidebar from "../../../../components/layout/Sidebar";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { getDraftById, updateDraft } from "../../../../lib/articles/api";
import ArticleContentRenderer from "../../../../components/article/ArticleContentRenderer";

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

  const mainClassName = useMemo(
    () =>
      `pt-16 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ease-in-out ${
        sidebarOpen ? "ml-60" : "ml-0"
      }`,
    [sidebarOpen],
  );

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

  const actions = [
    {
      label: "Exit from the editor ?",
      buttonText: "Exit Editor",
      onClick: handleExitEditor,
      buttonClassName: "bg-black px-7",
    },
    {
      label: "Publish Now ?",
      buttonText: "Publish",
      onClick: handlePublish,
      buttonClassName: "bg-[#1ABC9C] px-8",
    },
    {
      label: "Edit Again?",
      buttonText: "Edit",
      onClick: handleEditAgain,
      buttonClassName: "bg-black px-7",
    },
  ];

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
          <div className="shrink-0 border-b border-[#E5E7EB] bg-white px-6 py-3">
            <div className="mx-auto max-w-5xl text-center">
              <h1 className="text-2xl font-serif font-bold text-[#111827]">
                Preview your Article
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Review the saved article before publishing or editing again
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center px-8">
              <p className="text-[#6B7280]">Loading preview...</p>
            </div>
          ) : !article ? null : (
            <>
              <div className="flex-1 overflow-y-auto px-8 py-6">
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
                            className="h-[320px] w-full object-cover"
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

              <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-6 py-2">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 text-center">
                  {actions.map((action) => (
                    <div
                      key={action.buttonText}
                      className="flex flex-1 flex-col items-center"
                    >
                      <p className="mb-1 text-sm italic text-[#6B7280]">
                        {action.label}
                      </p>
                      <button
                        type="button"
                        onClick={action.onClick}
                        className={`rounded-full py-2 text-sm font-medium text-white ${action.buttonClassName}`}
                      >
                        {action.buttonText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}