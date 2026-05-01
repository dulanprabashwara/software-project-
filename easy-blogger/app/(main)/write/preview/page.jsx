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
import { getArticleFromResponse } from "../../../../lib/articles/utils";

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const articleId = searchParams.get("id");
  const mode = searchParams.get("mode");
  const sourceId = searchParams.get("sourceId");

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { modalState } = useConfirmDialog();

  // Ensures state consistency by clearing temporary backups when moving between editor stages
  const { isEditExistingFlow } = useClearBackupOnLayoutNavigation({
    mode,
    articleId,
  });

  useEffect(() => {
    // Fetches the latest saved draft to ensure the preview accurately reflects the current state
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
      // Moves the article to 'draft' status to prepare it for the final publishing step
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
      // Path 1: User is editing an existing published or draft article
      if (isEditExistingFlow && articleId) {
        router.push(`/write/edit-existing?id=${articleId}`);
        return;
      }

      // Path 2: User is using an existing article as a template for a new one
      if (mode === "edit-as-new" && sourceId) {
        router.push(`/write/edit-as-new?id=${sourceId}`);
        return;
      }

      // Path 3: User is creating a brand new article
      if (mode === "create" && articleId) {
        // Mark as 'editing' to ensure the auto-save system picks up the changes
        await updateDraft(article.id, {
          status: "editing",
        });

        router.push("/write/create");
        return;
      }

      // Default fallback to the creation page
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
            <div className="flex flex-1 items-center justify-center px-8 py-20">
              <p className="text-gray-500">Loading preview...</p>
            </div>
          ) : !article ? null : (
            <>
              <div className="px-8 py-6">
                <div className="mx-auto max-w-4xl pb-6">
                  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
                    <div className="bg-emerald-50/60 px-8 py-8">
                      <h2 className="font-serif text-3xl leading-tight text-gray-900">
                        {article.title}
                      </h2>

                      {article.coverImage ? (
                        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                          <div className="flex min-h-[220px] max-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-white">
                            <img
                              src={article.coverImage}
                              alt="Cover preview"
                              className="max-h-[420px] max-w-full object-contain"
                            />
                          </div>
                        </div>
                      ) : null}

                      <hr className="my-8 border-gray-200" />

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