"use client";

import { useCallback, useState } from "react";

export function useConfirmDialog() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Yes",
    cancelText: "No",
    onConfirm: null,
    onCancel: null,
    onClose: null,
    isLoading: false,
  });

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
      isLoading: false,
      onConfirm: null,
      onCancel: null,
      onClose: null,
    }));
  }, []);

  const openModal = useCallback(
    ({
      title,
      message,
      confirmText = "Yes",
      cancelText = "No",
      onConfirm,
      onCancel,
      onClose,
    }) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        isLoading: false,
        onConfirm: async () => {
          try {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            await onConfirm?.();
          } finally {
            setModalState((prev) => ({ ...prev, isLoading: false }));
          }
        },
        onCancel: async () => {
          try {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            await onCancel?.();
          } finally {
            setModalState((prev) => ({ ...prev, isLoading: false }));
            closeModal();
          }
        },
        onClose: async () => {
          try {
            await onClose?.();
          } finally {
            closeModal();
          }
        },
      });
    },
    [closeModal],
  );

  return {
    modalState,
    openModal,
    closeModal,
  };
}