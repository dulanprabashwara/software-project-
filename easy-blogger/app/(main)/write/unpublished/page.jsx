/**
 * Unpublished Articles Page
 * 
 * Purpose: Shows a list of all unpublished/draft articles
 * Flow: User arrives here after selecting "Select from Unpublished Articles" from /write/start
 * 
 * Features:
 * - Display list of all draft articles
 * - Show article title, last edited date, and preview snippet
 * - Click to continue editing a draft
 * - Option to delete drafts
 * - Option to duplicate a draft (edit-as-new)
 */

export default function UnpublishedArticlesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Unpublished Articles</h1>
        <p className="text-gray-500 mb-8">Your draft articles will appear here.</p>
        <div className="text-gray-400 space-y-2">
          <p>• Draft Article 1 - Last edited: Jan 5, 2026</p>
          <p>• Draft Article 2 - Last edited: Jan 3, 2026</p>
          <p>• Draft Article 3 - Last edited: Dec 28, 2025</p>
        </div>
      </div>
    </div>
  );
}
