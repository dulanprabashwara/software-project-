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
  const [activeConversationOnline, setActiveConversationOnline] =
    useState(false);

  // Expose current user format that MessageList expects
  const currentUser = userProfile
    ? {
        id: userProfile.id,
        name: userProfile.displayName || userProfile.username || "You",
        avatar:
          userProfile.avatarUrl ||
          `https://ui-avatars.com/api/?name=${userProfile.username || "You"}&background=1ABC9C&color=fff`,
      }
    : null;

  // 1. Fetch initial conversations and handle the queryUserId if present
  useEffect(() => {
    if (!user) return;
    //fetch the conversations of user
    const fetchConversations = async () => {
      try {
        const token = await user.getIdToken(true); // force-refresh to avoid stale token 500 errors
        const res = await api.getConversations(token);

        // formats and sorts the conversation list to show in the left side bar
        let formatted = res.data
          .filter((c) => c.user.id !== userProfile?.id)
          .map((c) => ({
            id: c.user.id,
            user: {
              id: c.user.id,
              name: c.user.displayName || c.user.username,
              avatar:
                c.user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${c.user.username}`,
              isOnline: c.user.isOnline,
            },
            lastMessage: c.lastMessage ? c.lastMessage.content : "",
            lastMessageTime: c.lastMessage
              ? new Date(c.lastMessage.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
            lastMessageDate: c.lastMessage
              ? new Date(c.lastMessage.sentAt).getTime()
              : 0,
            unreadCount: c.unreadCount,
          }))
          .sort((a, b) => b.lastMessageDate - a.lastMessageDate);

        // if user has clicked on a user profile and click message it will open the chat with their userid
        if (queryUserId && queryUserId !== userProfile?.id) {
          const exists = formatted.find((c) => c.id === queryUserId);

          //if doesnt have a chat with them fetch their profile and create a new conversation block at the top of the list
          if (!exists) {
            try {
              const profileRes = await api.getUserProfileAuth(
                queryUserId,
                token,
              );
              if (profileRes.data) {
                const newConv = {
                  id: profileRes.data.id,
                  user: {
                    id: profileRes.data.id,
                    name:
                      profileRes.data.displayName || profileRes.data.username,
                    avatar:
                      profileRes.data.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${profileRes.data.username}`,
                    isOnline: profileRes.data.isOnline || false,
                  },
                  lastMessage: "Start a conversation!",
                  lastMessageTime: "",
                  lastMessageDate: 0,
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

        //saves the conv list and updates the active conversation online status
        setConversations(formatted);
        const activeConv = formatted.find((c) => c.id === activeConversationId);
        if (activeConv) {
          setActiveConversationOnline(Boolean(activeConv.user.isOnline));
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user, queryUserId]); // Re-run if the seleceted user changes

  //update online status if activeConversationId or conversations changes with a user
  useEffect(() => {
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    setActiveConversationOnline(Boolean(activeConv?.user?.isOnline));
  }, [conversations, activeConversationId]);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!user || !activeConversationId) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const token = await user.getIdToken(true);
        const res = await api.getMessages(activeConversationId, token);

        // gets the array of messages in res.data
        const rawMessages = Array.isArray(res?.data)
          ? res.data
          : res?.data?.messages || [];
        // formats messages for the chat ui and then save in Messages state
        const formattedMsgs = rawMessages.map((m) => ({
          id: m.id,
          text: m.content,
          timestamp: new Date(m.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sentAt: m.sentAt,
          isRead: Boolean(m.isRead),
          sender: {
            id: m.sender.id,
            name: m.sender.displayName || m.sender.username,
            avatar:
              m.sender.avatarUrl ||
              `https://ui-avatars.com/api/?name=${m.sender.username}`,
          },
        }));
        setMessages(formattedMsgs);

        // Check for unread messages in the conversation and mark them as read
        setConversations((prev) => {
          const c = prev.find((conv) => conv.id === activeConversationId);
          //if there are unread messages in the active conversation
          if (c && c.unreadCount > 0) {
            const unreadFromActive = rawMessages
              .filter((m) => m.sender.id === activeConversationId && !m.isRead)
              .map((m) => m.id);

            api
              .markMessagesAsRead(activeConversationId, token)
              .catch(console.error);
            if (unreadFromActive.length > 0) {
              socket?.emit("message:read", {
                senderId: activeConversationId,
                messageIds: unreadFromActive,
              });
            }
            //update unread count to 0 to remove green dot on the left sidebar
            return prev.map((conv) =>
              conv.id === activeConversationId
                ? { ...conv, unreadCount: 0 }
                : conv,
            );
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

    //if receive a message
    const onMessageReceive = (message) => {
      const isSenderActiveConv = message.senderId === activeConversationId;
      //format the received messages
      const formattedMsg = {
        id: message.id,
        text: message.content,
        timestamp: new Date(message.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: {
          id: message.sender.id,
          name: message.sender.displayName || message.sender.username,
          avatar:
            message.sender.avatarUrl ||
            `https://ui-avatars.com/api/?name=${message.sender.username}`,
        },
        sentAt: message.sentAt,
        isRead: Boolean(message.isRead),
      };

      //if have their chat open, mark as read and notify sender and just add the message to the messages list
      if (isSenderActiveConv) {
        setMessages((prev) => [...prev, formattedMsg]);
        //mark as read and notify sender
        if (user) {
          user.getIdToken(true).then((token) => {
            api
              .markMessagesAsRead(activeConversationId, token)
              .catch(console.error);
          });
        }
        socket.emit("message:read", {
          senderId: message.senderId,
          messageIds: [message.id],
        });
      }

      //update the sidebar by push the conversation up and update the last message and unread count by +1
      setConversations((prev) => {
        let exists = prev.find((c) => c.id === message.senderId);
        const others = prev.filter((c) => c.id !== message.senderId);
        if (exists) {
          return [
            {
              ...exists,
              lastMessage: formattedMsg.text,
              lastMessageTime: formattedMsg.timestamp,
              lastMessageDate: new Date(message.sentAt).getTime(),
              unreadCount: isSenderActiveConv ? 0 : exists.unreadCount + 1,
            },
            ...others,
          ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
        } else {
          const newConv = {
            id: message.senderId,
            user: {
              id: message.sender.id,
              name: message.sender.displayName || message.sender.username,
              avatar:
                message.sender.avatarUrl ||
                `https://ui-avatars.com/api/?name=${message.sender.username}`,
              isOnline: true,
            },
            lastMessage: formattedMsg.text,
            lastMessageTime: formattedMsg.timestamp,
            lastMessageDate: new Date(message.sentAt).getTime(),
            unreadCount: isSenderActiveConv ? 0 : 1,
          };
          return [newConv, ...others].sort(
            (a, b) => b.lastMessageDate - a.lastMessageDate,
          );
        }
      });
    };

    //if someone deleted a message
    const onMessageDeleted = ({ messageId }) => {
      //update the messages list
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== messageId);

        //update sidebar snippet
        setConversations((convPrev) => {
          // Find which conversation this deleted message belonged to by checking all conversations for matching sidebar text
          return convPrev
            .map((conv) => {
              // We only need to update if this was the last message shown
              const lastMsg =
                filtered.length > 0 ? filtered[filtered.length - 1] : null;
              // Check if the active conversation matches
              if (conv.id === activeConversationId) {
                return {
                  ...conv,
                  lastMessage: lastMsg ? lastMsg.text : "",
                  lastMessageTime: lastMsg ? lastMsg.timestamp : "",
                  lastMessageDate: lastMsg?.sentAt
                    ? new Date(lastMsg.sentAt).getTime()
                    : conv.lastMessageDate || 0,
                };
              }
              return conv;
            })
            .sort(
              (a, b) => (b.lastMessageDate || 0) - (a.lastMessageDate || 0),
            );
        });

        return filtered;
      });
    };

    //turns the dot next to name green
    const onUserOnline = ({ userId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === userId ? { ...c, user: { ...c.user, isOnline: true } } : c,
        ),
      );
      if (userId === activeConversationId) {
        setActiveConversationOnline(true);
      }
    };

    //turns the dot next to name grey
    const onUserOffline = ({ userId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === userId ? { ...c, user: { ...c.user, isOnline: false } } : c,
        ),
      );
      if (userId === activeConversationId) {
        setActiveConversationOnline(false);
        setTypingUserId(null);
      }
    };

    //shows when someone is typing
    const onTypingStart = ({ userId }) => {
      if (userId === activeConversationId) {
        setTypingUserId(userId);
      }
    };

    //hides typing indicator when someone stops typing
    const onTypingStop = ({ userId }) => {
      if (userId === activeConversationId) {
        setTypingUserId(null);
      }
    };

    //if the person we're talking to has read our message, mark it as read
    const onMessagesRead = ({ messageIds }) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m.id) ? { ...m, isRead: true } : m,
        ),
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

  //handling sending a message
  const handleSendMessage = (text) => {
    if (!socket || !activeConversationId || !userProfile) return;

    // OPTIMISTIC UI: create a tempory message and show instantly before backend confirms
    const tempId = `temp-${Date.now()}`;
    const optimisticDate = new Date();
    const optimisticMsg = {
      id: tempId,
      text: text,
      timestamp: optimisticDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: currentUser,
      sentAt: optimisticDate.toISOString(),
      isRead: false,
    };

    //update the messages list with the optimistic message
    setMessages((prev) => [...prev, optimisticMsg]);

    //update the sidebar to show the new message
    setConversations((prev) => {
      let exists = prev.find((c) => c.id === activeConversationId);
      const others = prev.filter((c) => c.id !== activeConversationId);
      if (exists) {
        return [
          {
            ...exists,
            lastMessage: text,
            lastMessageTime: optimisticMsg.timestamp,
            lastMessageDate: optimisticDate.getTime(),
          },
          ...others,
        ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
      }
      return prev;
    });

    //sending the message to the backend over websocket
    socket.emit(
      "message:send",
      { receiverId: activeConversationId, content: text },
      (res) => {
        if (res.error) {
          //remove optimistic message if failed
          alert(res.error);
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }
        const msg = res.message;

        // if successfully sent Replace optimistic message with confirmed backend message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  id: msg.id,
                  text: msg.content,
                  timestamp: new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  sender: currentUser,
                  sentAt: msg.sentAt,
                  isRead: Boolean(msg.isRead),
                }
              : m,
          ),
        );

        //if message sent successfully update conversation's lastMessage time
        setConversations((prev) => {
          let exists = prev.find((c) => c.id === activeConversationId);
          const others = prev.filter((c) => c.id !== activeConversationId);
          if (exists) {
            return [
              {
                ...exists,
                lastMessageDate: new Date(msg.sentAt).getTime(),
              },
              ...others,
            ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
          }
          return prev;
        });
      },
    );
  };

  //deleting a message
  const handleDeleteMessage = (messageId) => {
    if (!socket || !activeConversationId) return;

    const messageToDelete = messages.find((m) => m.id === messageId);

    // OPTIMISTIC UI: Instantly remove message from main view
    setMessages((prev) => {
      const filteredMsgs = prev.filter((m) => m.id !== messageId);

      // OPTIMISTIC UI: Immediately update sidebar if we deleted the latest message
      if (filteredMsgs.length > 0) {
        const newLastMsg = filteredMsgs[filteredMsgs.length - 1];
        setConversations((convPrev) => {
          let exists = convPrev.find((c) => c.id === activeConversationId);
          const others = convPrev.filter((c) => c.id !== activeConversationId);
          if (exists) {
            //if there are older messages updates the sidebar to show the text of the previous message
            return [
              {
                ...exists,
                lastMessage: newLastMsg.text,
                lastMessageTime: newLastMsg.timestamp,
                lastMessageDate: newLastMsg.sentAt
                  ? new Date(newLastMsg.sentAt).getTime()
                  : exists.lastMessageDate || 0,
              },
              ...others,
            ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
          }
          return convPrev;
        });
      } else {
        //if no message left clear the sidebar msg completely
        setConversations((convPrev) => {
          let exists = convPrev.find((c) => c.id === activeConversationId);
          const others = convPrev.filter((c) => c.id !== activeConversationId);
          if (exists) {
            return [
              {
                ...exists,
                lastMessage: "",
                lastMessageTime: "",
              },
              ...others,
            ].sort((a, b) => b.lastMessageDate - a.lastMessageDate);
          }
          return convPrev;
        });
      }
      return filteredMsgs;
    });

    //send a websocket to delete the message
    socket.emit("message:delete", { messageId }, (res) => {
      if (res.error) {
        //Capture the message to restore it if the server fails
        alert(res.error);
        if (messageToDelete) {
          setMessages((prev) => {
            const restored = [...prev, messageToDelete];
            return restored.sort(
              (a, b) =>
                new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
            );
          });
        }
      }
    });
  };

  // update user typing state in backend
  const handleTypingStart = () => {
    if (!socket || !activeConversationId) return;
    socket.emit("typing:start", { receiverId: activeConversationId });
  };

  // update user typing state in backend
  const handleTypingStop = () => {
    if (!socket || !activeConversationId) return;
    socket.emit("typing:stop", { receiverId: activeConversationId });
  };

  // when select a conversation clear unread badge + tell the app to switch the middle screen to show specific conversation
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    // clear old messages immediately so stale messages don't flash while new ones are loading
    setMessages([]);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
    );
    // mark messages as read in DB
    if (user) {
      user.getIdToken(true).then((token) => {
        api.markMessagesAsRead(convId, token).catch(console.error);
      });
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex h-full items-center justify-center bg-white border rounded-2xl shadow-sm text-gray-400">
        Loading chats...
      </div>
    );
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  return (
    <div className="flex h-full min-h-0 bg-white border rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
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
                      : activeConversationOnline
                        ? "Active now"
                        : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Loading messages...
              </div>
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
            {conversations.length === 0
              ? "You have no conversations yet."
              : "Select a conversation to start chatting"}
          </div>
        )}
      </div>
    </div>
  );
}
