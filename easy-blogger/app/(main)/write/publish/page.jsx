"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import Image from "next/image";

const STORAGE_KEYS = {
  publishArticleTitle: "publish_article_title",
  publishSourceArticleId: "publish_source_article_id",
  publishDraft: "publish_article_draft",
  publishedArticleData: "published_article_data",
};

const MAX_TAGS = 5;

const createDefaultPublishDraft = () => ({
  tags: ["Technology", "Design", "Blogging"],
  timing: "now",
  scheduledDate: "",
  scheduledTime: "",
  shareLinkedIn: true,
  shareWordPress: true,
  linkedinCaption: "",
});

function Section({ title, children }) {
  return (
    <div className="p-10">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Toggle({ enabled, setEnabled }) {
  return (
    <button
      type="button"
      onClick={() => setEnabled((value) => !value)}
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

function readPublishDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawDraft = sessionStorage.getItem(STORAGE_KEYS.publishDraft);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft);
  } catch (error) {
    console.error("Failed to parse publish draft", error);
    return null;
  }
}

function readPublishArticleTitle() {
  if (typeof window === "undefined") {
    return "";
  }

  return sessionStorage.getItem(STORAGE_KEYS.publishArticleTitle) || "";
}

function readPublishSourceArticleId() {
  if (typeof window === "undefined") {
    return "";
  }

  return sessionStorage.getItem(STORAGE_KEYS.publishSourceArticleId) || "";
}

function buildSelectedPlatforms({ shareLinkedIn, shareWordPress }) {
  const platforms = ["Easy Blogger"];

  if (shareLinkedIn) platforms.push("LinkedIn");
  if (shareWordPress) platforms.push("WordPress");

  return platforms;
}

export default function PublishArticlePage() {
  const router = useRouter();
  const defaultDraft = useMemo(() => createDefaultPublishDraft(), []);

  const [articleTitle, setArticleTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(defaultDraft.tags);
  const [timing, setTiming] = useState(defaultDraft.timing);
  const [scheduledDate, setScheduledDate] = useState(defaultDraft.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(defaultDraft.scheduledTime);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [tpHour, setTpHour] = useState("10");
  const [tpMinute, setTpMinute] = useState("30");
  const [tpPeriod, setTpPeriod] = useState("AM");
  const [shareLinkedIn, setShareLinkedIn] = useState(defaultDraft.shareLinkedIn);
  const [shareWordPress, setShareWordPress] = useState(defaultDraft.shareWordPress);
  const [shareText, setShareText] = useState("");
  const [showShareText, setShowShareText] = useState(false);
  const [linkedinCaption, setLinkedinCaption] = useState(defaultDraft.linkedinCaption);

  const pad2 = (value) => String(value).padStart(2, "0");

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
    let hours = parseInt(hour12, 10);
    const minutes = parseInt(minute, 10);

    if (period === "AM") {
      if (hours === 12) hours = 0;
    } else if (hours !== 12) {
      hours += 12;
    }

    return `${pad2(hours)}:${pad2(minutes)}`;
  };

  const formatDateMMDDYYYY = (yyyyMmDd) => {
    if (!yyyyMmDd) return "";

    const parts = yyyyMmDd.split("-");
    if (parts.length !== 3) return "";

    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  };

  const buildPublishDraft = () => ({
    tags,
    timing,
    scheduledDate,
    scheduledTime,
    shareLinkedIn,
    shareWordPress,
    linkedinCaption,
  });

  const savePublishDraft = () => {
    sessionStorage.setItem(
      STORAGE_KEYS.publishDraft,
      JSON.stringify(buildPublishDraft())
    );
  };

  const addTag = (rawValue) => {
    const trimmedTag = rawValue.trim();

    if (!trimmedTag) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase())) return;

    setTags((previousTags) => [...previousTags, trimmedTag]);
  };

  const removeTag = (tagToRemove) => {
    setTags((previousTags) =>
      previousTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const isPastDateTime = () => {
    if (!scheduledDate || !scheduledTime) return false;

    const selected = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();

    return selected < now;
  };

  useEffect(() => {
    const storedTitle = readPublishArticleTitle();
    const storedArticleId = readPublishSourceArticleId();

    if (storedTitle) {
      setArticleTitle(storedTitle);
    }

    if (!storedArticleId) {
      sessionStorage.removeItem(STORAGE_KEYS.publishDraft);
      return;
    }

    const rawPreviewArticle = sessionStorage.getItem("preview_article");
    if (!rawPreviewArticle) {
      sessionStorage.removeItem(STORAGE_KEYS.publishDraft);
      return;
    }

    let previewArticle = null;

    try {
      previewArticle = JSON.parse(rawPreviewArticle);
    } catch (error) {
      console.error("Failed to parse preview article", error);
      sessionStorage.removeItem(STORAGE_KEYS.publishDraft);
      return;
    }

    const currentPreviewArticleId = previewArticle?.id || "";

    if (!currentPreviewArticleId || currentPreviewArticleId !== storedArticleId) {
      sessionStorage.removeItem(STORAGE_KEYS.publishDraft);
      return;
    }

    const storedDraft = readPublishDraft();
    if (!storedDraft) return;

    if (Array.isArray(storedDraft.tags)) {
      setTags(storedDraft.tags);
    }

    if (storedDraft.timing === "now" || storedDraft.timing === "schedule") {
      setTiming(storedDraft.timing);
    }

    if (typeof storedDraft.scheduledDate === "string") {
      setScheduledDate(storedDraft.scheduledDate);
    }

    if (typeof storedDraft.scheduledTime === "string") {
      setScheduledTime(storedDraft.scheduledTime);
    }

    if (typeof storedDraft.shareLinkedIn === "boolean") {
      setShareLinkedIn(storedDraft.shareLinkedIn);
    }

    if (typeof storedDraft.shareWordPress === "boolean") {
      setShareWordPress(storedDraft.shareWordPress);
    }

    if (typeof storedDraft.linkedinCaption === "string") {
      setLinkedinCaption(storedDraft.linkedinCaption);
    }
  }, []);

  useEffect(() => {
    if (timing !== "now") return;

    const syncCurrentDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = pad2(now.getMonth() + 1);
      const day = pad2(now.getDate());
      const hours = pad2(now.getHours());
      const minutes = pad2(now.getMinutes());

      setScheduledDate(`${year}-${month}-${day}`);
      setScheduledTime(`${hours}:${minutes}`);
      setDateOpen(false);
      setTimeOpen(false);

      const currentHour = now.getHours();
      const period = currentHour >= 12 ? "PM" : "AM";
      const hour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;

      setTpHour(String(hour12));
      setTpMinute(pad2(now.getMinutes()));
      setTpPeriod(period);
    };

    syncCurrentDateTime();
    const intervalId = setInterval(syncCurrentDateTime, 30_000);

    return () => clearInterval(intervalId);
  }, [timing]);

  useEffect(() => {
    if (timing !== "schedule") return;
    if (scheduledDate && scheduledTime) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = pad2(now.getMonth() + 1);
    const day = pad2(now.getDate());

    setScheduledDate(`${year}-${month}-${day}`);
    setScheduledTime("10:30");
    setTpHour("10");
    setTpMinute("30");
    setTpPeriod("AM");
  }, [timing, scheduledDate, scheduledTime]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest?.("[data-picker]")) {
        setDateOpen(false);
        setTimeOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const selectedPlatforms = [];

    if (shareLinkedIn) selectedPlatforms.push("LinkedIn");
    if (shareWordPress) selectedPlatforms.push("WordPress");

    if (selectedPlatforms.length === 0) {
      setShowShareText(false);

      const timeoutId = setTimeout(() => setShareText(""), 200);
      return () => clearTimeout(timeoutId);
    }

    setShareText(
      `This article will be shared on ${selectedPlatforms.join(" and ")} when it is published`
    );
    setShowShareText(true);
  }, [shareLinkedIn, shareWordPress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-10 text-center">
          <h1 className="text-4xl font-serif font-bold text-[#111827]">
            Publish your Article
          </h1>
          <p className="text-[#6B7280] mt-1">
            You can publish now or schedule a time to
          </p>
          <p className="text-[#6B7280] mt-1">publish</p>
        </div>

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <Section title="Tags">
          <div className="space-y-3">
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              placeholder="Add a tag"
              className="w-full h-11 rounded-md border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(tagInput);
                  setTagInput("");
                }

                if (
                  event.key === "Backspace" &&
                  tagInput.length === 0 &&
                  tags.length > 0
                ) {
                  setTags((previousTags) => previousTags.slice(0, -1));
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
                    setDateOpen((previousValue) => !previousValue);
                    setTimeOpen(false);
                  }}
                  className="w-full h-11 rounded-md border border-gray-200 bg-white px-4 pr-10 text-left text-sm disabled:bg-gray-50"
                >
                  {scheduledDate
                    ? formatDateMMDDYYYY(scheduledDate)
                    : "Pick a date"}
                </button>

                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

                {dateOpen && timing === "schedule" && (
                  <div className="absolute right-0 mt-2 w-full rounded-md border border-gray-200 bg-white p-3 shadow-lg z-20">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(event) => setScheduledDate(event.target.value)}
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

              <div className="relative" data-picker>
                <button
                  type="button"
                  disabled={timing !== "schedule"}
                  onClick={() => {
                    if (timing !== "schedule") return;
                    setTimeOpen((previousValue) => !previousValue);
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
                          onChange={(event) => setTpHour(event.target.value)}
                          className="mt-1 w-full h-10 rounded-md border border-gray-200 px-2 text-sm"
                        >
                          {Array.from({ length: 12 }, (_, index) =>
                            String(index + 1)
                          ).map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">Minute</label>
                        <select
                          value={tpMinute}
                          onChange={(event) => setTpMinute(event.target.value)}
                          className="mt-1 w-full h-10 rounded-md border border-gray-200 px-2 text-sm"
                        >
                          {Array.from({ length: 60 }, (_, index) =>
                            String(index).padStart(2, "0")
                          ).map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500">AM/PM</label>
                        <select
                          value={tpPeriod}
                          onChange={(event) => setTpPeriod(event.target.value)}
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

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <Section title="Social Sharing">
          <div className="space-y-6">
            <div className="grid grid-cols-[48px_1fr] grid-rows-2 gap-y-0">
              <div className="flex items-center">
                <Toggle enabled={shareLinkedIn} setEnabled={setShareLinkedIn} />
              </div>
              <div className="flex items-center">
                <p className="text-sm font-semibold text-gray-900">
                  Share on LinkedIn
                </p>
              </div>

              <div className="col-span-2">
                <div
                  className={`grid grid-cols-[48px_1fr] items-center transition-all duration-300 ease-out ${
                    shareLinkedIn
                      ? "opacity-100 translate-y-0 max-h-20"
                      : "opacity-0 -translate-y-1 max-h-0 overflow-hidden"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 flex items-center justify-center">
                      <Image
                        src="/icons/linkedin.png"
                        alt="LinkedIn"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    Connected as{" "}
                    <span className="font-semibold">Emma Richardson</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[48px_1fr] grid-rows-2 gap-y-0">
              <div className="flex items-center">
                <Toggle enabled={shareWordPress} setEnabled={setShareWordPress} />
              </div>
              <div className="flex items-center">
                <p className="text-sm font-semibold text-gray-900">
                  Share on WordPress
                </p>
              </div>

              <div className="col-span-2">
                <div
                  className={`grid grid-cols-[48px_1fr] items-center transition-all duration-300 ease-out ${
                    shareWordPress
                      ? "opacity-100 translate-y-0 max-h-20"
                      : "opacity-0 -translate-y-1 max-h-0 overflow-hidden"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className="h-12 w-12 flex items-center justify-center">
                      <Image
                        src="/icons/wordpress.png"
                        alt="WordPress"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    Connected as{" "}
                    <span className="font-semibold">Emma Richardson</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-300 ease-out ${
                showShareText
                  ? "opacity-100 translate-y-0 max-h-20"
                  : "opacity-0 -translate-y-1 max-h-0 overflow-hidden"
              }`}
            >
              {shareText && <p className="text-sm text-gray-500">{shareText}</p>}
            </div>
          </div>
        </Section>

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <Section title="LinkedIn Caption (Optional)">
          <div className="space-y-3">
            {shareLinkedIn ? (
              <>
                <input
                  type="text"
                  value={linkedinCaption}
                  onChange={(event) => setLinkedinCaption(event.target.value)}
                  placeholder="Write a caption for LinkedIn..."
                  className="w-full h-11 rounded-md border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                />

                <div className="flex items-center gap-6 text-sm">
                  <button className="text-gray-600 hover:text-gray-900">
                    Change account
                  </button>

                  <button className="text-red-500 hover:text-red-600">
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">
                Enable LinkedIn sharing to add a caption.
              </p>
            )}
          </div>
        </Section>

        <div className="flex justify-center">
          <div className="w-[90%] border-t border-gray-400" />
        </div>

        <div className="p-8 flex items-center justify-center gap-40">
          <button
            onClick={() => router.push("/write/preview")}
            className="px-8 py-3 rounded-full bg-black text-white"
          >
            Back
          </button>

          <button
            onClick={() => {
              savePublishDraft();

              const publishData = {
                title: articleTitle,
                tags,
                platforms: buildSelectedPlatforms({
                  shareLinkedIn,
                  shareWordPress,
                }),
                timing,
                scheduledDate,
                scheduledTime,
                linkedinCaption,
              };

              sessionStorage.setItem(
                STORAGE_KEYS.publishedArticleData,
                JSON.stringify(publishData)
              );

              router.push("/write/articlepublished");
            }}
            disabled={timing === "schedule" && isPastDateTime()}
            className={`px-8 py-3 rounded-full text-white transition ${
              timing === "schedule" && isPastDateTime()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {timing === "schedule" ? "Schedule post" : "Publish now"}
          </button>
        </div>
      </div>
    </div>
  );
}