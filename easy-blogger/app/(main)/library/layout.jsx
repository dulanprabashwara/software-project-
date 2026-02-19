"use client";

import { useState } from "react";

export default function ThreeColumnLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden">
      {/* Top bar */}
      <div className="min-h-16 flex items-center border-b px-4">
        <button
          onClick={() => setOpen((p) => !p)}
          className="px-3 py-2 rounded border"
        >
          Toggle Left
        </button>
      </div>

      {/* 3-column row */}
      <div className="  flex overflow-hidden">
        {/* L: Left sidebar (starts hidden, then takes space) */}
        <aside
          className={`
              block overflow-hidden border-r bg-white
            transition-[width] duration-300 ease-in-out
            ${open ? "w-64" : "w-0"}
          `}
        >
          {/* Keep inner content from squeezing when width animates */}
          <div>
            <h2 className="font-bold mb-2">Left</h2>
            <p className="text-sm text-gray-600">
              Sidebar content
            </p>
          </div>
        </aside>

        {/* M: Middle (fills between L and R, shifts & shrinks automatically) */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4">
          <h1 className="text-xl font-bold mb-4">Middle</h1>
          <p className="text-sm text-gray-700">
            This area expands when the left is closed, and shrinks when the left opens.
            The right column never moves.
          </p>

          {/* Demo content */}
          <div className="mt-6 space-y-3">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="p-3 border rounded">
                Item {i + 1}
              </div>
            ))}
          </div>
        </main>

        {/* R: Right panel (fixed width, never moves) */}
        <aside className=" lg:block w-80 shrink-0 border-l bg-white overflow-y-auto p-4">
          <h2 className="font-bold mb-2">Right</h2>
          <p className="text-sm text-gray-600">Always fixed</p>
        </aside>
      </div>
    </div>
  );
}
