"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Bell, Check, Circle, Loader2, Info, EyeOff, Eye } from "lucide-react";
import Link from "next/link";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function getNotificationDetails(notification: any) {
  const actorName =
    notification.sourceUser?.displayName ||
    notification.sourceUser?.username ||
    "Someone";
  const articleTitle = notification.sourceArticle?.title || "an article";
  const articleId = notification.sourceArticleId || "";
  const link = `/home/read?id=${articleId}`;

  switch (notification.type) {
    case "COMMENT":
      return {
        title: "New Comment",
        message: `${actorName} commented on "${articleTitle}".`,
        link: link,
      };
    case "RATE":
      return {
        title: "New Rating",
        message: `${actorName} rated "${articleTitle}".`,
        link: link,
      };
    case "FOLLOW":
      return {
        title: "New Follower",
        message: `${actorName} started following you.`,
        link: `/profile?id=${notification.sourceUserId}`,
      };
    case "NEW_ARTICLE":
      return {
        title: "New Article",
        message: `${actorName} published: "${articleTitle}".`,
        link: `/home/read?id=${articleId}`,
      };
    default:
      return {
        title: "Notification",
        message: "New update received",
        link: "#",
      };
  }
}

// ... (keep helper functions timeAgo and getNotificationDetails same as before)

// ... (imports and helper functions remain same)

export default function NotificationPanel({
  userId,
}: {
  userId: string | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // Rename markAsRead to deleteNotification based on your hook's new name
  const { notifications, unreadCount, loading, markAsRead } =
    useNotifications(userId);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={panelRef}>
      <button
        data-skip-save-prompt="true"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-emerald-50 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-emerald-500 border-2 border-white rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-95 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-emerald-50/30 rounded-t-2xl">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">
                {notifications.length} Total
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => markAsRead()} // Deletes ALL
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-all"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-100">
            {loading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin text-emerald-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm font-medium">No notifications found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => {
                  const { title, message, link } = getNotificationDetails(n);

                  return (
                    <div
                      key={n.id}
                      className="group relative flex items-start gap-3 px-5 py-4 hover:bg-emerald-50/20 transition-colors"
                    >
                      <div className="mt-2 shrink-0">
                        <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                      </div>

                      <Link
                        href={link}
                        className="flex-1 min-w-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <p className="text-sm font-bold text-gray-900">
                          {title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 italic line-clamp-2">
                          "{message}"
                        </p>
                        <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase">
                          {timeAgo(n.createdAt)}
                        </p>
                      </Link>

                      {/* DELETE INDIVIDUAL EYE ICON */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markAsRead(n.id); // Deletes THIS ONE
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full border border-transparent hover:border-red-100 transition-all"
                        title="Delete notification"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
