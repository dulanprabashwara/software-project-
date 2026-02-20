"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

//Define a reusable section component for better structure and readability
function Section({ title, children }) {
  return (
    <div className="p-10">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Toggle({ enabled, setEnabled }) {
  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? "bg-emerald-500" : "bg-gray-300"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Radio({ checked }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${
        checked ? "border-emerald-500" : "border-gray-300"
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
    </span>
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

  // Social sharing
  const [shareLinkedIn, setShareLinkedIn] = useState(true);
  const [shareWordPress, setShareWordPress] = useState(true);


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
    if (!hhmm) return "";
    const parts = hhmm.split(":");
    if (parts.length !== 2) return "";
    const [hh, mm] = parts.map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return "";
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
    if (!yyyy_mm_dd) return "";
    const parts = yyyy_mm_dd.split("-");
    if (parts.length !== 3) return "";
    const [y, m, d] = parts;
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

  useEffect(() => {
    if (timing !== "schedule") return;
    if (scheduledDate && scheduledTime) return;

    const now = new Date();
    const y = now.getFullYear();
    const m = pad2(now.getMonth() + 1);
    const d = pad2(now.getDate());

    setScheduledDate(`${y}-${m}-${d}`);
    setScheduledTime("10:30");
    setTpHour("10");
    setTpMinute("30");
    setTpPeriod("AM");
  }, [timing]);

  useEffect(() => {
    const onClick = (e) => {
      // close if click outside any popover container
      if (!e.target.closest?.("[data-picker]")) {
        setDateOpen(false);
        setTimeOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  

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
              <button
              type="button"
              onClick={() => setTiming("now")}
              className="flex items-center gap-3 text-sm text-gray-700"
              >
                <Radio checked={timing === "now"} />
                Publish now
              </button>

              <button
              type="button"
              onClick={() => setTiming("schedule")}
              className="flex items-center gap-3 text-sm text-gray-700"
              >
                <Radio checked={timing === "schedule"} />
                Schedule for later
              </button>
            </div>

            {/* Right: date + time pickers */}
            <div className="w-72 space-y-3">
              {/* Date */}
              <div className="relative" data-picker>
                <button
                type="button"
                disabled={timing !== "schedule"}
                onClick={() => {
                  if (timing !== "schedule") return;
                  setDateOpen((prev) => !prev);
                  setTimeOpen(false);
                }}
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
                >
                {scheduledDate ? formatDateMMDDYYYY(scheduledDate) : "Pick a date"}
                </button>
                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              <div className="relative" data-picker>
                <button
                type="button"
                disabled={timing !== "schedule"}
                onClick={() => {
                  if (timing !== "schedule") return;
                  setTimeOpen((prev) => !prev);
                  setDateOpen(false);
                }}
                className="w-full h-11 rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
                > 
                {scheduledTime ? to12Hour(scheduledTime) : "Pick a time"}
                </button>

                <Clock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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

          {scheduledDate && scheduledTime && (
            <div className="mt-6 text-sm">
              <p className="text-gray-600">
                This article will be published on
              </p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatDateMMDDYYYY(scheduledDate)} at {to12Hour(scheduledTime)}
              </p>
            </div>
          )}

        </Section>

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <Section title="Social Sharing">
          <div className="space-y-6">
            {/* LinkedIn */}
            <div className="flex items-start gap-4">
              <Toggle enabled={shareLinkedIn} setEnabled={setShareLinkedIn} />
              <div>
                <p className="text-sm">
                  Share on <span className="font-semibold">LinkedIn</span>
                </p>
                <p className="text-sm text-gray-500">
                  Connected as <span className="font-semibold">Emma Richardson</span>
                </p>
              </div>
            </div>

            {/* WordPress */}
            <div className="flex items-start gap-4">
              <Toggle enabled={shareWordPress} setEnabled={setShareWordPress} />
              <div>
                <p className="text-sm">
                  Share on <span className="font-semibold">WordPress</span>
                </p>
                <p className="text-sm text-gray-500">
                  Connected as <span className="font-semibold">Emma Richardson</span>
                </p>
              </div>
            </div>

            {/* Dynamic Share Message */}
            {(shareLinkedIn || shareWordPress) && (
              <p className="text-sm text-gray-500">
                This article will be shared on{" "}
                {shareLinkedIn && "LinkedIn"}
                {shareLinkedIn && shareWordPress && " and "}
                {shareWordPress && "WordPress"}{" "}
                when it is published
              </p>
            )}
          </div>

        </Section>
        
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
