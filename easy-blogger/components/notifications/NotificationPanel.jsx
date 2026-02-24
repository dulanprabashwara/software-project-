"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  FileText,
  Star,
  CalendarClock,
  MessageCircle,
  Bell,
  X,
} from "lucide-react";
import notifications from "../../data/notifications.json";

const iconFor = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("comment")) return MessageCircle;
  if (t.includes("rating")) return Star;
  if (t.includes("scheduled")) return CalendarClock;
  if (t.includes("article")) return FileText;
  return Bell;
};

export default function NotificationPanel({ onClose }) {
  const [read, setRead] = useState({});

  // load saved read map once
  useEffect(() => {
    const raw = localStorage.getItem("noti_read");
    if (raw) setRead(JSON.parse(raw));
  }, []);

  // save read map on changes
  useEffect(() => {
    localStorage.setItem("noti_read", JSON.stringify(read));
  }, [read]);

  return (
    <div className="absolute right-10 top-10 mt-3 w-[340px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
        <p className="text-sm font-semibold text-[#1ABC9C]">Notifications</p>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-[#E8F8F5]" aria-label="Close">
          <X className="w-4 h-4 text-[#1ABC9C]" />
        </button>
      </div>

      <div className="max-h-[320px] overflow-y-auto">
        {notifications.map((n) => {
          const Icon = iconFor(n.type);
          const isRead = !!read[n.id];

          const title = `${n.type || "Notification"}${n.sourceUser ? `: ${n.sourceUser}` : ""}`;

          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-[#e5e7eb] last:border-0 ${
                isRead ? "opacity-60" : ""
              }`}
            >
              <Icon className="w-4 h-4 text-[#1ABC9C] mt-0.5" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#111827] truncate">{title}</p>
                {n.sourceArticle ? (
                  <p className="text-xs text-[#6B7280] truncate">[{n.sourceArticle}]</p>
                ) : null}
              </div>

              <button
                onClick={() => setRead((p) => ({ ...p, [n.id]: !p[n.id] }))}
                className="p-1.5 rounded-full hover:bg-[#E8F8F5]"
                aria-label={isRead ? "Mark as unread" : "Mark as read"}
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                {isRead ? (
                  <EyeOff className="w-4 h-4 text-[#6B7280]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#6B7280]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}