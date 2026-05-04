import { useCallback, useEffect, useRef } from "react";
import { clearEditExistingBackup } from "../../lib/articles/api";
import { clearPreviewContext } from "../../lib/articles/previewContext";

export function useClearBackupOnLayoutNavigation({ mode, articleId }) {
  const isReplayingNavigationRef = useRef(false);
  const isEditExistingFlow = mode === "edit-existing";

  const clearBackupBeforeLeaving = useCallback(async () => {
    // 1. Always clear the temporary frontend preview context
    clearPreviewContext();

    // 2. Only clear the server-side edit-existing backup if applicable
    if (!isEditExistingFlow || !articleId) return;

    await clearEditExistingBackup(articleId);
  }, [articleId, isEditExistingFlow]);

  useEffect(() => {
    // We attach the listener regardless of mode to ensure previewContext is always
    // cleared when leaving the editor/preview workflow via layout navigation.
    const handleDocumentClickCapture = (event) => {
      if (isReplayingNavigationRef.current) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link) return;

      if (!link.closest("header, aside")) return;
      if (link.closest("[data-keep-edit-backup='true']")) return;
      if (link.closest("[data-skip-save-prompt='true']")) return;

      event.preventDefault();
      event.stopPropagation();

      const replayNavigation = () => {
        isReplayingNavigationRef.current = true;
        link.click();

        setTimeout(() => {
          isReplayingNavigationRef.current = false;
        }, 0);
      };

      void clearBackupBeforeLeaving()
        .catch((error) => {
          console.error("Failed to clear editor session data:", error);
        })
        .finally(replayNavigation);
    };

    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", handleDocumentClickCapture, true);
    };
  }, [clearBackupBeforeLeaving]);

  return { isEditExistingFlow, clearBackupBeforeLeaving };
}