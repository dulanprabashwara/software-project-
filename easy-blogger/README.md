# Easy Blogger

A Medium-like blogging platform with an extra AI-assisted writing feature for premium users.

## Overview

- Framework: Next.js (App Router)
- Language: JavaScript/JSX
- Styling: Tailwind CSS
- Premium Features: AI article generation
- Note: This repository contains the project structure with core components and routing logic.

## Folder Structure

```
easy-blogger/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (main)/
│   │   ├── page.jsx          -> Home feed
│   │   ├── layout.jsx        -> Main layout wrapper
│   │   ├── admin/            -> Admin dashboard and management
│   │   ├── article/[slug]/   -> Read article
│   │   ├── ai-generate/      -> AI article generator (basic)
│   │   ├── ai-generate-pro/  -> AI article generator (premium)
│   │   ├── write/            -> Blog editor with sub-routes
│   │   │   ├── [articleId]/
│   │   │   ├── ai-restricted/
│   │   │   ├── choose-method/
│   │   │   ├── create/
│   │   │   ├── edit-as-new/
│   │   │   ├── preview/
│   │   │   ├── publish/
│   │   │   ├── start/
│   │   │   ├── unpublish/
│   │   │   └── unpublished/
│   │   ├── profile/[username]/ -> Public profile
│   │   ├── engagement/       -> User engagement/interactions
│   │   ├── following/        -> Following list
│   │   ├── library/          -> User's article library
│   │   ├── stats/            -> User statistics
│   │   └── stories/          -> Articles/stories management
│   ├── (settings)/
│   │   ├── account/          -> Account settings
│   │   ├── edit-profile/     -> Edit profile
│   │   └── subscription/
│   │       ├── pricing/      -> Pricing / upgrade
│   │       ├── checkout/     -> Payment details
│   │       └── billing/      -> Subscription management
│   ├── (auth)/               -> Auth routes
│   ├── layout.jsx            -> Root layout
│   └── page.jsx              -> Root page
├── components/
│   ├── layout/               -> App layout components (Header, Footer, Navbar, Sidebar)
│   ├── article/              -> Article UI components (ArticleCard, ArticleList)
│   ├── profile/              -> Profile UI components (ProfileHeader, FollowButton, StatsModal)
│   ├── auth/                 -> Auth form component
│   ├── editor/               -> Editor components (EditorBody, Header, Toolbar, etc.)
│   ├── admin/                -> Admin sidebar and components
│   ├── ai/                   -> AI writing UI panel (AIWriterPanel)
│   ├── subscription/         -> Subscription UI components (PricingCard)
│   └── ui/                   -> Base UI primitives (Button, Input, Modal)
├── hooks/
│   └── useModal.ts           -> Modal hook utilities
├── lib/
│   ├── auth.ts               -> Authentication utilities
│   ├── permissions.ts        -> Permission checking
│   ├── ai.ts                 -> AI integration
│   └── editor/
│       └── editorModes.js    -> Editor mode configurations
├── types/
│   ├── article.ts            -> Article type definitions
│   ├── subscription.ts       -> Subscription types
│   ├── user.ts               -> User types
│   └── article.js            -> Legacy article types
├── styles/
│   ├── globals.css           -> Global styles
│   └── ai article generator/ -> AI generator specific styles
├── public/
│   ├── icons/                -> Icon assets
│   └── images/
│       └── Ai article generator/ -> AI generator images
└── README.md
```

## Notes

- File structure includes production-ready component organization
- Both basic (`ai-generate/`) and premium (`ai-generate-pro/`) AI features are separated into different routes
- AI-related UI components are in `components/ai/` (AIWriterPanel)
- Admin functionality is organized in `app/(main)/admin/` and `components/admin/`
- Editor-related components are centralized in `components/editor/`
