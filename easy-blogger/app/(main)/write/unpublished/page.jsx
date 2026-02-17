"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ARTICLES = [
  {
    id: "a1",
    author: "Emma Richardson",
    date: "Dec 4, 2025",
    title: "How AI is Transforming Content Creation in 2025",
    desc:
      "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
    image: "/images/Unpublished_IMG/robot.jpg",
  },
  {
    id: "a2",
    author: "Emma Richardson",
    date: "Dec 3, 2025",
    title: "The Complete Guide to Building Scalable Web Applications",
    desc:
      "Learn the essential principles, patterns, and best practices for creating web applications that can handle millions of users while maintaining performance and reliability.",
    image: "/images/Unpublished_IMG/code.jpg",
  },
];

export default function Page() {
  const [selectedId, setSelectedId] = useState(null); // none selected initially
  const router = useRouter();  
  
  const toggleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-[#111827] mb-3">
              Unpublished Articles
            </h1>
            <p className="text-[#6B7280] text-base">
              You can edit your unpublished articles here.
            </p>
          </div>

          <div className="mt-8 border-t border-black/20" />

            {/* Articles */}
          <div className="mt-10 space-y-10">
            {ARTICLES.map((a, idx) => {
              const active = a.id === selectedId;

              return (
                <div key={a.id}>
                  <button
                    type="button"
                    onClick={() => toggleSelect(a.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-10">
                      {/* marker */}
                      <div className="w-14 shrink-0 flex justify-center">
                        {!active ? (
                          <div className="mt-1 h-10 w-10 rounded bg-gray-200 border border-gray-400"/>
                        ) : (
                          <div className="mt-1 h-10 w-10 rounded-full bg-[#22C55E] flex items-center justify-center">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* content + image (IMPORTANT: same flex row) */}
                      <div className="flex flex-1 items-start justify-between gap-10">
                        {/* text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                            <div className="h-8 w-8 rounded-full bg-black/10" />
                            <span className="font-medium">{a.author}</span>
                            <span className="opacity-60">·</span>
                            <span>{a.date}</span>
                          </div>

                          <h2 className="mt-4 text-3xl font-serif font-bold text-[#111827]">
                            {a.title}
                          </h2>

                          <p className="mt-3 text-[#6B7280] leading-relaxed max-w-2xl">
                            {a.desc}
                          </p>
                        </div>

                        {/* image */}
                        <div className="w-[220px] shrink-0 flex justify-end">
                          <div className="h-28 w-40 overflow-hidden rounded-md bg-black/10">
                            <img
                              src={a.image}
                              alt={a.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {idx !== ARTICLES.length - 1 ? (
                    <div className="mt-10 border-t border-black/10" />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-12 border-t border-black/10" />
          <div className="mt-10 flex justify-center">
            <button 
              type="button"
              className="see-more-btn"
            >
                See more
            </button>
          </div>
          <div className="mt-10 border-t border-black/20" />
          <div className="mt-8 flex items-center justify-between px-6">
            <button className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90">
                Edit as New
            </button>

            <button className="rounded-full bg-[#10B981] px-14 py-4 text-white font-medium shadow-lg hover:bg-[#0EA371]">
                Back
            </button>

            <button className="rounded-full bg-black px-10 py-4 text-white shadow-lg hover:opacity-90">
                Edit Existing
            </button>
         </div>


        </div>
      </div>
    </div>
  );
}
