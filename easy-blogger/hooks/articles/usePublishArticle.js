"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import { API_BASE_URL } from "../../lib/api";
import {
  getDraftById,
  publishArticle as publishEasyBloggerArticle,
} from "../../lib/articles/api";
import {
  formatDateToInput,
  formatTimeToInput,
  pad2,
  to24Hour,
} from "../../lib/articles/utils";
import { clearPreviewContext } from "../../lib/articles/previewContext";

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

export function usePublishArticle(articleId) {
  const router = useRouter();
  const { user: firebaseUser } = useAuth();
  const defaultDraft = useMemo(() => createDefaultPublishDraft(), []);

  // Form State
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(defaultDraft.tags);
  const [timing, setTiming] = useState(defaultDraft.timing);
  const [scheduledDate, setScheduledDate] = useState(defaultDraft.scheduledDate);
  const [scheduledTime, setScheduledTime] = useState(defaultDraft.scheduledTime);
  const [shareLinkedIn, setShareLinkedIn] = useState(defaultDraft.shareLinkedIn);
  const [shareWordPress, setShareWordPress] = useState(defaultDraft.shareWordPress);
  const [linkedinCaption, setLinkedinCaption] = useState(defaultDraft.linkedinCaption);

  // UI State
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showShareText, setShowShareText] = useState(false);

  // Time Picker State
  const [tpHour, setTpHour] = useState("10");
  const [tpMinute, setTpMinute] = useState("30");
  const [tpPeriod, setTpPeriod] = useState("AM");

  // WordPress Connection State
  const [wpConnected, setWpConnected] = useState(false);
  const [wpUsername, setWpUsername] = useState("");
  const [wpCheckDone, setWpCheckDone] = useState(false);
  const [wpPublishError, setWpPublishError] = useState("");

  // LinkedIn Connection State
  const [liConnected, setLiConnected] = useState(false);
  const [liUsername, setLiUsername] = useState("");
  const [liCheckDone, setLiCheckDone] = useState(false);

  // Helpers
  const isPastDateTime = () => {
    if (!scheduledDate || !scheduledTime) return false;
    const selected = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    return selected < now;
  };

  const buildScheduledAt = () => {
    if (timing !== "schedule" || !scheduledDate || !scheduledTime) {
      return null;
    }
    return new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
  };

  // Validates tag uniqueness and length constraints before adding
  const addTag = (rawValue) => {
    const trimmedTag = rawValue.trim();
    if (!trimmedTag || tags.length >= MAX_TAGS)
      return;
    // Case-insensitive check to prevent duplicate tags
    if (tags.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase()))
      return;
    setTags((prev) => [...prev, trimmedTag]);
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Fetches initial article data to populate tags and existing schedule settings
  useEffect(() => {
    const loadArticle = async () => {
      if (!articleId) {
        router.replace("/write/create");
        return;
      }

      try {
        setIsPageLoading(true);
        const response = await getDraftById(articleId);
        const article = response?.data ?? response?.article ?? response ?? null;

        if (!article) {
          router.replace("/write/create");
          return;
        }

        // Extracts and normalizes existing tags, limiting to the maximum allowed
        if (Array.isArray(article.tags) && article.tags.length > 0) {
          setTags(article.tags.slice(0, MAX_TAGS));
        }

        // If the article was already scheduled, restore the date and time components for the UI
        if (article.status === "SCHEDULED" && article.scheduledAt) {
          setTiming("schedule");
          setScheduledDate(formatDateToInput(article.scheduledAt));
          setScheduledTime(formatTimeToInput(article.scheduledAt));

          // Convert 24-hour stored time to 12-hour components for the picker UI
          const scheduled = new Date(article.scheduledAt);
          const currentHour = scheduled.getHours();
          const period = currentHour >= 12 ? "PM" : "AM";
          const hour12 = currentHour % 12 === 0 ? 12 : currentHour % 12;

          setTpHour(String(hour12));
          setTpMinute(pad2(scheduled.getMinutes()));
          setTpPeriod(period);
        }
      } catch (error) {
        console.error("Failed to load publish article:", error);
        setPublishError("Failed to load article data.");
      } finally {
        setIsPageLoading(false);
      }
    };

    void loadArticle();
  }, [articleId, router]);

  // Keeps the schedule time in sync with the current real-world time when 'Publish Now' is selected
  useEffect(() => {
    if (timing !== "now")
      return;

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
    if (timing !== "schedule")
      return;
    if (scheduledDate && scheduledTime)
      return;

    const now = new Date();
    setScheduledDate(`${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`);
    setScheduledTime("10:30");
    setTpHour("10");
    setTpMinute("30");
    setTpPeriod("AM");
  }, [timing, scheduledDate, scheduledTime]);

  // Generates a descriptive message about selected platforms to improve user transparency
  useEffect(() => {
    const selectedPlatforms = [];
    if (shareLinkedIn)
      selectedPlatforms.push("LinkedIn");
    if (shareWordPress)
      selectedPlatforms.push("WordPress");

    if (selectedPlatforms.length === 0) {
      setShowShareText(false);
      const timeoutId = setTimeout(() => setShareText(""), 200);
      return () => clearTimeout(timeoutId);
    }

    setShareText(`This article will be shared on ${selectedPlatforms.join(" and ")} when it is published`);
    setShowShareText(true);
  }, [shareLinkedIn, shareWordPress]);

  // Verifies WordPress connection status to prevent publishing failures on unconnected accounts
  useEffect(() => {
    if (!shareWordPress || !firebaseUser || wpCheckDone) return;

    const checkWordPressConnection = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data?.data?.connected) {
          setWpConnected(true);
          setWpUsername(data.data.wpUsername || "");
        } else {
          setWpConnected(false);
        }
      } catch {
        setWpConnected(false);
      } finally {
        setWpCheckDone(true);
      }
    };

    void checkWordPressConnection();
  }, [shareWordPress, firebaseUser, wpCheckDone]);

  // Verifies LinkedIn connection status
  useEffect(() => {
    if (!shareLinkedIn || !firebaseUser || liCheckDone) return;

    const checkLinkedInConnection = async () => {
      try {
        const token = await firebaseUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/linkedin/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data?.data?.connected) {
          setLiConnected(true);
          setLiUsername(data.data.liUsername || "");
        } else {
          setLiConnected(false);
        }
      } catch {
        setLiConnected(false);
      } finally {
        setLiCheckDone(true);
      }
    };

    void checkLinkedInConnection();
  }, [shareLinkedIn, firebaseUser, liCheckDone]);

  const handleWordPressPublish = async (currentArticleId) => {
    if (!shareWordPress || !wpConnected || !currentArticleId || !firebaseUser)
      return;

    try {
      const token = await firebaseUser.getIdToken();
      const scheduledAt = buildScheduledAt();

      const response = await fetch(`${API_BASE_URL}/api/wordpress/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId: currentArticleId, scheduledAt }),
      });

      const data = await response.json();
      if (!data.success) {
        setWpPublishError(data?.data?.message || "WordPress publish failed.");
      }
    } catch {
      setWpPublishError("Could not reach server for WordPress publish.");
    }
  };

  const handlePublishArticle = async () => {
    if (!articleId) {
      setPublishError("Article id is missing.");
      return;
    }

    try {
      setPublishError("");
      setWpPublishError("");
      setIsSubmitting(true);

      const payload = {
        tags,
        timing,
        scheduledAt: buildScheduledAt(),
        linkedinSync: shareLinkedIn,
        linkedinCaption: linkedinCaption,
      };

      const response = await publishEasyBloggerArticle(articleId, payload);
      const publishedArticle = response?.data ?? response?.article ?? response ?? null;

      await handleWordPressPublish(articleId);

      // Determine the final destination based on whether it was published immediately or scheduled
      const redirectPath = timing === "schedule" ? "articlescheduled" : "articlepublished";
      clearPreviewContext();
      router.push(`/write/${redirectPath}?id=${publishedArticle?.id || articleId}`);
    } catch (error) {
      console.error("Failed to publish article:", error);
      setPublishError(error?.message || "Failed to publish article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      tagInput,
      tags,
      timing,
      scheduledDate,
      scheduledTime,
      shareLinkedIn,
      shareWordPress,
      linkedinCaption,
      isPageLoading,
      isSubmitting,
      publishError,
      dateOpen,
      timeOpen,
      shareText,
      showShareText,
      tpHour,
      tpMinute,
      tpPeriod,
      wpConnected,
      wpUsername,
      wpCheckDone,
      wpPublishError,
      liConnected,
      liUsername,
      liCheckDone,
      MAX_TAGS,
    },
    actions: {
      setTagInput,
      setTags,
      setTiming,
      setScheduledDate,
      setScheduledTime,
      setShareLinkedIn,
      setShareWordPress,
      setLinkedinCaption,
      setDateOpen,
      setTimeOpen,
      setTpHour,
      setTpMinute,
      setTpPeriod,
      setWpCheckDone,
      setLiCheckDone,
      addTag,
      removeTag,
      handlePublishArticle,
      isPastDateTime,
    },
  };
}
