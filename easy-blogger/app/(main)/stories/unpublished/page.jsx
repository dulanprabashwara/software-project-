/**
 * Unpublished Stories Page
 *
 * Route: /stories/unpublished
 *
 * Purpose: Shows all draft articles that haven't been published yet
<<<<<<< HEAD
 *
 * Features:
 * - List of draft articles
 * - Edit draft option
 * - Delete draft option
 * - Publish draft option
 * - Article preview with title, excerpt, last edited date
=======
>>>>>>> main
 */

export default function UnpublishedStoriesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Unpublished Stories</h1>
        <p className="text-gray-500">
          Your draft articles that haven't been published yet.
        </p>
      </div>
    </div>
  );
}
