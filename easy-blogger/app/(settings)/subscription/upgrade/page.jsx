/**
 * Upgrade Page - Pricing Comparison
 * 
 * Access: Visible to ALL users (Normal and Premium)
 * 
 * Purpose: Shows pricing comparison between Free and Premium plans
 * 
 * Features:
 * - Side-by-side comparison of Free vs Premium
 * - List of features for each plan
 * - Pricing information
 * - "Upgrade to Premium" CTA for Normal users
 * - "You're already Premium" message for Premium users
 */

export default function UpgradePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Upgrade Your Plan</h1>
        <p className="text-gray-500 mb-8">Compare plans and choose what's best for you.</p>
        <p className="text-gray-400 mb-4">Access: All Users (Normal & Premium)</p>
        
        <div className="flex gap-8 justify-center mt-8">
          <div className="text-left">
            <h3 className="font-bold mb-2">Free Plan</h3>
            <p className="text-gray-400">• Basic article writing</p>
            <p className="text-gray-400">• Limited storage</p>
            <p className="text-gray-400">• Standard support</p>
          </div>
          <div className="text-left">
            <h3 className="font-bold mb-2">Premium Plan</h3>
            <p className="text-gray-400">• AI-powered writing</p>
            <p className="text-gray-400">• Unlimited storage</p>
            <p className="text-gray-400">• Priority support</p>
            <p className="text-gray-400">• Verified badge</p>
          </div>
        </div>
      </div>
    </div>
  );
}
