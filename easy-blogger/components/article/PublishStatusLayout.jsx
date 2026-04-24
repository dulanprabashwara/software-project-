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
            <HeaderIcon size={40} />
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-serif text-5xl text-white">
            {title}
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 text-lg text-[#17352f]">
            {subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white"
          >
            {dateLabel}
          </motion.div>
        </div>

        <div className="space-y-5 bg-[#f7f8f8] p-8">
          {children}

          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onButtonClick}
            className="w-full rounded-3xl bg-[#21c4a7] py-4 text-xl font-semibold text-white shadow-md hover:bg-[#1ab89d]"
          >
            {buttonText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}