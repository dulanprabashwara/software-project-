/**
 * AI Restricted Page
 *
 * Purpose: Shown when a non-premium user tries to access AI writing features
 * Flow: User clicked "Create Using AI" but is not a premium member
 *
 * Message: "You are not a Premium member"
 *
 * Actions available:
 * 1. Upgrade to Premium → navigates to premium subscription page
 * 2. Go Back → returns to /write/choose-method
 */

export default function AIRestrictedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">AI Writing Restricted</h1>
        <p className="text-gray-500 mb-8">You are not a Premium member.</p>
        <p className="text-gray-400 mb-8">
          Upgrade to Premium to unlock AI-powered writing tools.
        </p>
        <div className="space-y-4">
          <p>• Upgrade to Premium</p>
          <p>• Go Back</p>
        </div>
      </div>
    </div>
  );
}
