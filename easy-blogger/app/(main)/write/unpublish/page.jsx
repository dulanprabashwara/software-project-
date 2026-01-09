/**
 * Unpublish Article Confirmation Page
 * 
 * Purpose: Confirmation page for unpublishing a published article
 * Flow: User clicks "Unpublish" option from article settings or dashboard
 * 
 * Features:
 * - Show article title being unpublished
 * - Warning message about unpublishing consequences
 * - Article will become a draft again
 * - Article URL will no longer be accessible to public
 * - Existing comments/stats may be affected
 * 
 * Actions:
 * - Confirm Unpublish → Article reverts to draft status
 * - Cancel → Return to previous page
 */

export default function UnpublishArticlePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Unpublish Article</h1>
        <p className="text-gray-500 mb-4">Are you sure you want to unpublish this article?</p>
        <p className="text-gray-400 mb-8">The article will be moved back to drafts and will no longer be publicly accessible.</p>
        <div className="text-gray-400 space-y-2">
          <p>• Confirm Unpublish</p>
          <p>• Cancel</p>
        </div>
      </div>
    </div>
  );
}
