// tests/mocks/fetch.mock.js
// ─────────────────────────────────────────────────────────────────────────────
// A fake global `fetch` for unit tests.
// lib/api.js calls the native browser fetch(). In Node/Jest, fetch doesn't
// exist so we replace it with a jest.fn() that we can control per-test.
//
// Usage in test files:
//   const { mockFetch, mockFetchError } = require("../mocks/fetch.mock");
//
//   mockFetch({ message: "ok", data: [...] }, 200);  // simulate a 200 OK
//   mockFetchError("Network failure");                // simulate a crash
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replaces global.fetch with a jest.fn() that resolves with a fake Response.
 * @param {object} body     – The JSON payload the fake server returns
 * @param {number} status   – HTTP status code (default 200)
 */
function mockFetch(body = {}, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: jest.fn().mockResolvedValue(body),
  });
}

/**
 * Makes global.fetch throw a network-level error (e.g., no internet).
 * @param {string} message – The error message
 */
function mockFetchError(message = "Network error") {
  global.fetch = jest.fn().mockRejectedValue(new Error(message));
}

/**
 * Resets the fetch mock to a clean state.
 */
function resetFetch() {
  global.fetch = undefined;
}

module.exports = { mockFetch, mockFetchError, resetFetch };
