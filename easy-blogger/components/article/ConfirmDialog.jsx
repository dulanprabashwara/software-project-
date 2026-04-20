"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      data-skip-save-prompt="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
    >
      <div
        data-skip-save-prompt="true"
        className="w-full max-w-md rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-2xl"
      >
        <div className="relative px-6 py-5">
          <button
            type="button"
            onClick={onClose || onCancel}
            disabled={isLoading}
            aria-label="Close confirmation dialog"
            className="absolute right-4 top-4 rounded-full p-2 text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3C7]">
              <AlertTriangle className="h-5 w-5 text-[#D97706]" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F2937] disabled:opacity-50"
          >
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}