"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDialog from "../../../../components/article/ConfirmDialog";
import ArticleContentRenderer from "../../../../components/article/ArticleContentRenderer";
import {
  EditorHeader,
  EditorBottomActions,
} from "../../../../components/article/EditorSharedLayout";
import { useConfirmDialog } from "../../../../hooks/articles/useConfirmDialog";
import { useClearBackupOnLayoutNavigation } from "../../../../hooks/articles/useClearBackupOnLayoutNavigation";
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

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { modalState } = useConfirmDialog();

  const { isEditExistingFlow } = useClearBackupOnLayoutNavigation({
    mode,
    articleId,
  });

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

  const handleExitEditor = () => {
    router.push("/home");
  };

  const handlePublish = async () => {
    if (!article?.id) return;

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
    if (!article?.id) return;

    try {
      if (isEditExistingFlow && articleId) {
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
        <main className="min-h-screen pt-3">
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