"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

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

  useEffect(() => {
    if (timing !== "now") return;

    const now = new Date();
    const y = now.getFullYear();
    const m = pad2(now.getMonth() + 1);
    const d = pad2(now.getDate());
    const hh = pad2(now.getHours());
    const mm = pad2(now.getMinutes());

    setScheduledDate(`${y}-${m}-${d}`);
    setScheduledTime(`${hh}:${mm}`);
    setDateOpen(false);
    setTimeOpen(false);

    // sync 12h picker values
    const hhNum = now.getHours();
    const period = hhNum >= 12 ? "PM" : "AM";
    const hour = hhNum % 12 === 0 ? 12 : hhNum % 12;
    setTpHour(String(hour));
    setTpMinute(pad2(now.getMinutes()));
    setTpPeriod(period);
  }, [timing]);

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
        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

      {/*Tags input section*/}
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

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        {/*Publish timing section*/}
        <Section title="Publish Timing">
          <div className="flex items-start justify-between gap-8">
            {/* Left: radio */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                type="radio"
                name="timing"
                checked={timing === "now"}
                onChange={() => setTiming("now")}
                />
                  Publish now
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                type="radio"
                name="timing"
                checked={timing === "schedule"}
                onChange={() => setTiming("schedule")}
                />
                  Schedule for later
              </label>
            </div>

            {/* Right: date + time pickers */}
            <div className="w-72 space-y-3">
              {/* Date */}
              <div className="relative">
                <button
                type="button"
                disabled={timing !== "schedule"}
                onClick={() => {
                  if (timing !== "schedule") return;
                  setDateOpen(true);
                  setTimeOpen(false);
                }}
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
                >
                {scheduledDate ? formatDateMMDDYYYY(scheduledDate) : "Pick a date"}
                </button>
                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                {dateOpen && timing === "schedule" && (
                  <div className="absolute right-0 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg z-20">
                    <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => setDateOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="relative">
                <button
                type="button"
                disabled={timing !== "schedule"}
                onClick={() => {
                  if (timing !== "schedule") return;
                  setTimeOpen(true);
                  setDateOpen(false);
                }}
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
                > 
                {scheduledTime ? to12Hour(scheduledTime) : "Pick a time"}
                </button>

                <Clock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                {timeOpen && timing === "schedule" && (
                  <div className="absolute right-0 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg z-20">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Hour</label>
                        <select
                        value={tpHour}
                        onChange={(e) => setTpHour(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-gray-200 px-2 text-sm"
                        >
                
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Minute</label>
                        <select
                        value={tpMinute}
                        onChange={(e) => setTpMinute(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-gray-200 px-2 text-sm"
                        >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">AM/PM</label>
                        <select
                        value={tpPeriod}
                        onChange={(e) => setTpPeriod(e.target.value)}
                        className="mt-1 w-full h-10 rounded-md border border-gray-200 px-2 text-sm"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>

                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                      type="button"
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        const time24 = to24Hour(tpHour, tpMinute, tpPeriod);
                        setScheduledTime(time24);
                        setTimeOpen(false);
                      }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
        
        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>
        
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
