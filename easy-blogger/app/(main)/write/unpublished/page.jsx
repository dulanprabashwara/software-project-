"use client";

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
                    <div className="mt-8 border-t border-black/20" /> {/* Top divider */}
                    <div className="py-16" />{/* Content placeholder */}
                    <div className="border-t border-black/20" /> {/* Bottom divider (above buttons area) */}

                </div>

            </div>

        </div>
    </div>
  );
}
