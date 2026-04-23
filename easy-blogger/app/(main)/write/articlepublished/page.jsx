"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Check, Share2, Tag, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../../lib/api";
import { getDraftById } from "../../../../lib/articles/api";
import FloatingConfetti from "../../../../components/article/FloatingConfetti";
import InfoCard, { fadeUp } from "../../../../components/article/InfoCard";
import PlatformItem from "../../../../components/article/PlatformItem";

const container = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

export default function ArticlePublishedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser } = useAuth();

  const articleId = searchParams.get("id") || "";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wpConnected, setWpConnected] = useState(false);
  const [wpPostUrl, setWpPostUrl] = useState("");
  const [wpError, setWpError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!articleId) {
        router.replace("/write/create");
        return;
      }

      try {
        const response = await getDraftById(articleId);
        const data = response?.data ?? response?.article ?? response ?? null;

        if (!data) {
          router.replace("/write/create");
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error("Failed to load article:", error);
        router.replace("/write/create");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [articleId, router]);

  useEffect(() => {
    const checkWordPress = async () => {
      if (!firebaseUser) return;

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/wordpress/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWpConnected(Boolean(data?.data?.connected));
      } catch {
        setWpConnected(false);
      }
    };

    void checkWordPress();
  }, [firebaseUser]);

  const handleWpRetry = useCallback(async () => {
    if (!firebaseUser || !articleId) return;

    setIsRetrying(true);
    setWpError("");

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/wordpress/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId, scheduledAt: null }),
      });

      const data = await res.json();

      if (data?.success && data?.data?.wpPostUrl) {
        setWpPostUrl(data.data.wpPostUrl);
      } else {
        setWpError(data?.data?.message || "WordPress publish failed. Please try again.");
      }
    } catch {
      setWpError("Could not reach server. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }, [firebaseUser, articleId]);

  const platforms = useMemo(() => {
    const list = ["Easy Blogger"];
    if (wpConnected) list.push("WordPress");
    return list;
  }, [wpConnected]);

  const formattedDate = useMemo(() => {
    const rawDate = article?.publishedAt || article?.createdAt;
    if (!rawDate) return "";

    return new Date(rawDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading published article...</p>
      </div>
    );
  }

  if (!article) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-linear-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6 overflow-hidden"
    >
      <FloatingConfetti />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-142.5 overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl"
      >
        <div className="relative bg-linear-to-br from-[#21c4a7] to-[#18af98] px-8 py-10 text-center">
          <button
            onClick={() => router.push("/home")}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-700"
          >
            <X size={18} />
          </button>

          <motion.div
            variants={fadeUp}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 text-white"
          >
            <Check size={40} />
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-serif text-5xl text-white">
            Article Published
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 text-lg text-[#17352f]">
            Your article is now live and reaching readers
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white"
          >
            <CalendarDays size={16} />
            {formattedDate}
          </motion.div>
        </div>

        <div className="space-y-5 bg-[#f7f8f8] p-8">
          <InfoCard icon={BookOpen} title="Article title">
            <p className="mt-1 text-2xl text-gray-700">{article.title}</p>
          </InfoCard>

          <InfoCard icon={Tag} title="Tags">
            <div className="mt-3 flex flex-wrap gap-2">
              {(article.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={Share2} title="Published to">
            <div className="mt-3 flex flex-wrap items-center gap-5 text-lg text-gray-600">
              {platforms.map((platform) => (
                <PlatformItem
                  key={platform}
                  name={platform}
                  wpPostUrl={wpPostUrl}
                  wpError={wpError}
                  isRetrying={isRetrying}
                  onRetry={handleWpRetry}
                />
              ))}
            </div>
          </InfoCard>

          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/home")}
            className="w-full rounded-3xl bg-[#21c4a7] py-4 text-xl font-semibold text-white shadow-md hover:bg-[#1ab89d]"
          >
            View Your Article →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}