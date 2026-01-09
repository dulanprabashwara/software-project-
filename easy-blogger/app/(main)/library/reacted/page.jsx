/**
 * Reacted Articles Page
 *
 * Route: /library/reacted
 *
 * Purpose: Shows all articles the user has reacted to (liked/clapped)
 *
 * Features:
 * - List of articles user has liked or clapped for
 * - Shows reaction type (like, clap, love, etc.)
 * - Article preview with author, date, excerpt
 * - Sort by reaction date
 */

export default function ReactedArticlesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Reacted Articles</h1>
        <p className="text-gray-500">Articles you've liked or clapped for.</p>
      </div>
    </div>
  );
}
