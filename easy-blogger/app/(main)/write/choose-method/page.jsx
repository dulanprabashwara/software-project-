/**
 * Choose Writing Method Page
 *
 * Purpose: Let user choose how they want to create their article
 * Flow: Shown after user clicks "Create New Article" from /write/start
 *
 * Options available:
 * 1. Create Regular Article → navigates to /write (editor)
 * 2. Create Using AI →
 *    - Premium users: navigates to /write with AI mode enabled
 *    - Non-premium users: navigates to /write/ai-restricted
 */

export default function ChooseMethodPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Choose Writing Method</h1>
        <p className="text-gray-500 mb-8">
          How would you like to create your article?
        </p>
        <div className="space-y-4">
          <p>• Create Regular Article</p>
          <p>• Create Using AI (Premium Feature)</p>
        </div>
      </div>
    </div>
  );
}
