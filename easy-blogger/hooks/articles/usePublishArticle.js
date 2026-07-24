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

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState("both"); // "ai", "plagiarism", "both"
  const [analysisScores, setAnalysisScores] = useState({ aiScore: null, plagiarismScore: null });
  const [highlights, setHighlights] = useState([]);
  const [articleBody, setArticleBody] = useState("");
  const [analysisHasRun, setAnalysisHasRun] = useState(false);

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

  // LinkedIn caption word count logic
  const linkedinWordCount = useMemo(() => {
    if (!linkedinCaption)
      return 0;
    return linkedinCaption.trim().split(/\s+/).filter(Boolean).length;
  }, [linkedinCaption]);

  const isLiCaptionOverLimit = linkedinWordCount >= 200;

  // Checks if selected schedule time is invalid
  const isPastDateTime = () => {
    if (!scheduledDate || !scheduledTime)
      return false;
    const selected = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    return selected < now;
  };

  //Creates ISO datetime for backend
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

  //Removes selected tag
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

        // Extract body for analysis
        if (article.content || article.body) {
          setArticleBody(article.content || article.body);
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
    if (!shareLinkedIn || !firebaseUser || liCheckDone)
      return;

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

  // Reads ?li_status query param set by the OAuth callback redirect and cleans it up
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("li_status")) return;

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("li_status");
    cleanUrl.searchParams.delete("li_username");
    cleanUrl.searchParams.delete("li_picture");
    cleanUrl.searchParams.delete("li_message");
    window.history.replaceState({}, "", cleanUrl.toString());
  }, []);

  const handleDisconnectLinkedIn = async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      await fetch(`${API_BASE_URL}/api/linkedin/disconnect`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiConnected(false);
      setLiUsername("");
      setShareLinkedIn(false);
    } catch (error) {
      console.error("Failed to disconnect LinkedIn:", error);
    }
  };

  const handleConnectLinkedIn = async () => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      // Pass the current URL path so the backend redirects back here after OAuth
      const currentPath = window.location.pathname + window.location.search;
      const res = await fetch(`${API_BASE_URL}/api/linkedin/auth?returnTo=${encodeURIComponent(currentPath)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.data?.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        throw new Error(data?.message || "Could not get LinkedIn authorization URL.");
      }
    } catch (error) {
      console.error("Failed to connect to LinkedIn:", error);
    }
  };

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

  const handleRunAnalysis = async () => {
    if (!firebaseUser || !articleBody) return;
    try {
      setIsAnalyzing(true);
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/analysis/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ htmlContent: articleBody, type: analysisType }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setAnalysisScores({
          aiScore: data.data.aiScore ?? null,
          plagiarismScore: data.data.plagiarismScore ?? null,
        });
        setHighlights(data.data.highlights || []);
        setAnalysisHasRun(true);
      }
    } catch (error) {
      console.error("Failed to run analysis:", error);
    } finally {
      setIsAnalyzing(false);
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

      if (shareLinkedIn && isLiCaptionOverLimit) {
        setPublishError("LinkedIn caption must be less than 200 words.");
        return;
      }

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
      linkedinWordCount,
      isLiCaptionOverLimit,
      MAX_TAGS,
      isAnalyzing,
      analysisType,
      analysisScores,
      highlights,
      articleBody,
      analysisHasRun,
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
      setAnalysisType,
      addTag,
      removeTag,
      handlePublishArticle,
      handleDisconnectLinkedIn,
      handleConnectLinkedIn,
      isPastDateTime,
      handleRunAnalysis,
    },
  };
}
