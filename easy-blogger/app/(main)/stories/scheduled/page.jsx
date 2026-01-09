/**
 * Scheduled Stories Page
 *
 * Route: /stories/scheduled
 *
 * Purpose: Shows all articles scheduled for future publication
 */

export default function ScheduledStoriesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Scheduled Stories</h1>
        <p className="text-gray-500">
          Articles scheduled to be published at a future date.
        </p>
      </div>
    </div>
  );
}
