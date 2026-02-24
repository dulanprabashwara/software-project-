"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Edit } from "lucide-react";

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full md:w-80 border-r border-gray-200 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h2
          className="text-xl font-bold text-gray-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Messages
        </h2>
        <Link
          href="/profile?modal=following"
          className="text-gray-500 hover:text-gray-700"
        >
          <Edit className="w-5 h-5" />
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`relative p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              activeConversationId === conv.id ? "bg-[#E8F8F5]" : ""
            }`}
          >
            {activeConversationId === conv.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1ABC9C]" />
            )}
            <div className="flex gap-3">
              <div className="relative shrink-0">
                <img
                  src={conv.user.avatar}
                  alt={conv.user.name}
                  className="w-12 h-12 rounded-full"
                />
                {conv.user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#1ABC9C] border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {conv.user.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conv.lastMessageTime}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 bg-[#1ABC9C] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
