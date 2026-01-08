# Easy Blogger

A Medium-like blogging platform with an extra AI-assisted writing feature for premium users.

## Overview

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS (to be added later)
- UI: Will be built from provided Figma screenshots
- Note: This repository currently contains structure and placeholders only. No UI, logic, or styling has been implemented.

## Folder Structure

```
easy-blogger/
├── app/
│   ├── (auth)/
│   │   ├── login/            -> Login page
│   │   ├── signup/           -> Signup page
│   │   ├── forgot-password/  -> Forgot password page
│   │   └── verify-email/     -> Email verification page
│   ├── (main)/
│   │   ├── page.tsx          -> Home feed
│   │   ├── article/[slug]/   -> Read article
│   │   ├── write/            -> Blog editor (AI writing)
│   │   └── profile/[username]/ -> Public profile
│   └── (settings)/
│       ├── edit-profile/     -> Edit profile
│       ├── account/          -> Account settings
│       └── subscription/
│           ├── pricing/      -> Pricing / upgrade
│           ├── checkout/     -> Payment details
│           └── billing/      -> Subscription management
├── components/
│   ├── layout/               -> App layout components
│   ├── article/              -> Article UI components
│   ├── profile/              -> Profile UI components
│   ├── auth/                 -> Auth form component
│   ├── subscription/         -> Subscription UI components
│   ├── ai/                   -> AI writing UI panel
│   └── ui/                   -> Base UI primitives
├── lib/                      -> Helper modules (auth, permissions, ai)
├── hooks/                    -> Reusable React hooks
├── types/                    -> TypeScript types
├── styles/                   -> Global styles
└── README.md
```

## Notes

- All `.tsx` files export a placeholder component and return `null`.
- Files include short comments explaining their intended purpose.
- Actual UI, logic, and styling will be implemented later using Figma as the source of truth.
