"use client";

import { useCallback, useEffect, useRef } from "react";

function isTinyMceUiElement(element) {
  if (!(element instanceof Element))
    return false;

  return Boolean(
    element.closest(
      [
        ".tox",
        ".tox-tinymce-aux",
        ".tox-dialog",
        ".tox-dialog-wrap",
        ".tox-menu",
        ".tox-collection",
        ".tox-toolbar",
        ".tox-toolbar__group",
        ".mce-content-body",
      ].join(","),
    ),
  );
}

export function useEditorNavigationGuard({
  enabled,
  isHydrating,
  isSaving,
  isModalOpen,
  editingSectionRef,
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
    if (!enabled) return;

    const handleDocumentClickCapture = (event) => {
      if (
        bypassExternalActionGuardRef.current ||
        isHydrating ||
        isSaving ||
        isModalOpen
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element))
        return;
      if (isTinyMceUiElement(target))
        return;

      const clickableElement = target.closest("button, a, [role='button']");
      if (!clickableElement)
        return;

      if (clickableElement.closest("[data-skip-save-prompt='true']"))
        return;
      if (editingSectionRef.current?.contains(clickableElement))
        return;
      if (isTinyMceUiElement(clickableElement))
        return;

      pendingExternalActionRef.current = () => {
        clickableElement.click();
      };

      event.preventDefault();
      event.stopPropagation();

      handleExternalActionAttempt();
    };

    document.addEventListener("click", handleDocumentClickCapture, true);

    return () => {
      document.removeEventListener("click", handleDocumentClickCapture, true);
    };
  }, [
    enabled,
    editingSectionRef,
    handleExternalActionAttempt,
    isHydrating,
    isModalOpen,
    isSaving,
  ]);

  return {
    handleExternalActionAttempt,
    pendingExternalActionRef,
  };
}