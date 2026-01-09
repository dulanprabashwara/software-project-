/**
 * Published Stories Page
 *
 * Route: /stories/published
 *
 * Purpose: Shows all articles that are currently live
 */

export default function PublishedStoriesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Published Stories</h1>
        <p className="text-gray-500">
          Articles that are live and visible to readers.
        </p>
      </div>
    </div>
  );
}
