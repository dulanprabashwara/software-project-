"use client";

import { AlertTriangle } from "lucide-react";

export default function EditorInlineError({ title, message }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#FEE2E2]">
          <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
        </div>
        <div>
          {title ? (
            <h3 className="text-sm font-semibold text-[#B91C1C]">{title}</h3>
          ) : null}
          <p className="mt-1 text-sm leading-6 text-[#DC2626]">{message}</p>
        </div>
      </div>
    </div>
  );
}