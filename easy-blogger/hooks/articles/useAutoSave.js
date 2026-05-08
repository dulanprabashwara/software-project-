"use client";

import { useEffect, useRef } from "react";
import { AUTOSAVE_DELAY_MS } from "../../lib/articles/editorConstants";

export function useAutosave({
  enabled,
  onSave,
  watchValues = [],
}) {
  //Keeps the latest save function available inside delayed timers
  const latestOnSaveRef = useRef(onSave);

  useEffect(() => {
    latestOnSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    //Prevents autosave from running during invalid editor states
    if (!enabled) 
      return;

    const timer = setTimeout(() => {
      //Avoids blocking the UI while autosave runs asynchronously
      void latestOnSaveRef.current();
    }, AUTOSAVE_DELAY_MS);
    //Cancels outdated autosave attempts while the user is still typing
    return () => clearTimeout(timer);
  }, [enabled, ...watchValues]);
}