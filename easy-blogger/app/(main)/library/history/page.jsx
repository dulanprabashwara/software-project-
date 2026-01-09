/**
 * Reading History Page
 *
 * Route: /library/history
 *
 * Purpose: Shows all articles the user has read recently
 *
 * Features:
 * - List of recently read articles
 * - Sorted by last read date (most recent first)
 * - Clear history option
 * - Article preview with author, date, excerpt
 * - Reading progress indicator (if applicable)
 */

export default function ReadingHistoryPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Reading History</h1>
        <p className="text-gray-500">Articles you've recently read.</p>
      </div>
    </div>
  );
}
