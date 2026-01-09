/**
 * Create New Article Page
 *
 * Purpose: Entry point for creating a brand new article
 * Flow: User arrives here after selecting "Create New Article" or "Create Regular Article"
 *
 * This page leads into the main editor where:
 * - User can write article title
 * - User can write article content
 * - User can add tags and cover image
 * - User can save as draft or proceed to publish
 */

export default function CreateArticlePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Create New Article</h1>
        <p className="text-gray-500 mb-4">
          Start writing your new article from scratch.
        </p>
        <p className="text-gray-400">The editor will load here.</p>
      </div>
    </div>
  );
}
