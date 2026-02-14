/**
 * Upgrade to Premium Confirmation Page
 *
 * Access: Visible ONLY to Normal (Free) users
 * Premium users should be redirected to manage page
 *
 * Purpose: Confirmation page before proceeding to payment
 *
 * Features:
 * - Summary of Premium benefits
 * - Price breakdown
 * - Terms and conditions acknowledgment
 * - "Proceed to Payment" button
 * - "Go Back" option
 *
 * Flow: User clicks here from upgrade page → confirms → redirects to payment gateway
 */

export default function UpgradeToPremiumPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Upgrade to Premium</h1>
        <p className="text-gray-500 mb-4">
          Confirm your upgrade to Premium membership.
        </p>
        <p className="text-gray-400 mb-8">Access: Normal (Free) Users Only</p>

        <div className="max-w-md mx-auto text-left space-y-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold mb-2">Premium Plan</h3>
            <p className="text-gray-500 text-lg">$9.99/month</p>
          </div>

          <div>
            <p className="font-semibold mb-2">What you'll get:</p>
            <p className="text-gray-400">✓ AI-powered writing tools</p>
            <p className="text-gray-400">✓ Unlimited storage</p>
            <p className="text-gray-400">✓ Verified badge on profile</p>
            <p className="text-gray-400">✓ Priority customer support</p>
            <p className="text-gray-400">✓ Advanced analytics</p>
          </div>

          <div className="space-y-2 pt-4">
            <p>• Proceed to Payment</p>
            <p>• Go Back</p>
          </div>
        </div>
      </div>
    </div>
  );
}
