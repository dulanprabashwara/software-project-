"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          id={message.id}
          text={message.text}
          sender={message.sender}
          timestamp={message.timestamp}
          isOwnMessage={message.sender.id === currentUser.id}
          onDelete={() => onDeleteMessage && onDeleteMessage(message.id)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
