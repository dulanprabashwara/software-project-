"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Clock, Share2, Tag, X } from "lucide-react";
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

function PlatformItem({ platform }) {
    const config = PLATFORM_CONFIG[platform];
    if (!config) 
        return null;

     return (
        <div className="flex items-center gap-2">
            <Image src={config.iconSrc} alt={config.label} width={22} height={22} />
            <span>{config.label}</span>
        </div>
    );
}

function readPublishedArticleData() {
    if (typeof window === "undefined") 
        return null;

    try {
        return JSON.parse(
            sessionStorage.getItem(STORAGE_KEYS.publishedArticleData)
        );
    } catch {
        return null;
    }
}

export default function ArticleScheduledPage() {
    const router = useRouter();
    const [data, setData] = useState(null);

    useEffect(() => {
        const parsed = readPublishedArticleData();

        if (!parsed || parsed.timing !== "schedule") {
            router.replace("/write/publish");
            return;
        }

        setData(parsed);
    }, [router]);

    if (!data) 
        return null;

    const { title, tags, platforms, scheduledDate, scheduledTime } = data;

    const formatDate = () => {
        if (!scheduledDate || !scheduledTime)
             return "";

        const date = new Date(`${scheduledDate}T${scheduledTime}`);

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = () => {
        if (!scheduledTime) 
            return "";

        const [hh, mm] = scheduledTime.split(":");
        const h = parseInt(hh);
        const period = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 === 0 ? 12 : h % 12;

        return `${hour12}:${mm} ${period}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
        >
        <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-br from-[#21c4a7] to-[#18af98] px-8 py-10 text-center">
                <button
                    onClick={() => router.push("/home")}
                    className="absolute right-5 top-5 h-9 w-9 flex items-center justify-center rounded-full bg-white/80"
                >
                    <X size={18} />
                </button>

                <div className="mb-5 flex justify-center">
                    <div className="h-16 w-16 rounded-full border border-white flex items-center justify-center text-white">
                        <CalendarDays size={28} />
                    </div>
                </div>

                <h1 className="font-serif text-5xl text-white">
                    Article Scheduled
                </h1>

                <p className="mt-4 text-lg text-[#17352f]">
                    Your article is queued and ready to publish
                </p>

                <div className="mt-5 inline-flex items-center gap-3 bg-white/20 px-4 py-2 rounded-full text-white text-sm">
                    <CalendarDays size={16} />
                    {formatDate()}
                    <Clock size={16} />
                    {formatTime()}
                </div>
            </div>

            {/* Article preview */} 
            <div className="p-6 space-y-4 bg-gray-50">

                <div className="bg-white p-4 rounded-xl shadow flex gap-3">
                    <BookOpen className="text-emerald-500" />
                    <div>
                        <p className="text-sm text-gray-500">Article title</p>
                        <p className="text-lg text-gray-800">{title}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex gap-3">
                    <Tag className="text-emerald-500" />
                    <div>
                        <p className="text-sm text-gray-500">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags?.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 border rounded-full text-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex gap-3">
                    <CalendarDays className="text-emerald-500" />
                    <div>
                        <p className="text-sm text-gray-500">Scheduled for</p>
                        <p className="text-gray-800">
                            {formatDate()} at {formatTime()}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow flex gap-3">
                    <Share2 className="text-emerald-500" />
                    <div>
                        <p className="text-sm text-gray-500">Will also share to</p>
                        <div className="flex gap-4 mt-2">
                            {platforms?.map((p) => (
                                <PlatformItem key={p} platform={p} />
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/home")}
                    className="w-full bg-[#21c4a7] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#1ab89d]"
                >
                    View Your Article →
                </button>
            </div>
        </div>
        </motion.div>
    );
}