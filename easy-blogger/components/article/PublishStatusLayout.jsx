"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import FloatingConfetti from "./FloatingConfetti";
import { fadeUp } from "./InfoCard";

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
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-linear-to-br from-white via-emerald-50/30 to-blue-50/20 flex items-center justify-center p-6 overflow-hidden"
    >
      <FloatingConfetti />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-2xl overflow-hidden rounded-[40px] border border-white bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
      >
        <div className="relative overflow-hidden bg-linear-to-br from-[#10b981] to-[#059669] px-10 py-16 text-center">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
          </div>

          <button
            onClick={() => router.push("/home")}
            className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30"
          >
            <X size={22} />
          </button>

          <motion.div
            variants={fadeUp}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-white shadow-inner backdrop-blur-md"
          >
            <HeaderIcon size={48} strokeWidth={1.5} />
          </motion.div>

          <motion.h1 
            variants={fadeUp} 
            className="font-serif text-5xl font-bold tracking-tight text-white leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p 
            variants={fadeUp} 
            className="mt-4 text-xl text-emerald-50 font-medium opacity-90"
          >
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl bg-black/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
          >
            {dateLabel}
          </motion.div>
        </div>

        <div className="space-y-6 bg-white/40 p-10 backdrop-blur-sm">
          <div className="space-y-4">
            {children}
          </div>

          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.01, translateY: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onButtonClick}
            className="mt-4 w-full rounded-[24px] bg-[#10b981] py-5 text-xl font-bold text-white shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all hover:bg-[#0d9668] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.4)]"
          >
            {buttonText}
          </motion.button>
          
          <motion.p 
            variants={fadeUp}
            className="text-center text-sm text-gray-400 font-medium"
          >
            Press <span className="text-gray-600">Esc</span> to return home
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}