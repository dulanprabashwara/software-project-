"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

// Mock Data
const MOCK_CURRENT_USER = {
  id: "current-user",
  name: "You",
  avatar: "https://i.pravatar.cc/150?img=47",
};

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    user: {
      id: "u1",
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=11",
      isOnline: true,
    },
    lastMessage: "Thanks for the article! Really helpful.",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    messages: [
      {
        id: "m1",
        text: "Hey Emma, loved your piece on AI!",
        timestamp: "10:30 AM",
        sender: {
          id: "u1",
          name: "Michael Chen",
          avatar: "https://i.pravatar.cc/150?img=11",
        },
      },
      {
        id: "m2",
        text: "Thanks Michael! Glad you enjoyed it.",
        timestamp: "10:32 AM",
        sender: {
          id: "current-user",
          name: "You",
          avatar: "https://i.pravatar.cc/150?img=47",
        },
      },
      {
        id: "m3",
        text: "Are you planning a follow-up?",
        timestamp: "10:33 AM",
        sender: {
          id: "u1",
          name: "Michael Chen",
          avatar: "https://i.pravatar.cc/150?img=11",
        },
      },
      {
        id: "m4",
        text: "Thanks for the article! Really helpful.",
        timestamp: "10:35 AM",
        sender: {
          id: "u1",
          name: "Michael Chen",
          avatar: "https://i.pravatar.cc/150?img=11",
        },
      },
    ],
  },
  {
    id: 2,
    user: {
      id: "u2",
      name: "Sophia Martinez",
      avatar: "https://i.pravatar.cc/150?img=5",
      isOnline: false,
    },
    lastMessage: "Let's collaborate on the next one.",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        text: "Hi Sophia, how are you?",
        timestamp: "09:00 AM",
        sender: {
          id: "current-user",
          name: "You",
          avatar: "https://i.pravatar.cc/150?img=47",
        },
      },
      {
        id: "m2",
        text: "I'm doing great! Let's collaborate on the next one.",
        timestamp: "09:05 AM",
        sender: {
          id: "u2",
          name: "Sophia Martinez",
          avatar: "https://i.pravatar.cc/150?img=5",
        },
      },
    ],
  },
  {
    id: 3,
    user: {
      id: "u3",
      name: "James Wilson",
      avatar: "https://i.pravatar.cc/150?img=3",
      isOnline: false,
    },
    lastMessage: "Can you check my draft?",
    lastMessageTime: "3h ago",
    unreadCount: 0,
    messages: [],
  },
  {
    id: 4,
    user: {
      id: "u4",
      name: "Olivia Parker",
      avatar: "https://i.pravatar.cc/150?img=9",
      isOnline: true,
    },
    lastMessage: "See you at the conference!",
    lastMessageTime: "1d ago",
    unreadCount: 0,
    messages: [],
  },
];

export default function ChatInterface() {
  const [activeConversationId, setActiveConversationId] = useState(1);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: MOCK_CURRENT_USER,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: text,
            lastMessageTime: "Just now",
          };
        }
        return conv;
      }),
    );
  };

  const handleDeleteMessage = (messageId) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          const updatedMessages = conv.messages.filter(
            (m) => m.id !== messageId,
          );
          const lastMsg =
            updatedMessages.length > 0
              ? updatedMessages[updatedMessages.length - 1]
              : null;

          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: lastMsg ? lastMsg.text : "",
            lastMessageTime: lastMsg ? lastMsg.timestamp : "",
          };
        }
        return conv;
      }),
    );
  };

  return (
    <div className="flex h-full bg-white border rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeConversation.user.avatar}
                    alt={activeConversation.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {activeConversation.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1ABC9C] border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {activeConversation.user.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {activeConversation.user.isOnline
                      ? "Active now"
                      : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={activeConversation.messages}
              currentUser={MOCK_CURRENT_USER}
              onDeleteMessage={handleDeleteMessage}
            />

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
