import { useCallback, useEffect, useRef } from "react";
import { clearEditExistingBackup } from "../../lib/articles/api";

export function useClearBackupOnLayoutNavigation({ mode, articleId }) {
  const isReplayingNavigationRef = useRef(false);
  const isEditExistingFlow = mode === "edit-existing";

  const clearBackupBeforeLeaving = useCallback(async () => {
    if (!isEditExistingFlow || !articleId) return;

    await clearEditExistingBackup(articleId);
  }, [articleId, isEditExistingFlow]);

  useEffect(() => {
    if (!isEditExistingFlow || !articleId) return;

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
          console.error("Failed to clear edit-existing backup:", error);
        })
        .finally(replayNavigation);
    };

    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", handleDocumentClickCapture, true);
    };
  }, [articleId, clearBackupBeforeLeaving, isEditExistingFlow]);

  return { isEditExistingFlow, clearBackupBeforeLeaving };
}