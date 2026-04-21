"use client";

import { useEffect, useRef } from "react";
import { AUTOSAVE_DELAY_MS } from "../../lib/articles/editorConstants";

export function useAutosave({
  enabled,
  onSave,
  watchValues = [],
}) {
  const latestOnSaveRef = useRef(onSave);

  useEffect(() => {
    latestOnSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      void latestOnSaveRef.current();
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [enabled, ...watchValues]);
}