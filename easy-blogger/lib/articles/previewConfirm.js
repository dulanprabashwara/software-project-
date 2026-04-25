export function openPreviewSaveConfirm({
  openModal,
  closeModal,
  onSaveAndPreview,
}) {
  openModal({
    title: "Save before preview?",
    message: "Before preview, save the article as a draft.",
    confirmText: "Save and Preview",
    cancelText: "Cancel",

    onConfirm: async () => {
      await onSaveAndPreview();
      closeModal();
    },

    onCancel: async () => {},
    onClose: async () => {},
  });
}