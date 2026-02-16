"use client";

const ARTICLES = [
  {
    id: "a1",
    author: "Emma Richardson",
    date: "Dec 4, 2025",
    title: "How AI is Transforming Content Creation in 2025",
    desc:
      "Explore the latest developments in artificial intelligence and how they are revolutionizing the way we create, curate, and consume content across digital platforms.",
    image: "/images/robot.jpg",
  },
  {
    id: "a2",
    author: "Emma Richardson",
    date: "Dec 3, 2025",
    title: "The Complete Guide to Building Scalable Web Applications",
    desc:
      "Learn the essential principles, patterns, and best practices for creating web applications that can handle millions of users while maintaining performance and reliability.",
    image: "/images/code.jpg",
  },
];


export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5F1] via-[#F0F9FF] to-[#FDF4FF] flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
            <div className="bg-white rounded-2xl shadow-2xl p-12 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-[#111827] mb-6">
                        Unpublished Articles
                    </h1>
                    <p className="text-[#6B7280] text-base">
                        You can edit your unpublished articles here.
                    </p>
                </div>
                <div className="mt-8 border-t border-black/20" /> {/* Top divider */}

                {/* Dummy content to show the structure of the page */}
                <div className="mt-10 space-y-10">

                    {ARTICLES.map((a, idx) => (
                        <div key={a.id}>
                            <div className="flex gap-10">
                                {/* left marker placeholder (will become square/check later) */}
                                <div className="w-12 flex justify-center">
                                    <div className="h-8 w-8 bg-black/5" />
                                </div>

                                {/* content */}
                                <div className="flex-1">
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
                                <div className="w-44 flex justify-end">
                                    <div className="h-28 w-40 overflow-hidden rounded-md bg-black/10">
                                    {/* If you don't have images yet, comment img tag */}
                                    <img
                                        src={a.image}
                                        alt={a.title}
                                        className="h-full w-full object-cover"
                                    />
                                    </div>
                                </div>
                            </div>

                            {/* divider between rows */}
                            {idx !== ARTICLES.length - 1 ? (
                                <div className="mt-10 border-t border-black/10" />
                            ) : null}
                        </div>
                    ))}
                </div>


                <div className="border-t border-black/20" /> {/* Bottom divider (above buttons area) */}

                </div>

            </div>

        </div>
    
  );
}
