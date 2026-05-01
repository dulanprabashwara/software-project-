"use client";

import { useCallback, useEffect, useRef } from "react";


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

  const runPendingExternalAction = useCallback(() => {
    const action = pendingExternalActionRef.current;
    pendingExternalActionRef.current = null;

    if (!action)
      return;

    bypassExternalActionGuardRef.current = true;

    Promise.resolve().then(() => {
      action();

      setTimeout(() => {
        bypassExternalActionGuardRef.current = false;
      }, 0);
    });
  }, []);

  const handleExternalActionAttempt = useCallback(() => {
    if (isPromptActiveRef.current)
      return;

    isPromptActiveRef.current = true;

    openModal({
      title: "Save article?",
      message: "Do you want to save the article before leaving this page?",
      confirmText: "Yes",
      cancelText: "No",
      onConfirm: async () => {
        try {
          const didSave = await onSaveBeforeLeave();

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
          const didDiscard = await onDiscardBeforeLeave();

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
  }, [
    closeModal,
    onDiscardBeforeLeave,
    onSaveBeforeLeave,
    openModal,
    runPendingExternalAction,
  ]);

  useEffect(() => {
    if (!enabled || isHydrating || isSaving) return;

    // Push a dummy state to history so that the back button has something to pop without immediately leaving the current page.
    window.history.pushState({ guarded: true }, "");

    const handlePopState = (event) => {
      if (bypassExternalActionGuardRef.current || isHydrating || isSaving) return;

      // The user clicked back, which popped our dummy state.
      // We push it back immediately to "stay" on the page while the modal is open.
      window.history.pushState({ guarded: true }, "");

      // Define the action to take if the user confirms leaving.
      // We need to go back twice: 
      // 1. To clear the dummy state we just pushed.
      // 2. To actually perform the original back navigation.
      pendingExternalActionRef.current = () => {
        window.history.go(-2);
      };

      handleExternalActionAttempt();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // If we are unmounting and still have our dummy state, clean it up to avoid polluting the history stack.
      if (window.history.state?.guarded) {
        window.history.back();
      }
    };
  }, [enabled, isHydrating, isSaving, handleExternalActionAttempt]);

  return {
    handleExternalActionAttempt,
    pendingExternalActionRef,
  };
}