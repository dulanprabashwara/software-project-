"use client";

import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { formatDateMMDDYYYY, to12Hour, to24Hour } from "../../../../lib/articles/utils";

/*
 Focused sub-components to keep the main Publish page decluttered and maintainable.
 */
export function Section({ title, children }) {
  return (
    <div className="p-10">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function Toggle({ enabled, setEnabled }) {
  return (
    <button
      type="button"
      onClick={() => setEnabled((value) => !value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-emerald-500" : "bg-gray-300"
        }`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
}

export function Radio({ checked }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${checked ? "border-emerald-500" : "border-gray-300"
        }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
    </span>
  );
}

export function TagSection({
  tagInput,
  setTagInput,
  tags,
  setTags,
  addTag,
  removeTag,
  MAX_TAGS
}) {
  return (
    <Section title="Tags">
      <div className="space-y-3">
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="Add a tag"
          className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
          onKeyDown={(e) => {
            // Trigger addTag when user presses Enter
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(tagInput);
              setTagInput("");
            }
            // Allow deleting the last tag with Backspace if the input is already empty
            if (e.key === "Backspace" && tagInput.length === 0 && tags.length > 0) {
              setTags((prev) => prev.slice(0, -1));
            }
          }}
          disabled={tags.length >= MAX_TAGS}
        />

        <div className="flex flex-wrap items-center gap-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs text-gray-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="leading-none text-gray-700 hover:text-black"
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
  );
}

export function TimingSection({
  timing,
  setTiming,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  dateOpen,
  setDateOpen,
  timeOpen,
  setTimeOpen,
  tpHour,
  setTpHour,
  tpMinute,
  setTpMinute,
  tpPeriod,
  setTpPeriod,
  isPastDateTime,
}) {
  return (
    <Section title="Publish Timing">
      <div className="flex items-start justify-between gap-8">
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

        <div className="w-72 space-y-3">
          <div className="relative" data-picker>
            <button
              type="button"
              disabled={timing !== "schedule"}
              onClick={() => {
                if (timing !== "schedule") return;
                setDateOpen((prev) => !prev);
                setTimeOpen(false);
              }}
              className="h-11 w-full rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
            >
              {scheduledDate ? formatDateMMDDYYYY(scheduledDate) : "Pick a date"}
            </button>
            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            {/* Standard native date picker wrapped in a custom UI for better styling control */}
            {dateOpen && timing === "schedule" && (
              <div className="absolute right-0 z-20 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
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

          <div className="relative" data-picker>
            <button
              type="button"
              disabled={timing !== "schedule"}
              onClick={() => {
                if (timing !== "schedule") return;
                setTimeOpen((prev) => !prev);
                setDateOpen(false);
              }}
              className="h-11 w-full rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
            >
              {scheduledTime ? to12Hour(scheduledTime) : "Pick a time"}
            </button>
            <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

            {timeOpen && timing === "schedule" && (
              <div className="absolute right-0 z-20 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Hour</label>
                    <select
                      value={tpHour}
                      onChange={(e) => setTpHour(e.target.value)}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 px-2 text-sm"
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
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 px-2 text-sm"
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
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 px-2 text-sm"
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
                      setScheduledTime(to24Hour(tpHour, tpMinute, tpPeriod));
                      setTimeOpen(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error message for invalid scheduling attempts */}
          {timing === "schedule" && isPastDateTime() && (
            <p className="mt-3 text-sm text-red-500">
              You cannot schedule an article in the past.
            </p>
          )}
        </div>
      </div>

      {scheduledDate && scheduledTime && (
        <div className="mt-6 text-sm">
          <p className="text-gray-600">This article will be published on</p>
          <p className="mt-1 font-semibold text-gray-900">
            {formatDateMMDDYYYY(scheduledDate)} at {to12Hour(scheduledTime)}
          </p>
        </div>
      )}
    </Section>
  );
}

export function SocialSharingSection({
  shareLinkedIn,
  setShareLinkedIn,
  shareWordPress,
  setShareWordPress,
  setWpCheckDone,
  wpCheckDone,
  wpConnected,
  wpUsername,
  wpPublishError,
  setLiCheckDone,
  liCheckDone,
  liConnected,
  liUsername,
  showShareText,
  shareText,
}) {
  return (
    <Section title="Social Sharing">
      <div className="space-y-6">
        {/* LinkedIn Toggle */}
        <div className="grid grid-cols-[48px_1fr] grid-rows-2 gap-y-0">
          <div className="flex items-center">
            <Toggle
              enabled={shareLinkedIn}
              setEnabled={(val) => {
                setShareLinkedIn(val);
                if (val) setLiCheckDone(false);
              }}
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-900">Share on LinkedIn</p>
          </div>
          <div className="col-span-2">
            <div className={`grid grid-cols-[48px_1fr] items-center transition-all duration-300 ease-out ${shareLinkedIn ? "max-h-20 translate-y-0 opacity-100" : "max-h-0 -translate-y-1 overflow-hidden opacity-0"
              }`}>
              <div className="flex items-center justify-center">
                <Image src="/icons/linkedin.png" alt="LinkedIn" width={48} height={48} className="object-contain" />
              </div>
              {!liCheckDone && shareLinkedIn ? (
                <p className="text-sm text-gray-400">Checking LinkedIn connection...</p>
              ) : liConnected ? (
                <p className="text-sm text-gray-700">
                  Connected as <span className="font-semibold">{liUsername || "LinkedIn User"}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  <a href="/profile/edit" className="text-[#0077B5] underline hover:text-[#005582]">
                    Connect to LinkedIn
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WordPress Toggle */}
        <div className="grid grid-cols-[48px_1fr] grid-rows-2 gap-y-0">
          <div className="flex items-center">
            <Toggle
              enabled={shareWordPress}
              setEnabled={(val) => {
                setShareWordPress(val);
                if (val) setWpCheckDone(false);
              }}
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-900">Share on WordPress</p>
          </div>
          <div className="col-span-2">
            <div className={`grid grid-cols-[48px_1fr] items-center transition-all duration-300 ease-out ${shareWordPress ? "max-h-20 translate-y-0 opacity-100" : "max-h-0 -translate-y-1 overflow-hidden opacity-0"
              }`}>
              <div className="flex items-center justify-center">
                <Image src="/icons/wordpress.png" alt="WordPress" width={48} height={48} className="object-contain" />
              </div>
              {!wpCheckDone && shareWordPress ? (
                <p className="text-sm text-gray-400">Checking WordPress connection...</p>
              ) : wpConnected ? (
                <p className="text-sm text-gray-700">
                  Connected as <span className="font-semibold">{wpUsername || "WordPress User"}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  <a href="/profile/edit" className="text-[#21759B] underline hover:text-[#1A5F7A]">
                    Connect to WordPress
                  </a>
                </p>
              )}
            </div>
            {wpPublishError && shareWordPress && (
              <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
                <span>⚠</span>
                <span>{wpPublishError}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`transition-all duration-300 ease-out ${showShareText ? "max-h-20 translate-y-0 opacity-100" : "max-h-0 -translate-y-1 overflow-hidden opacity-0"
          }`}>
          {shareText && <p className="text-sm text-gray-500">{shareText}</p>}
        </div>
      </div>
    </Section>
  );
}

export function LinkedInCaptionSection({ shareLinkedIn, linkedinCaption, setLinkedinCaption }) {
  return (
    <Section title="LinkedIn Caption (Optional)">
      <div className="space-y-3">
        {shareLinkedIn ? (
          <>
            <input
              type="text"
              value={linkedinCaption}
              onChange={(e) => setLinkedinCaption(e.target.value)}
              placeholder="Write a caption for LinkedIn..."
              className="h-11 w-full rounded-md border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <div className="flex items-center gap-6 text-sm">
              <button type="button" className="text-gray-600 hover:text-gray-900">Change account</button>
              <button type="button" className="text-red-500 hover:text-red-600">Disconnect</button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Enable LinkedIn sharing to add a caption.</p>
        )}
      </div>
    </Section>
  );
}
