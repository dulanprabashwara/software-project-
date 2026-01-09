/**
 * Saved Articles Page
 *
 * Route: /library/saved
 *
 * Purpose: Shows all articles the user has bookmarked/saved
 *
 * Features:
 * - List of saved articles with thumbnails
 * - Remove from saved option
 * - Sort by date saved
 * - Article preview with author, date, excerpt
 */

export default function SavedArticlesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Saved Articles</h1>
        <p className="text-gray-500">
          Articles you've bookmarked for later reading.
        </p>
      </div>
    </div>
  );
}
