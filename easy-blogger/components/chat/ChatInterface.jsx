"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useAuth } from "../../app/context/AuthContext";
import { useSocket } from "../../app/context/SocketContext";
import { api } from "../../lib/api";

export default function ChatInterface() {
  const { user, userProfile } = useAuth();
  const { socket } = useSocket();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);

  // Expose current user format that MessageList expects
  const currentUser = userProfile ? {
    id: userProfile.id,
    name: userProfile.displayName || userProfile.username || "You",
    avatar: userProfile.avatarUrl || `https://ui-avatars.com/api/?name=${userProfile.username || "You"}&background=1ABC9C&color=fff`,
  } : null;

  // 1. Fetch initial conversations and handle the queryUserId if present
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const token = await user.getIdToken();
        const res = await api.getConversations(token);
        let formatted = res.data
          .filter(c => c.user.id !== userProfile?.id)
          .map(c => ({
            id: c.user.id,
            user: {
              id: c.user.id,
              name: c.user.displayName || c.user.username,
            avatar: c.user.avatarUrl || `https://ui-avatars.com/api/?name=${c.user.username}`,
            isOnline: c.user.isOnline,
          },
          lastMessage: c.lastMessage ? c.lastMessage.content : "",
          lastMessageTime: c.lastMessage ? new Date(c.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          lastMessageDate: c.lastMessage ? new Date(c.lastMessage.sentAt).getTime() : 0,
          unreadCount: c.unreadCount,
        })).sort((a, b) => b.lastMessageDate - a.lastMessageDate);

        // Handle profile direct message routing
        if (queryUserId && queryUserId !== userProfile?.id) {
          const exists = formatted.find(c => c.id === queryUserId);
          if (!exists) {
            // Fetch target user profile to create a temporary conversation block
            try {
              const profileRes = await api.getUserProfileAuth(queryUserId, token); 
              if (profileRes.data) {
                const newConv = {
                  id: profileRes.data.id,
                  user: {
                    id: profileRes.data.id,
                    name: profileRes.data.displayName || profileRes.data.username,
                    avatar: profileRes.data.avatarUrl || `https://ui-avatars.com/api/?name=${profileRes.data.username}`,
                    isOnline: profileRes.data.isOnline || false,
                  },
                  lastMessage: "Start a conversation!",
                  lastMessageTime: "",
                  unreadCount: 0,
                };
                formatted = [newConv, ...formatted];
              }
            } catch (err) {
              console.error("Failed to fetch query user for chat:", err);
            }
          }
          setActiveConversationId(queryUserId);
        } else if (formatted.length > 0 && !activeConversationId) {
          setActiveConversationId(formatted[0].id);
        }

        setConversations(formatted);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user, queryUserId]); // Re-run if query param changes

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!user || !activeConversationId) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await api.getMessages(activeConversationId, token);

        // Backend sendPaginated sends the array directly in res.data
        const rawMessages = Array.isArray(res?.data) ? res.data : (res?.data?.messages || []);
        const formattedMsgs = rawMessages.map(m => ({
          id: m.id,
          text: m.content,
          timestamp: new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentAt: m.sentAt,
          isRead: Boolean(m.isRead),
          sender: {
            id: m.sender.id,
            name: m.sender.displayName || m.sender.username,
            avatar: m.sender.avatarUrl || `https://ui-avatars.com/api/?name=${m.sender.username}`,
          }
        }));
        setMessages(formattedMsgs);
        
        // Mark as read in DB if there were any unread
        setConversations(prev => {
          const c = prev.find(conv => conv.id === activeConversationId);
          if (c && c.unreadCount > 0) {
            const unreadFromActive = rawMessages
              .filter((m) => m.sender.id === activeConversationId && !m.isRead)
              .map((m) => m.id);

            api.markMessagesAsRead(activeConversationId, token).catch(console.error);
            if (unreadFromActive.length > 0) {
              socket?.emit("message:read", {
                senderId: activeConversationId,
                messageIds: unreadFromActive,
              });
            }
            return prev.map(conv => conv.id === activeConversationId ? { ...conv, unreadCount: 0 } : conv);
          }
          return prev;
        });

      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [activeConversationId, user, socket]);

  // 3. Socket Event Listeners
  useEffect(() => {
    if (!socket || !userProfile) return;

    const onMessageReceive = (message) => {
      const isSenderActiveConv = message.senderId === activeConversationId;
      const formattedMsg = {
        id: message.id,
        text: message.content,
        timestamp: new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: {
          id: message.sender.id,
          name: message.sender.displayName || message.sender.username,
          avatar: message.sender.avatarUrl || `https://ui-avatars.com/api/?name=${message.sender.username}`,
        },
        sentAt: message.sentAt,
        isRead: Boolean(message.isRead),
      };

      if (isSenderActiveConv) {
         setMessages(prev => [...prev, formattedMsg]);
          if (user) {
             user.getIdToken().then(token => {
                api.markMessagesAsRead(activeConversationId, token).catch(console.error);
             });
          }
          socket.emit("message:read", {
            senderId: message.senderId,
            messageIds: [message.id],
          });
       }

      setConversations(prev => {
        let exists = prev.find(c => c.id === message.senderId);
        const others = prev.filter(c => c.id !== message.senderId);
        if (exists) {
           return [
              {
                 ...exists,
                 lastMessage: formattedMsg.text,
                  lastMessageTime: formattedMsg.timestamp,
                 lastMessageDate: new Date(message.sentAt).getTime(),
                 unreadCount: isSenderActiveConv ? 0 : exists.unreadCount + 1,
              },
              ...others
           ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
        } else {
           const newConv = {
             id: message.senderId,
             user: {
               id: message.sender.id,
               name: message.sender.displayName || message.sender.username,
               avatar: message.sender.avatarUrl || `https://ui-avatars.com/api/?name=${message.sender.username}`,
               isOnline: true,
             },
             lastMessage: formattedMsg.text,
             lastMessageTime: formattedMsg.timestamp,
             lastMessageDate: new Date(message.sentAt).getTime(),
             unreadCount: isSenderActiveConv ? 0 : 1,
           };
           return [newConv, ...others].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
        }
      });
    };

    const onMessageDeleted = ({ messageId }) => {
       setMessages(prev => prev.filter(m => m.id !== messageId));

       // Refresh conversations list to update sidebar (last message snippet, re-sorting, edge cases)
       if (user) {
          user.getIdToken().then(token => {
             api.getConversations(token).then(res => {
                const formatted = res.data
                  .filter(c => c.user.id !== userProfile?.id)
                  .map(c => ({
                     id: c.user.id,
                     user: {
                       id: c.user.id,
                       name: c.user.displayName || c.user.username,
                       avatar: c.user.avatarUrl || `https://ui-avatars.com/api/?name=${c.user.username}`,
                       isOnline: c.user.isOnline,
                     },
                     lastMessage: c.lastMessage ? c.lastMessage.content : "",
                     lastMessageTime: c.lastMessage ? new Date(c.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                     lastMessageDate: c.lastMessage ? new Date(c.lastMessage.sentAt).getTime() : 0,
                     unreadCount: c.unreadCount,
                  }))
                  .sort((a, b) => b.lastMessageDate - a.lastMessageDate);
                setConversations(formatted);
             }).catch(console.error);
          });
       }
    };

    const onUserOnline = ({ userId }) => {
       setConversations(prev => prev.map(c => c.id === userId ? { ...c, user: { ...c.user, isOnline: true } } : c));
    };

    const onUserOffline = ({ userId }) => {
       setConversations(prev => prev.map(c => c.id === userId ? { ...c, user: { ...c.user, isOnline: false } } : c));
    };

    const onTypingStart = ({ userId }) => {
      if (userId === activeConversationId) {
        setTypingUserId(userId);
      }
    };

    const onTypingStop = ({ userId }) => {
      if (userId === activeConversationId) {
        setTypingUserId(null);
      }
    };

    const onMessagesRead = ({ messageIds }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;
      setMessages((prev) =>
        prev.map((m) => (messageIds.includes(m.id) ? { ...m, isRead: true } : m)),
      );
    };

    socket.on("message:receive", onMessageReceive);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("user:online", onUserOnline);
    socket.on("user:offline", onUserOffline);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("message:read", onMessagesRead);

    return () => {
      socket.off("message:receive", onMessageReceive);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("user:online", onUserOnline);
      socket.off("user:offline", onUserOffline);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("message:read", onMessagesRead);
    };
  }, [socket, activeConversationId, userProfile, user]);

  const handleSendMessage = (text) => {
    if (!socket || !activeConversationId || !userProfile) return;

    // OPTIMISTIC UI: Show message instantly before backend confirms
    const tempId = `temp-${Date.now()}`;
    const optimisticDate = new Date();
    const optimisticMsg = {
      id: tempId,
      text: text,
      timestamp: optimisticDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser,
      sentAt: optimisticDate.toISOString(),
      isRead: false,
    };

    setMessages(prev => [...prev, optimisticMsg]);

    setConversations(prev => {
      let exists = prev.find(c => c.id === activeConversationId);
      const others = prev.filter(c => c.id !== activeConversationId);
      if (exists) {
         return [
            {
               ...exists,
               lastMessage: text,
               lastMessageTime: optimisticMsg.timestamp,
               lastMessageDate: optimisticDate.getTime(),
            },
            ...others
         ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
      }
      return prev;
    });

    socket.emit("message:send", { receiverId: activeConversationId, content: text }, (res) => {
      if (res.error) {
         alert(res.error);
         // Filter out optimistic message if failed
         setMessages(prev => prev.filter(m => m.id !== tempId));
         return;
      }
      const msg = res.message;
      
      // Replace optimistic message with confirmed backend message
      setMessages(prev => prev.map(m => m.id === tempId ? {
        id: msg.id,
        text: msg.content,
        timestamp: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: currentUser,
        sentAt: msg.sentAt,
        isRead: Boolean(msg.isRead),
      } : m));
      
      // Quietly update conversation timestamp to canonical server timestamp
      setConversations(prev => {
        let exists = prev.find(c => c.id === activeConversationId);
        const others = prev.filter(c => c.id !== activeConversationId);
        if (exists) {
           return [
              {
                 ...exists,
                 lastMessageDate: new Date(msg.sentAt).getTime(),
              },
              ...others
           ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
        }
        return prev;
      });
    });
  };

  const handleDeleteMessage = (messageId) => {
    if (!socket || !activeConversationId) return;

    // OPTIMISTIC UI: Instantly remove message from main view
    setMessages(prev => {
       const filteredMsgs = prev.filter(m => m.id !== messageId);
       
       // OPTIMISTIC UI: Immediately update sidebar if we deleted the latest message
       if (filteredMsgs.length > 0) {
          const newLastMsg = filteredMsgs[filteredMsgs.length - 1];
          setConversations(convPrev => {
             let exists = convPrev.find(c => c.id === activeConversationId);
             const others = convPrev.filter(c => c.id !== activeConversationId);
             if (exists) {
                return [
                   {
                      ...exists,
                      lastMessage: newLastMsg.text,
                      lastMessageTime: newLastMsg.timestamp,
                      lastMessageDate: newLastMsg.lastMessageDate || new Date(newLastMsg.timestamp).getTime(),
                   },
                   ...others
                ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
             }
             return convPrev;
          });
       } else {
          // If all messages were deleted, clear the snippet temporarily
          setConversations(convPrev => {
             let exists = convPrev.find(c => c.id === activeConversationId);
             const others = convPrev.filter(c => c.id !== activeConversationId);
             if (exists) {
                return [
                   {
                      ...exists,
                      lastMessage: "",
                      lastMessageTime: "",
                   },
                   ...others
                ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
             }
             return convPrev;
          });
       }
       return filteredMsgs;
    });

    socket.emit("message:delete", { messageId }, (res) => {
      if (res.error) {
         alert(res.error);
         // If error, the user would need to refresh to get the message back, 
         // or we'd have to store the deleted message to restore it (edge case)
      }
    });
  };

  const handleTypingStart = () => {
    if (!socket || !activeConversationId) return;
    socket.emit("typing:start", { receiverId: activeConversationId });
  };

  const handleTypingStop = () => {
    if (!socket || !activeConversationId) return;
    socket.emit("typing:stop", { receiverId: activeConversationId });
  };

  if (loading || !currentUser) {
     return <div className="flex h-full items-center justify-center bg-white border rounded-2xl shadow-sm text-gray-400">Loading chats...</div>;
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

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
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
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
                     {typingUserId === activeConversationId
                       ? "Typing..."
                       : activeConversation.user.isOnline
                         ? "Active now"
                         : "Offline"}
                   </span>
                 </div>
               </div>
            </div>

            {/* Messages */}
            {messagesLoading ? (
               <div className="flex-1 flex items-center justify-center text-gray-400">Loading messages...</div>
            ) : (
               <MessageList
                 messages={messages}
                 currentUser={currentUser}
                 onDeleteMessage={handleDeleteMessage}
               />
            )}

            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {conversations.length === 0 ? "You have no conversations yet." : "Select a conversation to start chatting"}
          </div>
        )}
      </div>
    </div>
  );
}
