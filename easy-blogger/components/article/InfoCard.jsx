"use client";

import { motion } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function InfoCard({ icon: Icon, title, children }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-[32px] border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
          <Icon size={28} strokeWidth={1.5} />
        </div>

        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>
          <div className="mt-1">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}