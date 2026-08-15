"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import FloatingConfetti from "./FloatingConfetti";
import { fadeUp } from "./InfoCard";

const container = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

export default function PublishStatusLayout({
  router,
  headerIcon,
  title,
  subtitle,
  dateLabel,
  children,
  buttonText = "View Your Article →",
  onButtonClick,
}) {
  const HeaderIcon = headerIcon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-full py-4 px-4 flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/20 overflow-y-auto"
    >
      <FloatingConfetti />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-xl my-auto overflow-hidden rounded-3xl border border-white bg-white/90 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]"
      >
        {/* Top Header Section - Compact Height */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#10b981] to-[#059669] px-6 py-6 text-center">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 cursor-pointer"
          >
            <X size={18} />
          </button>

          <motion.div
            variants={fadeUp}
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md"
          >
            <HeaderIcon size={28} strokeWidth={1.5} />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-1 text-sm md:text-base text-emerald-50 font-medium opacity-90"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-xl bg-black/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
          >
            {dateLabel}
          </motion.div>
        </div>

        {/* Bottom Content Section - Compact Spacing */}
        <div className="space-y-3.5 bg-white/40 p-5 md:p-6 backdrop-blur-sm">
          <div className="space-y-2.5">
            {children}
          </div>

          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.01, translateY: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={onButtonClick}
            className="mt-3 w-full rounded-2xl bg-[#10b981] py-3 text-base font-bold text-white shadow-[0_12px_24px_-8px_rgba(16,185,129,0.3)] transition-all hover:bg-[#0d9668] cursor-pointer"
          >
            {buttonText}
          </motion.button>

          <motion.p
            variants={fadeUp}
            className="text-center text-xs text-gray-400 font-medium"
          >
            Press <span className="text-brand-muted">Esc</span> to return home
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}