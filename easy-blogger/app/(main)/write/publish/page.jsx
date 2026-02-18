"use client";

export default function PublishArticlePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-10 text-center">
          <h1 className="text-4xl font-semibold text-gray-900">Publish your Article</h1>
          <p className="mt-3 text-gray-500">
            You can publish now or schedule a time to publish
          </p>
        </div>

        <div className="border-t border-gray-100" />
        <div className="p-10 space-y-10">
          {/* Sections will be added in next commits */}
          <div className="text-gray-400 text-center">Coming next: tags, timing, share, actions</div>
        </div>

        <div className="border-t border-gray-100" />
        <div className="p-8 flex items-center justify-between">
          <button className="px-8 py-3 rounded-full bg-black text-white">Back</button>
          <button className="px-8 py-3 rounded-full bg-emerald-500 text-white">
            Schedule post
          </button>
        </div>
      </div>
    </div>
  );
}
