"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * useEditorNavigationGuard
 * 
 * This hook provides a robust mechanism to prevent accidental navigation away
 * from the article editor. It is designed to be COMPLETELY STABLE and does 
 * not re-run its effects or re-bind its listeners when the editor state changes.
 */
export function useEditorNavigationGuard({
  enabled,
  isHydrating,
  isSaving,
  openModal,
  closeModal,
  onSaveBeforeLeave,
  onDiscardBeforeLeave,
}) {
  const isPromptActiveRef = useRef(false);
  const pendingExternalActionRef = useRef(null);
  const bypassExternalActionGuardRef = useRef(false);

  // We use refs for EVERYTHING that changes during the editing session.
  // This ensures our effect and callbacks NEVER change identity, which prevents 
  // the "always display" bug caused by effect re-runs on every keystroke.
  const isSavingRef = useRef(isSaving);
  const isHydratingRef = useRef(isHydrating);
  const onSaveRef = useRef(onSaveBeforeLeave);
  const onDiscardRef = useRef(onDiscardBeforeLeave);

  // Sync refs with the latest props without triggering any re-renders or effect re-runs
  useEffect(() => {
    isSavingRef.current = isSaving;
    isHydratingRef.current = isHydrating;
    onSaveRef.current = onSaveBeforeLeave;
    onDiscardRef.current = onDiscardBeforeLeave;
  }, [isSaving, isHydrating, onSaveBeforeLeave, onDiscardBeforeLeave]);

  const runPendingExternalAction = useCallback(() => {
    const action = pendingExternalActionRef.current;
    pendingExternalActionRef.current = null;

    if (!action) return;

    bypassExternalActionGuardRef.current = true;

    Promise.resolve().then(() => {
      action();
      setTimeout(() => {
        bypassExternalActionGuardRef.current = false;
      }, 100);
    });
  }, []);

  const handleExternalActionAttempt = useCallback(() => {
    // If a prompt is already visible, or the editor is currently busy with loading,
    // we do not show the modal.
    if (isPromptActiveRef.current || isHydratingRef.current) {
      return;
    }

    isPromptActiveRef.current = true;

    openModal({
      title: "Save article?",
      message: "Do you want to save the article before leaving this page?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          // Use the latest save function from Ref to avoid dependency updates
          const didSave = await onSaveRef.current();
          if (!didSave) {
            pendingExternalActionRef.current = null;
            closeModal();
            return;
          }
          closeModal();
          runPendingExternalAction();
        } finally {
          isPromptActiveRef.current = false;
        }
      },
      onCancel: async () => {
        try {
          // Use the latest discard function from Ref to avoid dependency updates
          const didDiscard = await onDiscardRef.current();
          if (!didDiscard) {
            pendingExternalActionRef.current = null;
            return;
          }
          runPendingExternalAction();
        } finally {
          isPromptActiveRef.current = false;
        }
      },
      onClose: async () => {
        pendingExternalActionRef.current = null;
        isPromptActiveRef.current = false;
      },
    });
  }, [closeModal, openModal, runPendingExternalAction]);

  useEffect(() => {
    if (!enabled) return;

    // --- 1. Browser History Guard (Back Button) ---
    // We push a dummy state once per session. Stable dependencies mean this won't
    // re-run and pollute the history stack.
    if (typeof window !== "undefined" && !window.history.state?.guarded) {
      window.history.pushState({ guarded: true }, "");
    }

    const handlePopState = (event) => {
      if (bypassExternalActionGuardRef.current) return;

      if (isHydratingRef.current) {
        window.history.pushState({ guarded: true }, ""); 
        return;
      }

      window.history.pushState({ guarded: true }, "");

      pendingExternalActionRef.current = () => {
        window.history.go(-2);
      };

      handleExternalActionAttempt();
    };

    // --- 2. Layout Link Interception (Sidebar/Header) ---
    const handleDocumentClickCapture = (event) => {
      if (bypassExternalActionGuardRef.current || isHydratingRef.current) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link) return;

      const isLayoutNavigation = link.closest("header, aside");
      const isExplicitlySkipped = link.closest("[data-skip-save-prompt='true']");

      if (isLayoutNavigation && !isExplicitlySkipped) {
        event.preventDefault();
        event.stopPropagation();

        pendingExternalActionRef.current = () => {
          link.click();
        };

        handleExternalActionAttempt();
      }
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClickCapture, true);

      if (typeof window !== "undefined" && window.history.state?.guarded && !bypassExternalActionGuardRef.current) {
        bypassExternalActionGuardRef.current = true;
        window.history.back();
      }
    };
  }, [enabled, handleExternalActionAttempt]); 

  return {
    handleExternalActionAttempt,
    pendingExternalActionRef,
  };
}