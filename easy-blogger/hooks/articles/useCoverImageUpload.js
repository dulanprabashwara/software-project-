"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  IMAGE_ERROR_FADE_DELAY_MS,
  IMAGE_ERROR_HIDE_DELAY_MS,
  MAX_IMAGE_SIZE_BYTES,
} from "../../lib/articles/editorConstants";

export function useCoverImageUpload({ onChange }) {
  const fileInputRef = useRef(null);
  const timersRef = useRef({
    fade: null,
    clear: null,
  });

  const [coverImageError, setCoverImageError] = useState("");
  const [isCoverImageErrorVisible, setIsCoverImageErrorVisible] =
    useState(false);

  const clearTimers = useCallback(() => {
    if (timersRef.current.fade) {
      clearTimeout(timersRef.current.fade);
      timersRef.current.fade = null;
    }

    if (timersRef.current.clear) {
      clearTimeout(timersRef.current.clear);
      timersRef.current.clear = null;
    }
  }, []);

  const hideError = useCallback(() => {
    clearTimers();
    setCoverImageError("");
    setIsCoverImageErrorVisible(false);
  }, [clearTimers]);

  const showError = useCallback(
    (message) => {
      clearTimers();
      setCoverImageError(message);
      setIsCoverImageErrorVisible(true);

      timersRef.current.fade = setTimeout(() => {
        setIsCoverImageErrorVisible(false);
      }, IMAGE_ERROR_FADE_DELAY_MS);

      timersRef.current.clear = setTimeout(() => {
        setCoverImageError("");
      }, IMAGE_ERROR_HIDE_DELAY_MS);
    },
    [clearTimers],
  );

  const handleImageUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showError("Please upload a valid image file.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showError("File size must be less than 5MB.");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        hideError();
        onChange(reader.result);
      };

      reader.onerror = () => {
        showError("Failed to process the selected image.");
      };

      reader.readAsDataURL(file);
    },
    [hideError, onChange, showError],
  );

  const handleRemoveImage = useCallback(() => {
    onChange(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const handleDropImage = useCallback(
    (event) => {
      event.preventDefault();

      const file = event.dataTransfer.files?.[0];
      if (!file)
        return;

      handleImageUpload({ target: { files: [file] } });
    },
    [handleImageUpload],
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    fileInputRef,
    coverImageError,
    isCoverImageErrorVisible,
    handleImageUpload,
    handleRemoveImage,
    handleDropImage,
  };
}