# Real-Time Chat System Documentation

This document explains the comprehensive implementation details of the Real-Time Chat System built into the Easy Blogger platform. It covers the architecture, the database model, the real-time websocket events, REST APIs, and the frontend React component structure.

## Overview & Architecture

Our real-time chat feature relies on a **hybrid approach**, utilizing both **REST APIs** (for fetching historical data) and **WebSocket connections via Socket.IO** (for instant communication, typing indicators, and presence updates).

- **Backend:** Node.js, Express, Prisma (PostgreSQL), and Socket.IO.
- **Frontend:** Next.js (React), Tailwind CSS, and `socket.io-client`.

By decoupling the historical data load (REST) from live updates (Socket.IO), we achieve faster initial load times while maintaining instantaneous communication.

---

## 1. Database Schema (`prisma/schema.prisma`)

At the core of the chat system is the `Message` model. This model establishes a two-way relationship between senders and receivers (both users).

```prisma
model Message {
  id         String   @id @default(cuid())
  content    String
  isRead     Boolean  @default(false)
  sentAt     DateTime @default(now())
  senderId   String
  receiverId String
  receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  sender     User     @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)

  @@index([senderId])
  @@index([receiverId])
  @@index([sentAt])
  @@map("messages")
}
```

**Key choices:**

- Indexing `senderId`, `receiverId`, and `sentAt` heavily optimizes lookups when querying conversation history.
- The `isRead` boolean is critical for managing unread badges.

---

## 2. Backend Implementation

### A. The REST API Layer

The REST layer is responsible for the initial data hydration when a user opens the chat or visits their profile.

**1. `src/controllers/message.controller.js` & `src/services/message.service.js`:**

- **`getConversations` (`getConversationList`)**: Finds all unique users the current user has interacted with. It gets the latest message between them, calculates the unread count (where `isRead = false`), fetches the online status of the other user, and sorts conversations by the most recent `sentAt` timestamp.
- **`getConversation` (`getConversation`)**: Uses pagination to fetch the message history between two specific users chronologically.
- **`getUnreadCount`**: Returns the absolute count of unread messages a user currently has (used in the user profile view).
- **`markAsRead`**: Updates all messages sent by a specific user to the current user, setting `isRead: true`.

### B. The WebSocket Layer (`src/sockets/index.js`)

This file is the nervous system of the real-time capabilities.

**Authentication & Connection:**

- Uses a middleware to verify the user's Firebase ID Token upon socket connection.
- Assigns the user to a private socket room: `socket.join("user:${userId}")` to easily dispatch direct messages.
- Manages an in-memory `Map` of `userConnections` to count active tabs/devices per user. It marks a user as `online` in the DB when the first connection establishes, and `offline` when the connection count reaches zero. To prevent flickering during page reloads, the offline status includes a **4-second debounce**.

**Events Handled:**

- `message:send`: Creates a message in the DB. Implements security to ensure users can only message people they follow or have prior history with. Emits `message:receive` to the receiver's private room.
- `message:delete`: Verifies that the requester is the sender, deletes the record from the DB, and emits `message:deleted` to both sender and receiver so their UIs can instantly remove the bubble.
- `message:read`: Updates the DB marking messages as read and emits a `message:read` event to the sender (to trigger "Seen" receipts).
- `typing:start` / `typing:stop`: Broadcasts typing states instantly to the receiver.

---

## 3. Frontend Implementation

### A. Context & Global State (`app/context/SocketContext.js`)

We wrap the entire application inside `<SocketProvider>`.

- Ensures a single, persistent Socket.IO connection is maintained securely utilizing the Firebase Auth token.
- Listens for global `connect` and `disconnect` events.

### B. Chat Interface Component (`components/chat/ChatInterface.jsx`)

The main coordinator. This component orchestrates all chat operations.

**Initialization flow:**

1. Fetches the overall `conversations` list via the REST API to populate the left sidebar.
2. If the user initiates a DM via a URL query parameter (`?userId=`), it verifies if a conversation exists. If not, it creates a temporary local "dummy" conversation entry.
3. Once a conversation is selected via the sidebar (`activeConversationId`), it triggers a REST API call to fetch `messages` for that user.

**Optimistic UI:**
The cornerstone of a snappy chat app is "Optimistic UI Updates" — updating the local React state _before_ the server responds.

- **Sending:** When `handleSendMessage` is called, a temporary message (with a temporary ID like `temp-12345`) is instantly pushed to the `messages` array and the sidebar conversation is updated. The message is then emitted to the backend. Once confirmed, the temporary message is replaced with the real DB record.
- **Deleting:** When `handleDeleteMessage` is fired, it instantly filters out the message ID locally and immediately updates the sidebar to reflect the new "last message" without waiting for the server.

**Dealing with Side Effects (`useEffect` Hooks):**

- **Socket Listeners:** The component attaches listeners for `message:receive`, `message:deleted`, `user:online`/`offline`, `typing:start`/`stop`, and `message:read`.
- **Badge Management:** When a message is received from the active chat, it's instantly marked as read. If it's from a background chat, the `unreadCount` badge in the sidebar increments.

**State Synchronization Fixes:**

- When a user clicks a conversation in the sidebar, `unreadCount` is immediately zeroed in the React state to prevent a visual flicker before dispatching the async `markMessagesAsRead` call to the server.

### C. Sidebar Component (`components/chat/ConversationList.jsx`)

- Filters the left pane conversations based on a search query.
- Renders the avatar, online indicator (`isOnline`), username, and a snippet of the `lastMessage`.
- Dynamically highlights the active conversation.

### D. Chat Input Component (`components/chat/ChatInput.jsx`)

- Manages the local message input text state.
- **Typing Indicator Debounce Logic:** When a user types, it emits `typing:start`. It uses a Javascript `setTimeout` (1.2 seconds) to automatically dispatch `typing:stop` if the user stops typing.

### E. Message Bubbles (`components/chat/MessageList.jsx` & `MessageBubble.jsx`)

- Maps over the messages state and renders distinct bubbles for `isOwnMessage` (Green, Right-aligned) vs. received messages (Gray, Left-aligned).
- Integrates an auto-scroll mechanism using a `useRef` to instantly snap to the bottom of the chat whenever a new message arrives.
- Tracks and displays the `isRead` flag to show "Sent" or "Seen" receipts underneath sender bubbles.

---

## Security Highlights

1. **Authorization Verification:** The socket connection immediately drops connections without valid Firebase ID tokens.
2. **Access Control:** The backend (`message:send`) ensures users cannot spam strangers by verifying a Prisma `Follow` relationship or prior chat history.
3. **Delete Restrictions:** A user is strictly denied from deleting a message where `message.senderId !== requester.userId`.
