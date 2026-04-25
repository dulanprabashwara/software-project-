"use client";

import { Image as ImageIcon, X } from "lucide-react";

export default function CoverImageField({
  coverImage,
  coverImageError,
  isCoverImageErrorVisible,
  fileInputRef,
  onImageUpload,
  onRemoveImage,
  onDropImage,
}) {
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-4">
      <label className="block text-sm font-semibold text-[#111827] mb-3">
        Add Cover Image
      </label>

      {coverImageError ? (
        <div
          className={`mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 shadow-sm transition-opacity duration-500 ${
            isCoverImageErrorVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm font-medium text-[#DC2626]">
            {coverImageError}
          </p>
        </div>
      ) : null}

      {!coverImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDropImage}
          className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center cursor-pointer hover:border-[#1ABC9C] transition-colors bg-white"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-[#6B7280]" />
            </div>

            <div>
              <p className="text-sm font-medium text-[#111827] mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-[#6B7280]">
                PNG, JPG, GIF or WEBP (Max 5 MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg border-2 border-[#E5E7EB] bg-white p-3">
          <div className="relative flex max-h-[320px] min-h-[180px] items-center justify-center overflow-hidden bg-white">
            <img
              src={coverImage}
              alt="Cover preview"
              className="max-h-[320px] max-w-full object-contain"
            />

            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute right-3 top-3 z-20 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-[#F8FAFC]"
              aria-label="Remove cover image"
            >
              <X className="h-5 w-5 text-[#DC2626]" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onImageUpload}
        className="hidden"
      />

      {!coverImage && (
        <p className="text-xs text-[#DC2626] mt-2">*Required</p>
      )}
    </div>
  );
}