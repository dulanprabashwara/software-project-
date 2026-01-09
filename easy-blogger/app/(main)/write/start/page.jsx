/**
 * Write Start Page
 *
 * Purpose: Entry point before writing an article
 * Flow: This is the first page shown when user clicks "Write"
 *
 * Options available:
 * 1. Create New Article → navigates to /write/choose-method
 * 2. Select from Unpublished Articles → shows list of drafts
 */

export default function WriteStartPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Start Writing</h1>
        <p className="text-gray-500 mb-8">What would you like to do?</p>
        <div className="space-y-4">
          <p>• Create New Article</p>
          <p>• Select from Unpublished Articles</p>
        </div>
      </div>
    </div>
  );
}
