export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {/* Title Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      
      {/* Content Skeleton (Big Box) */}
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}
