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
      className="rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <Icon size={20} />
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );
}