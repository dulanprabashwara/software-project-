"use client";

import { useState } from "react";

{/*Define a reusable section component for better structure and readability*/}
function Section({ title, children }) {
  return (
    <div className="p-10">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function PublishArticlePage() {
  
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(["Technology", "Design", "Blogging"]);
  const MAX_TAGS = 5;
  const [timing, setTiming] = useState("now"); // "now" or "schedule"
  const [scheduledDate, setScheduledDate] = useState(""); // "YYYY-MM-DD"
  const [scheduledTime, setScheduledTime] = useState(""); // "HH:MM" 24h
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [tpHour, setTpHour] = useState("10");
  const [tpMinute, setTpMinute] = useState("30");
  const [tpPeriod, setTpPeriod] = useState("AM");

  const addTag = (raw) => {
    const t = raw.trim();
    if (!t) return;

    if (tags.length >= MAX_TAGS) return;

    if (tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;

    setTags((prev) => [...prev, t]);
  };

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const to12Hour = (hhmm) => {
    const [hh, mm] = hhmm.split(":").map(Number);
    const period = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${pad2(mm)} ${period}`;
  };

  const to24Hour = (hour12, minute, period) => {
    let h = parseInt(hour12, 10);
    const m = parseInt(minute, 10);
    if (period === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h += 12;
    }
    return `${pad2(h)}:${pad2(m)}`;
  };

  const formatDateMMDDYYYY = (yyyy_mm_dd) => {
    const [y, m, d] = yyyy_mm_dd.split("-");
    return `${m}/${d}/${y}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-10 text-center">
          <h1 className="text-4xl font-semibold text-gray-900">Publish your Article</h1>
          <p className="mt-3 text-gray-500">
            You can publish now or schedule a time to publish
          </p>
        </div>

        {/*Border line*/}
        <div className="border-t border-gray-100" />

        <Section title="Tags">
          <div className="space-y-3">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              className="w-full h-11 rounded-md border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }
                if (e.key === "Backspace" && tagInput.length === 0 && tags.length > 0) {
                  setTags((prev) => prev.slice(0, -1));
                }
              }}
              disabled={tags.length >= MAX_TAGS}
            />

            <div className="flex flex-wrap items-center gap-3">
              {tags.map((t) => (
                <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="text-gray-700 hover:text-black leading-none"
                >
                  ✕
                </button>
                </span>
              ))}

              <span className="text-sm text-gray-400">
                Add up to {MAX_TAGS} tags
              </span>
            </div>
          </div>
        </Section>

        {/*Border line*/}
        <div className="border-t border-gray-100" />
        
        <div className="p-8 flex items-center justify-between">
          <button className="px-8 py-3 rounded-full bg-black text-white">Back</button>
          <button className="px-8 py-3 rounded-full bg-emerald-500 text-white">
            Schedule post
          </button>
        </div>
        
      </div>
    </div>
  );
}
