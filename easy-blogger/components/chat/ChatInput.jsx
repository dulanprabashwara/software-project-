"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({
  onSendMessage,
  onTypingStart,
  onTypingStop,
}) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const stopTyping = () => {
    if (isTypingRef.current) {
      onTypingStop?.();
      setIsTyping(false);
      isTypingRef.current = false;
    }
    clearTypingTimeout();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      stopTyping();
      setMessage("");
    }
  };

  const handleChange = (e) => {
    const nextValue = e.target.value;
    setMessage(nextValue);

    if (!nextValue.trim()) {
      stopTyping();
      return;
    }

    if (!isTyping) {
      onTypingStart?.();
      setIsTyping(true);
      isTypingRef.current = true;
    }

    clearTypingTimeout();
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
      setIsTyping(false);
      isTypingRef.current = false;
      typingTimeoutRef.current = null;
    }, 1200);
  };

  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, []);

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Write a message..."
          className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-[#1ABC9C] focus:ring-1 focus:ring-[#1ABC9C] transition-all bg-gray-50 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3 rounded-full bg-[#1ABC9C] text-white hover:bg-[#17a589] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
