// tests/api/fetchAPI.test.js
// ─────────────────────────────────────────────────────────────────────────────
// Unit tests for the core fetchAPI() wrapper in lib/api.js.
// This function is the foundation every api.xxx() call builds on.
//
// Tests verify:
//  • Correct URL construction
//  • Correct headers (Content-Type, Authorization)
//  • Body serialization to JSON
//  • Successful response parsing
//  • Error thrown when response.ok is false
//  • Error thrown on network failure
// ─────────────────────────────────────────────────────────────────────────────

const { mockFetch, mockFetchError, resetFetch } = require("../mocks/fetch.mock");
const { fetchAPI, API_BASE_URL } = require("../helpers/api.cjs");

afterEach(() => {
  resetFetch();
  jest.clearAllMocks();
});


// ════════════════════════════════════════════════════════════════════════════
//  URL & Method
// ════════════════════════════════════════════════════════════════════════════
describe("fetchAPI — URL and method", () => {

  test("calls fetch with the correct full URL by combining BASE_URL + endpoint", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/articles`,
      expect.any(Object),
    );
  });

  test("defaults to GET method when no method is specified", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("uses the method provided in options (POST, PUT, DELETE)", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles", { method: "POST" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "POST" }),
    );
  });
});


// ════════════════════════════════════════════════════════════════════════════
//  Headers
// ════════════════════════════════════════════════════════════════════════════
describe("fetchAPI — headers", () => {

  test("always sends Content-Type: application/json", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  test("adds Authorization: Bearer <token> header when token is provided", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/users/me", { token: "my-firebase-jwt-token" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-firebase-jwt-token",
        }),
      }),
    );
  });

  test("does NOT add Authorization header when token is not provided", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBeUndefined();
  });
});


// ════════════════════════════════════════════════════════════════════════════
//  Body
// ════════════════════════════════════════════════════════════════════════════
describe("fetchAPI — request body", () => {

  test("serializes the body object to a JSON string", async () => {
    mockFetch({ success: true });
    const payload = { username: "john", email: "john@example.com" };

    await fetchAPI("/api/auth/register", { method: "POST", body: payload });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(payload),
      }),
    );
  });

  test("does not include body key in the config when no body is provided", async () => {
    mockFetch({ success: true });

    await fetchAPI("/api/articles");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBeUndefined();
  });
});


// ════════════════════════════════════════════════════════════════════════════
//  Response handling
// ════════════════════════════════════════════════════════════════════════════
describe("fetchAPI — response handling", () => {

  test("returns the parsed JSON data on a successful 200 response", async () => {
    const responseData = { success: true, data: [{ id: "1", title: "Test Article" }] };
    mockFetch(responseData, 200);

    const result = await fetchAPI("/api/articles");

    expect(result).toEqual(responseData);
  });

  test("throws an error with the server message when response.ok is false (4xx/5xx)", async () => {
    mockFetch({ message: "User not found. Please register first." }, 401);

    await expect(fetchAPI("/api/users/me", { token: "bad-token" }))
      .rejects.toThrow("User not found. Please register first.");
  });

  test("throws a fallback error message when server returns no message", async () => {
    mockFetch({}, 500);

    await expect(fetchAPI("/api/articles"))
      .rejects.toThrow("API error:");
  });

  test("throws an error when fetch itself fails (network crash, no internet)", async () => {
    mockFetchError("Failed to fetch");

    await expect(fetchAPI("/api/articles"))
      .rejects.toThrow("Failed to fetch");
  });
});
