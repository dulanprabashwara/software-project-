"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
}) {
  const messagesEndRef = useRef(null);
  //scroll to the bottom of the messages when a new message is received
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  //trigger the scrollToBottom function when the messages array is updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          id={message.id}
          text={message.text}
          sender={message.sender}
          timestamp={message.timestamp}
          isRead={Boolean(message.isRead)}
          isOwnMessage={message.sender.id === currentUser.id}
          onDelete={() => onDeleteMessage && onDeleteMessage(message.id)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
