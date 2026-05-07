// tests/api/payments.api.test.js

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

//  api.getActiveOffers

describe("api.getActiveOffers", () => {
  test("calls GET /api/payments/offers with the correct URL", async () => {
    mockFetch({ success: true, data: [] });

    await api.getActiveOffers();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/payments/offers`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: [] });

    await api.getActiveOffers();

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("does NOT require an Authorization token (public endpoint)", async () => {
    mockFetch({ success: true, data: [] });

    await api.getActiveOffers();

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBeUndefined();
  });

  test("returns the list of active pricing offers on success", async () => {
    const serverResponse = {
      success: true,
      data: [
        {
          id: "offer-monthly",
          name: "Monthly Premium",
          price: 9.99,
          interval: "month",
        },
        {
          id: "offer-yearly",
          name: "Yearly Premium",
          price: 79.99,
          interval: "year",
        },
      ],
    };
    mockFetch(serverResponse);

    const result = await api.getActiveOffers();

    expect(result).toEqual(serverResponse);
  });

  test("returns an empty list when no offers are active", async () => {
    mockFetch({ success: true, data: [] });

    const result = await api.getActiveOffers();

    expect(result.data).toEqual([]);
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getActiveOffers()).rejects.toThrow("Network error");
  });
});

//  api.createCheckoutSession

describe("api.createCheckoutSession", () => {
  test("calls POST /api/payments/create-checkout-session with the correct URL", async () => {
    mockFetch({
      success: true,
      data: { url: "https://checkout.stripe.com/pay/cs_test_001" },
    });

    await api.createCheckoutSession("offer-monthly", "user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/payments/create-checkout-session`,
      expect.any(Object),
    );
  });

  test("uses POST method", async () => {
    mockFetch({
      success: true,
      data: { url: "https://checkout.stripe.com/pay/cs_test_001" },
    });

    await api.createCheckoutSession("offer-monthly", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
  });

  test("sends the offerId in the request body", async () => {
    mockFetch({
      success: true,
      data: { url: "https://checkout.stripe.com/pay/cs_test_001" },
    });

    await api.createCheckoutSession("offer-monthly", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBe(JSON.stringify({ offerId: "offer-monthly" }));
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({
      success: true,
      data: { url: "https://checkout.stripe.com/pay/cs_test_001" },
    });

    await api.createCheckoutSession("offer-monthly", "user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns the Stripe checkout URL on success", async () => {
    const serverResponse = {
      success: true,
      data: { url: "https://checkout.stripe.com/pay/cs_test_001" },
    };
    mockFetch(serverResponse);

    const result = await api.createCheckoutSession(
      "offer-monthly",
      "user-token-abc",
    );

    expect(result).toEqual(serverResponse);
    expect(result.data.url).toContain("checkout.stripe.com");
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(
      api.createCheckoutSession("offer-monthly", "bad-token"),
    ).rejects.toThrow("Access denied. No token provided.");
  });

  test("throws when server returns 400 (invalid offer ID)", async () => {
    mockFetch({ message: "Invalid offer ID." }, 400);

    await expect(
      api.createCheckoutSession("offer-invalid", "user-token-abc"),
    ).rejects.toThrow("Invalid offer ID.");
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(
      api.createCheckoutSession("offer-monthly", "user-token-abc"),
    ).rejects.toThrow("Network error");
  });
});

//  api.getSubscriptionStatus

describe("api.getSubscriptionStatus", () => {
  test("calls GET /api/payments/subscription with the correct URL", async () => {
    mockFetch({ success: true, data: { isPremium: false } });

    await api.getSubscriptionStatus("user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/payments/subscription`,
      expect.any(Object),
    );
  });

  test("uses GET method", async () => {
    mockFetch({ success: true, data: { isPremium: false } });

    await api.getSubscriptionStatus("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("GET");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({ success: true, data: { isPremium: false } });

    await api.getSubscriptionStatus("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer user-token-abc");
  });

  test("returns isPremium: true for an active subscriber", async () => {
    const serverResponse = {
      success: true,
      data: { isPremium: true, plan: "monthly", renewsAt: "2025-06-01" },
    };
    mockFetch(serverResponse);

    const result = await api.getSubscriptionStatus("user-token-abc");

    expect(result.data.isPremium).toBe(true);
  });

  test("returns isPremium: false for a free tier user", async () => {
    const serverResponse = {
      success: true,
      data: { isPremium: false },
    };
    mockFetch(serverResponse);

    const result = await api.getSubscriptionStatus("user-token-abc");

    expect(result.data.isPremium).toBe(false);
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.getSubscriptionStatus("bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(api.getSubscriptionStatus("user-token-abc")).rejects.toThrow(
      "Network error",
    );
  });
});

//  api.createStripePortalSession

describe("api.createStripePortalSession", () => {
  test("calls POST /api/payments/portal with the correct URL", async () => {
    mockFetch({
      success: true,
      data: { url: "https://billing.stripe.com/session/portal_001" },
    });

    await api.createStripePortalSession("user-token-abc");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/payments/portal`,
      expect.any(Object),
    );
  });

  test("uses POST method", async () => {
    mockFetch({
      success: true,
      data: { url: "https://billing.stripe.com/session/portal_001" },
    });

    await api.createStripePortalSession("user-token-abc");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
  });

  test("sends the Firebase token in the Authorization header", async () => {
    mockFetch({
      success: true,
      data: { url: "https://billing.stripe.com/session/portal_001" },
    });

    await api.createStripePortalSession("portal-token-xyz");

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe("Bearer portal-token-xyz");
  });

  test("returns the Stripe billing portal URL on success", async () => {
    const serverResponse = {
      success: true,
      data: { url: "https://billing.stripe.com/session/portal_001" },
    };
    mockFetch(serverResponse);

    const result = await api.createStripePortalSession("user-token-abc");

    expect(result).toEqual(serverResponse);
    expect(result.data.url).toContain("billing.stripe.com");
  });

  test("throws when server returns 401 (unauthenticated)", async () => {
    mockFetch({ message: "Access denied. No token provided." }, 401);

    await expect(api.createStripePortalSession("bad-token")).rejects.toThrow(
      "Access denied. No token provided.",
    );
  });

  test("throws when server returns 403 (not a premium user)", async () => {
    mockFetch({ message: "No active subscription found." }, 403);

    await expect(
      api.createStripePortalSession("free-tier-token"),
    ).rejects.toThrow("No active subscription found.");
  });

  test("throws on network failure", async () => {
    mockFetchError("Network error");

    await expect(
      api.createStripePortalSession("user-token-abc"),
    ).rejects.toThrow("Network error");
  });
});
