/**
 * Public User Profile Page (Dynamic Route)
 * 
 * Purpose: Public view of any user's profile by username
 * Route: /profile/[username]
 * Features:
 * - Display user's public profile information
 * - Show published articles by this user
 * - Follow/Unfollow button
 * - View follower/following counts
 * - Accessible to both logged-in and guest users
 */

export default function UserProfilePage({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <p className="text-gray-500">Public profile view for @username</p>
      </div>
    </div>
  );
}
