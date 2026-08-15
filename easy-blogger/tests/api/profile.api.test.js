// tests/api/profile.api.test.js

const fs = require("fs");
const path = require("path");
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

// api.updateProfile
describe("api.updateProfile", () => {
  const PROFILE_UPDATE_DATA = {
    displayName: "Updated Name",
    bio: "Updated bio text",
  };

  test("calls PUT /api/users/profile with the correct URL", async () => {
    mockFetch({ success: true, data: {} });

    await api.updateProfile(PROFILE_UPDATE_DATA, "user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/profile`,
      expect.any(Object),
    );
  });

  test("production API keeps user and admin profile routes separate", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../lib/api.js"),
      "utf8",
    );
    const updateProfileStart = source.indexOf("updateProfile:");
    const updateAdminProfileStart = source.indexOf(
      "updateAdminProfile:",
      updateProfileStart,
    );
    const getUserProfileStart = source.indexOf(
      "getUserProfile:",
      updateAdminProfileStart,
    );

    const userProfileBlock = source.slice(
      updateProfileStart,
      updateAdminProfileStart,
    );
    const adminProfileBlock = source.slice(
      updateAdminProfileStart,
      getUserProfileStart,
    );

    expect(updateProfileStart).toBeGreaterThan(-1);
    expect(updateAdminProfileStart).toBeGreaterThan(updateProfileStart);
    expect(getUserProfileStart).toBeGreaterThan(updateAdminProfileStart);
    expect(userProfileBlock).toContain('fetchAPI("/api/users/profile"');
    expect(userProfileBlock).not.toContain("/api/admin/profile");
    expect(adminProfileBlock).toContain('fetchAPI("/api/admin/profile"');
  });
  test("uses PUT method", async () => {
    mockFetch({ success: true, data: {} });

    await api.updateProfile(PROFILE_UPDATE_DATA, "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("PUT");
  });

  test("sends the profile data as a JSON body", async () => {
    mockFetch({ success: true, data: {} });

    await api.updateProfile(PROFILE_UPDATE_DATA, "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify(PROFILE_UPDATE_DATA));
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: {} });

    await api.updateProfile(PROFILE_UPDATE_DATA, "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns the updated profile data on success", async () => {
    const serverResponse = {
      success: true,
      data: { displayName: "Updated Name", bio: "Updated bio text" },
    };
    mockFetch(serverResponse, 200);

    const result = await api.updateProfile(
      PROFILE_UPDATE_DATA,
      "user-token-abc",
    );

    expect(result).toEqual(serverResponse);
  });

  test("throws when server returns 401 (no token)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(
      api.updateProfile(PROFILE_UPDATE_DATA, "bad-token"),
    ).rejects.toThrow("Access denied. No token provided.");
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(
      api.updateProfile(PROFILE_UPDATE_DATA, "user-token-abc"),
    ).rejects.toThrow("Network error");
  });
});

describe("profile result modals", () => {
  test("profile updates display success and failure results", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../app/(main)/profile/edit/page.jsx"),
      "utf8",
    );

    expect(source).toContain("profileUpdateResult");
    expect(source).toContain("Profile Updated");
    expect(source).toContain("Update Failed");
    expect(source).toContain("Your profile details were updated successfully.");
  });

  test("bio deletion runs immediately and displays its result", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../app/(main)/profile/page.jsx"),
      "utf8",
    );

    expect(source).toContain("bioDeleteResult");
    expect(source).toContain("Bio Deleted");
    expect(source).toContain("Delete Failed");
    expect(source).toContain('isDeletingBio ? "Deleting..." : "Delete"');
    expect(source).not.toContain(
      'confirm("Are you sure you want to delete your bio?")',
    );
  });
});

// api.getUserProfile
describe("api.getUserProfile", () => {
  test("calls GET /api/users/:identifier with the correct URL", async () => {
    mockFetch({ success: true, data: {} });

    await api.getUserProfile("john_doe");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/john_doe`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: {} });

    await api.getUserProfile("john_doe");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("returns the user profile data on success", async () => {
    const profileData = {
      success: true,
      data: { id: "user-001", username: "john_doe", displayName: "John Doe" },
    };
    mockFetch(profileData);

    const result = await api.getUserProfile("john_doe");

    expect(result).toEqual(profileData);
  });

  test("throws when server returns 404 (user not found)", async () => {
    mockFetch({ message: "User not found." }, 404);

    await expect(api.getUserProfile("nonexistent_user")).rejects.toThrow(
      "User not found.",
    );
  });
});

// api.deleteAccount
describe("api.deleteAccount", () => {
  test("calls DELETE /api/users/me with the correct URL", async () => {
    mockFetch({ success: true });

    await api.deleteAccount("user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/me`,
      expect.any(Object),
    );
  });

  test("uses DELETE method", async () => {
    mockFetch({ success: true });

    await api.deleteAccount("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("DELETE");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true });

    await api.deleteAccount("delete-token-xyz");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer delete-token-xyz");
  });

  test("throws when server returns 401 (unauthorized)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.deleteAccount("bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.deleteAccount("user-token-abc")).rejects.toThrow(
      "Network error",
    );
  });
});

// api.toggleFollow
describe("api.toggleFollow", () => {
  test("calls POST /api/users/:userId/follow with the correct URL", async () => {
    mockFetch({ success: true, data: { following: true } });

    await api.toggleFollow("user-999", "user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-999/follow`,
      expect.any(Object),
    );
  });

  test("uses POST method", async () => {
    mockFetch({ success: true, data: {} });

    await api.toggleFollow("user-999", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: {} });

    await api.toggleFollow("user-999", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns follow status on success", async () => {
    const serverResponse = { success: true, data: { following: true } };
    mockFetch(serverResponse);

    const result = await api.toggleFollow("user-999", "user-token-abc");

    expect(result).toEqual(serverResponse);
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.toggleFollow("user-999", "bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws when trying to follow yourself (400)", async () => {
    mockFetch({ message: "You cannot follow yourself." }, 400);

    await expect(
      api.toggleFollow("own-user-id", "user-token-abc"),
    ).rejects.toThrow("You cannot follow yourself.");
  });
});

// api.getFollowers / api.getFollowing
describe("api.getFollowers", () => {
  test("calls GET /api/users/:userId/followers with the correct URL", async () => {
    mockFetch({ success: true, data: [] });

    await api.getFollowers("user-001");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-001/followers`,
      expect.any(Object),
    );
  });

  test("returns a list of followers on success", async () => {
    const serverResponse = {
      success: true,
      data: [{ id: "follower-001", username: "alice" }],
    };
    mockFetch(serverResponse);

    const result = await api.getFollowers("user-001");

    expect(result).toEqual(serverResponse);
  });

  test("throws when server returns 404 (user not found)", async () => {
    mockFetch({ message: "User not found." }, 404);

    await expect(api.getFollowers("nonexistent-user")).rejects.toThrow(
      "User not found.",
    );
  });
});

describe("api.getFollowing", () => {
  test("calls GET /api/users/:userId/following with the correct URL", async () => {
    mockFetch({ success: true, data: [] });

    await api.getFollowing("user-001");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/users/user-001/following`,
      expect.any(Object),
    );
  });

  test("returns a list of users being followed on success", async () => {
    const serverResponse = {
      success: true,
      data: [{ id: "user-002", username: "bob" }],
    };
    mockFetch(serverResponse);

    const result = await api.getFollowing("user-001");

    expect(result).toEqual(serverResponse);
  });
});
