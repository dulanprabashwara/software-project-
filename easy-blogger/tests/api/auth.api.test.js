// tests/api/auth.api.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Unit tests for the auth-related API methods in lib/api.js:
//   • api.registerUser  – POST /api/auth/register
//   • api.syncUser      – POST /api/auth/sync
//   • api.getMe         – GET  /api/users/me
// ─────────────────────────────────────────────────────────────────────────────

const { mockFetch, mockFetchError, resetFetch } = require("../mocks/fetch.mock");
const { api, API_BASE_URL } = require("../helpers/api.cjs");

afterEach(() => {
  resetFetch();
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════════════════
//  api.registerUser
// ════════════════════════════════════════════════════════════════════════════
describe("api.registerUser", () => {

  const REGISTRATION_DATA = {
    firebaseUid: "firebase-uid-001",
    email:       "newuser@example.com",
    username:    "newuser",
    displayName: "New User",
  };

  test("calls POST /api/auth/register with the correct URL", async () => {
    mockFetch({ success: true, data: { id: "user-001" } });

    await api.registerUser(REGISTRATION_DATA, "firebase-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/register`,
      expect.any(Object),
    );
  });

  test("sends the user data as a JSON body", async () => {
    mockFetch({ success: true, data: {} });

    await api.registerUser(REGISTRATION_DATA, "firebase-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify(REGISTRATION_DATA));
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: {} });

    await api.registerUser(REGISTRATION_DATA, "firebase-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer firebase-token-abc");
  });

  test("uses POST method", async () => {
    mockFetch({ success: true, data: {} });

    await api.registerUser(REGISTRATION_DATA, "firebase-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
  });

  test("throws when server returns 409 (username already taken)", async () => {
    mockFetch({ message: "Username already taken." }, 409);

    await expect(api.registerUser(REGISTRATION_DATA, "firebase-token-abc"))
      .rejects.toThrow("Username already taken.");
  });

  test("throws when server returns 409 (email already in use)", async () => {
    mockFetch({ message: "Email already in use." }, 409);

    await expect(api.registerUser(REGISTRATION_DATA, "firebase-token-abc"))
      .rejects.toThrow("Email already in use.");
  });

  test("returns the created user data on success", async () => {
    const serverResponse = { success: true, data: { id: "user-001", username: "newuser" } };
    mockFetch(serverResponse, 200);

    const result = await api.registerUser(REGISTRATION_DATA, "firebase-token-abc");

    expect(result).toEqual(serverResponse);
  });
});


// ════════════════════════════════════════════════════════════════════════════
//  api.syncUser
// ════════════════════════════════════════════════════════════════════════════
describe("api.syncUser", () => {

  test("calls POST /api/auth/sync with the correct URL", async () => {
    mockFetch({ success: true, data: {} });

    await api.syncUser({ firebaseUid: "uid-001" }, "token-xyz");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/sync`,
      expect.any(Object),
    );
  });

  test("sends the token in the Authorization header", async () => {
    mockFetch({ success: true, data: {} });

    await api.syncUser({ firebaseUid: "uid-001" }, "my-sync-token");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer my-sync-token");
  });

  test("returns the synced user profile on success", async () => {
    const profileData = { success: true, data: { id: "user-001", isPremium: false } };
    mockFetch(profileData);

    const result = await api.syncUser({ firebaseUid: "uid-001" }, "token");
    expect(result).toEqual(profileData);
  });

  test("throws when the server returns 401 (unrecognised Firebase UID)", async () => {
    mockFetch({ message: "User not found. Please register first." }, 401);

    await expect(api.syncUser({ firebaseUid: "unknown-uid" }, "token"))
      .rejects.toThrow("User not found. Please register first.");
  });
});


// ════════════════════════════════════════════════════════════════════════════
//  api.getMe
// ════════════════════════════════════════════════════════════════════════════
describe("api.getMe", () => {

  test("calls GET /api/users/me", async () => {
    mockFetch({ success: true, data: { id: "me" } });

    await api.getMe("my-token");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/me`,
      expect.any(Object),
    );
  });

  test("sends the token in the Authorization header", async () => {
    mockFetch({ success: true, data: {} });

    await api.getMe("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: {} });

    await api.getMe("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("returns the logged-in user profile on success", async () => {
    const me = { success: true, data: { id: "user-001", username: "john", isPremium: true } };
    mockFetch(me);

    const result = await api.getMe("my-token");
    expect(result).toEqual(me);
  });

  test("throws when server returns 401 (no token / expired token)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.getMe("bad-token"))
      .rejects.toThrow("Access denied. No token provided.");
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getMe("my-token"))
      .rejects.toThrow("Network error");
  });
});
