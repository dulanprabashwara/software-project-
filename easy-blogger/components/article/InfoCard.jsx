"use client";

import { motion } from "framer-motion";

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function InfoCard({ icon: Icon, title, children }) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-gray-100 bg-white/80 p-3.5 shadow-xs backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
          <Icon size={20} strokeWidth={1.5} />
        </div>

        <div className="flex-1 overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>
          <div className="mt-0.5">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}