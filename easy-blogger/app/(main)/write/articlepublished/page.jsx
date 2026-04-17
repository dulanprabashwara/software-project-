"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Check, Share2, Tag, X } from "lucide-react";
import Image from "next/image";

const STORAGE_KEYS = {
  publishedArticleData: "published_article_data",
};

const PLATFORM_CONFIG = {
  "Easy Blogger": {
    label: "Easy Blogger",
    iconSrc: "/icons/logo.jpeg",
    iconAlt: "Easy Blogger",
  },
  LinkedIn: {
    label: "LinkedIn",
    iconSrc: "/icons/linkedin.png",
    iconAlt: "LinkedIn",
  },
  WordPress: {
    label: "WordPress",
    iconSrc: "/icons/wordpress.png",
    iconAlt: "WordPress",
  },
};

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const CHECK_VARIANTS = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: [0.6, 1.12, 1],
    transition: {
      duration: 0.7,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

function PlatformItem({ platform }) {
  const config = PLATFORM_CONFIG[platform];

  if (!config) return null;

  return (
    <div className="flex items-center gap-2">
      <Image
        src={config.iconSrc}
        alt={config.iconAlt}
        width={22}
        height={22}
      />
      <span>{config.label}</span>
    </div>
  );
}

function FloatingConfetti() {
  const items = useMemo(
    () =>
      Array.from({ length: 25 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 6 + Math.random() * 3,
        size: ["text-3xl", "text-4xl", "text-5xl"][
          Math.floor(Math.random() * 3)
        ],
        initialRotate: Math.random() * 60 - 30,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{
            y: -100,
            opacity: 0,
            rotate: item.initialRotate,
          }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [0, 20, -20, 10, -10],
            opacity: [0, 1, 1, 0],
            rotate: [-30, 30, -15, 10],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute ${item.size}`}
          style={{ left: `${item.left}%` }}
        >
          🎉
        </motion.div>
      ))}
    </div>
  );
}

function readPublishedArticleData() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEYS.publishedArticleData);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse published article data", error);
    return null;
  }
}

export default function ArticlePublishedPage() {
  const router = useRouter();
  const [publishedData, setPublishedData] = useState(null);

  useEffect(() => {
    const parsedData = readPublishedArticleData();

    if (!parsedData) {
      router.replace("/write/publish");
      return;
    }

    setPublishedData(parsedData);
  }, [router]);

  if (!publishedData) return null;

  const { title, tags, platforms, timing, scheduledDate, scheduledTime } =
    publishedData;

  const formatPublishDate = () => {
    if (timing === "now") {
      return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (scheduledDate && scheduledTime) {
      const date = new Date(`${scheduledDate}T${scheduledTime}`);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-gradient-to-r from-[#eef8f5] to-[#edf2fb] flex items-center justify-center p-6 overflow-hidden"
    >
      <FloatingConfetti />

      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-[570px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-xl"
      >
        <div className="relative bg-gradient-to-br from-[#21c4a7] to-[#18af98] px-8 py-10 text-center">
          <button
            onClick={() => router.push("/home")}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-700"
          >
            <X size={18} />
          </button>

          <motion.div
            variants={CHECK_VARIANTS}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 text-white"
          >
            <Check size={40} />
          </motion.div>

          <motion.h1
            variants={ITEM_VARIANTS}
            className="font-serif text-5xl text-white"
          >
            Article Published
          </motion.h1>

          <motion.p
            variants={ITEM_VARIANTS}
            className="mt-4 text-lg text-[#17352f]"
          >
            Your article is now live and reaching readers
          </motion.p>

          <motion.div
            variants={ITEM_VARIANTS}
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white"
          >
            <CalendarDays size={16} />
            {formatPublishDate()}
          </motion.div>
        </div>

        <div className="space-y-5 bg-[#f7f8f8] p-8">
          <motion.div
            variants={ITEM_VARIANTS}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Article title</p>
                <p className="mt-1 text-2xl text-gray-700">{title}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={ITEM_VARIANTS}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Tag size={20} />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-300 bg-gray-50 px-4 py-1 text-sm text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={ITEM_VARIANTS}
            className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                <Share2 size={20} />
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-500">Published to</p>
                <div className="mt-3 flex flex-wrap items-center gap-5 text-lg text-gray-600">
                  {platforms?.map((platform) => (
                    <PlatformItem key={platform} platform={platform} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            variants={ITEM_VARIANTS}
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