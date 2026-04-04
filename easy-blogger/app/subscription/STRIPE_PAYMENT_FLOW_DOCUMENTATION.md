# Stripe Payment & Subscription Flow Documentation

This document explains exactly how the Easy Blogger Stripe Payment System works from end-to-end. It serves as a guide for developers and administrators to understand the flow of data between the frontend, the backend, the database, and Stripe's servers.

---

## 1. Core Architecture & Database Models

The foundation of the payment system revolves around three interconnected database tables (Prisma Models):

1. **`User`**: Contains an `isPremium` boolean flag which dictates access across the entire app. It also stores a `stripeCustomerId` so we can identify them in Stripe for future billing portals.
2. **`Offer`**: Represents a specific pricing plan or discount (e.g., "50% Off Summer Sale"). It stores metadata like `name` and `discount_percent` for the UI, but crucially stores the `stripe_coupon_id` to link the database offer to the actual financial logic on Stripe.
3. **`Subscription`**: The historical ledger linking a `User`, an `Offer`, and a `stripeSubscriptionId`. It tracks when the subscription expires and its current status (`active`, `canceled`, `past_due`).

> [!NOTE]
> **Database Structure Clarification (Prisma ORM):**
> In the actual PostgreSQL database, only the `Subscription` table has the `offerId` foreign key column to establish the link. The `Offer` table does not have a real column pointing to Subscriptions. However, in our `schema.prisma` file, you will see `subscriptions Subscription[]` inside the `Offer` model. This is a **virtual relationship** required by Prisma to easily execute reverse-lookups in the backend (e.g., asking the database "which subscriptions used this specific offer?"), but it does not alter the physical database schema.

---

## 2. Administrator Workflow: Creating a New Offer

Because Stripe is authoritative over all financial math and checkout security, offers cannot just be invented locally. They must synchronize with Stripe.

**How to create a new Offer:**

1. The Admin logs into the **Stripe Dashboard** and creates a Coupon (e.g., giving 50% off). Stripe generates a unique coupon ID (e.g., `EARLY50`).
2. The Admin logs into the **Easy Blogger Admin Panel** and creates a new Offer in the local database.
3. They input the display details (Name, Features, Discount %) and attach the `EARLY50` Stripe Coupon ID into the `stripe_coupon_id` database field.
4. If `is_active` is checked, this offer instantly becomes available on the Frontend.

---

## 3. Frontend Workflow: User Checkout

1. **Viewing Offers**: When a standard user navigates to `/subscription/upgrade-to-premium`, the frontend calls `GET /api/payments/offers`. It displays all active offers fetched from the database.
2. **Initiating Checkout**: The user selects an Offer and clicks "Proceed to Checkout". The frontend sends a `POST /api/payments/create-checkout-session` request to the backend, including the local `offerId`.

---

## 4. Backend Workflow: Talking to Stripe

When the backend receives the checkout request, `payment.service.js` kicks in:

1. **Sync check**: It queries Stripe to ensure the user doesn't already have an active subscription (preventing duplicate billing).
2. **Applying the Discount**: It looks up the `offerId` in the database, extracts the attached `stripe_coupon_id`, and instructs Stripe to apply that specific coupon to the checkout.
3. **The Metadata Tracker**: The backend attaches the local `offerId` tightly to the `metadata` of the Stripe Session. _This is crucial for Step 5._
4. **Redirection**: Stripe generates a secure, hosted checkout URL. The backend sends this URL back to the frontend, which redirects the user's browser to Stripe's payment page.

---

## 5. Webhooks: The Asynchronous Confirmation

When the user enters their credit card and clicks pay, Stripe charges them. But how does the Easy Blogger backend know they paid? **Webhooks.**

Running locally, `stripe listen` forwards these webhooks. In production, Stripe hits the `/api/payments/webhook` endpoint automatically.

**The `checkout.session.completed` Event:**

1. Stripe essentially calls the backend and says _"This checkout session finished successfully!"_.
2. The backend opens the webhook payload and extracts the `metadata.offerId` it secretly planted there in Step 4.
3. The backend safely checks the expiration/renewal date from Stripe.
4. **The Upgrade**: The backend pushes a new row to the `Subscription` table linking the user to the offer, and updates the `User` table to set `isPremium: true`.

---

## 6. The Stripe Customer Portal & Cancellations

Rather than building a complex billing UI from scratch, Easy Blogger offloads subscription management entirely to Stripe's Customer Portal.

- **Accessing the Portal**: When a premium user clicks "Manage Membership", they trigger `POST /api/stripe/create-portal-session`. The backend generates a secure portal link and redirects them to Stripe natively.
- **Cancellations**: By default, Stripe cancels subscriptions at the end of the billing period. However, we have implemented a special programmatic bypass for testing (`customer.subscription.updated` event). If the backend detects a user clicked cancel in the portal, the backend intercepts this and forces an **immediate deletion**.
- **The Downgrade**: Once completely deleted, Stripe fires the `customer.subscription.deleted` webhook. The backend catches this, marks the database `Subscription` row as "canceled", and immediately flips `isPremium` back to `false`.
