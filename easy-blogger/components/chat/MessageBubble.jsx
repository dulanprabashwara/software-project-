"use client";

import { useMemo } from "react";

import { Trash2 } from "lucide-react";

export default function MessageBubble({
  text,
  sender,
  timestamp,
  isOwnMessage,
  onDelete,
}) {
  const bubbleClasses = useMemo(() => {
    return isOwnMessage
      ? "bg-[#1ABC9C] text-white rounded-br-none"
      : "bg-gray-100 text-gray-800 rounded-bl-none";
  }, [isOwnMessage]);

  const containerClasses = useMemo(() => {
    return isOwnMessage ? "flex-row-reverse" : "flex-row";
  }, [isOwnMessage]);

  return (
    <div className={`flex ${containerClasses} mb-4 items-end gap-2 group`}>
      {!isOwnMessage && (
        <img
          src={sender.avatar}
          alt={sender.name}
          className="w-8 h-8 rounded-full shrink-0"
        />
      )}
      <div
        className={`relative max-w-[70%] px-4 py-2 rounded-2xl ${bubbleClasses}`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        <div
          className={`text-[10px] mt-1 ${
            isOwnMessage ? "text-white/80" : "text-gray-500"
          } text-right`}
        >
          {timestamp}
        </div>
        {isOwnMessage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete();
            }}
            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete message"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
