/**
 * Normal User Profile Page
 *
 * Purpose: Profile view for non-premium (free) users
 * Features:
 * - Display user avatar and name
 * - Show bio/about section
 * - List published articles
 * - Show follower/following counts
 * - No premium badge or premium features
 */

export default function NormalProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Normal User Profile</h1>
        <p className="text-gray-500">Profile view for free tier users.</p>
      </div>
    </div>
  );
}
