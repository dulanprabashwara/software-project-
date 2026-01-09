/**
 * Edit As New Article Page
 * 
 * Purpose: Allows duplicating an existing article and editing it as a new article
 * Flow: User selects "Edit as New" option from an existing article
 * 
 * Features:
 * - Creates a copy of the selected article
 * - Opens the copy in the editor as a new draft
 * - Original article remains unchanged
 * - New article gets a new ID and "Draft" status
 * - Useful for creating variations or updated versions of existing content
 */

export default function EditAsNewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Edit As New Article</h1>
        <p className="text-gray-500 mb-4">Create a copy of an existing article and edit it as new.</p>
        <p className="text-gray-400">The duplicated content will load in the editor.</p>
      </div>
    </div>
  );
}
