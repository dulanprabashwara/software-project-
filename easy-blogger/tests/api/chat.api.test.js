// tests/api/chat.api.test.js

const {
  mockFetch,
  mockFetchError,
  resetFetch,
} = require("../mocks/fetch.mock");
const { api, API_BASE_URL } = require("../helpers/api.cjs");

afterEach(() => {
  resetFetch();
  jest.clearAllMocks();
});

//  api.getConversations

describe("api.getConversations", () => {
  test("calls GET /api/messages/conversations with the correct URL", async () => {
    mockFetch({ success: true, data: [] });

    await api.getConversations("user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/messages/conversations`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: [] });

    await api.getConversations("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: [] });

    await api.getConversations("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns a list of conversations on success", async () => {
    const serverResponse = {
      success: true,
      data: [
        {
          userId: "user-002",
          username: "alice",
          lastMessage: "Hey!",
          unreadCount: 2,
        },
        {
          userId: "user-003",
          username: "bob",
          lastMessage: "Hi",
          unreadCount: 0,
        },
      ],
    };
    mockFetch(serverResponse);

    const result = await api.getConversations("user-token-abc");

    expect(result).toEqual(serverResponse);
  });

  test("returns an empty list when user has no conversations", async () => {
    mockFetch({ success: true, data: [] });

    const result = await api.getConversations("user-token-abc");

    expect(result.data).toEqual([]);
  });

  test("throws when server returns 401 (no token)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.getConversations("bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getConversations("user-token-abc")).rejects.toThrow(
      "Network error",
    );
  });
});

//  api.getMessages

describe("api.getMessages", () => {
  test("calls GET /api/messages/:userId with the correct URL", async () => {
    mockFetch({ success: true, data: [] });

    await api.getMessages("user-002", "user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/messages/user-002`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: [] });

    await api.getMessages("user-002", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: [] });

    await api.getMessages("user-002", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns a list of messages on success", async () => {
    const serverResponse = {
      success: true,
      data: [
        {
          id: "msg-001",
          senderId: "user-001",
          content: "Hello!",
          createdAt: "2025-01-01T10:00:00Z",
        },
        {
          id: "msg-002",
          senderId: "user-002",
          content: "Hi there!",
          createdAt: "2025-01-01T10:01:00Z",
        },
      ],
    };
    mockFetch(serverResponse);

    const result = await api.getMessages("user-002", "user-token-abc");

    expect(result).toEqual(serverResponse);
  });

  test("returns an empty list when no messages exist", async () => {
    mockFetch({ success: true, data: [] });

    const result = await api.getMessages("user-002", "user-token-abc");

    expect(result.data).toEqual([]);
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.getMessages("user-002", "bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws when server returns 404 (conversation not found)", async () => {
    mockFetch({ message: "Conversation not found." }, 404);

    await expect(
      api.getMessages("nonexistent-user", "user-token-abc"),
    ).rejects.toThrow("Conversation not found.");
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getMessages("user-002", "user-token-abc")).rejects.toThrow(
      "Network error",
    );
  });
});

//  api.markMessagesAsRead

describe("api.markMessagesAsRead", () => {
  test("calls PUT /api/messages/:userId/read with the correct URL", async () => {
    mockFetch({ success: true });

    await api.markMessagesAsRead("user-002", "user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/messages/user-002/read`,
      expect.any(Object),
    );
  });

  test("uses PUT method", async () => {
    mockFetch({ success: true });

    await api.markMessagesAsRead("user-002", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("PUT");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true });

    await api.markMessagesAsRead("user-002", "mark-read-token");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer mark-read-token");
  });

  test("returns success on marking messages as read", async () => {
    const serverResponse = { success: true };
    mockFetch(serverResponse);

    const result = await api.markMessagesAsRead("user-002", "user-token-abc");

    expect(result).toEqual(serverResponse);
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(
      api.markMessagesAsRead("user-002", "bad-token"),
    ).rejects.toThrow("Access denied. No token provided.");
  });
});

//  api.getUnreadMessageCount

describe("api.getUnreadMessageCount", () => {
  test("calls GET /api/messages/unread/count with the correct URL", async () => {
    mockFetch({ success: true, data: { count: 0 } });

    await api.getUnreadMessageCount("user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/messages/unread/count`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: { count: 0 } });

    await api.getUnreadMessageCount("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: { count: 0 } });

    await api.getUnreadMessageCount("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns the unread message count on success", async () => {
    const serverResponse = { success: true, data: { count: 5 } };
    mockFetch(serverResponse);

    const result = await api.getUnreadMessageCount("user-token-abc");

    expect(result).toEqual(serverResponse);
  });

  test("returns zero when there are no unread messages", async () => {
    mockFetch({ success: true, data: { count: 0 } });

    const result = await api.getUnreadMessageCount("user-token-abc");

    expect(result.data.count).toBe(0);
  });

  test("throws when server returns 401 (no token)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.getUnreadMessageCount("bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getUnreadMessageCount("user-token-abc")).rejects.toThrow(
      "Network error",
    );
  });
});
