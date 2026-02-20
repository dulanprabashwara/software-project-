# Easy Blogger

A modern blogging platform built with Next.js, featuring AI-powered content generation, rich text editing, and a beautiful user interface.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
easy-blogger/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages (login, signup)
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page
│   │       └── email/            # Signup with email page
│   │
│   ├── (main)/                   # Main application pages (requires auth)
│   │   ├── write/                # Article writing flow
│   │   │   ├── choose-method/    # Choose article creation method
│   │   │   ├── select-method/    # Select AI or manual writing
│   │   │   ├── create/           # Create new article (TinyMCE editor)
│   │   │   └── unpublish/        # Unpublish article confirmation
│   │   ├── engagement/           # User engagement stats page
│   │   ├── profile/              # User profile pages
│   │   │   ├── edit/             # Edit profile page
│   │   │   ├── user_stats/       # Current user's stats modal page
│   │   │   └── [username]/       # Other user's profile pages
│   │   │       └── stats/        # Other user's stats modal page
│   │   ├── stats/                # Global stats page
│   │   ├── stories/              # Stories feed page
│   │   ├── chat/                 # Messages/chat page
│   │   └── layout.jsx            # Main layout with sidebar & header
│   │
│   ├── ai-generate/              # AI content generation page
│   ├── home/                     # Home feed page
│   ├── subscription/             # Subscription & upgrade pages
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Landing page
│
├── components/                   # Reusable React components
│   ├── admin/                    # Admin-specific components
│   ├── ai/                       # AI writer panel components
│   ├── article/                  # Article card & related components
│   ├── auth/                     # Authentication form components
│   ├── editor/                   # Rich text editor components
│   │   ├── EditorToolbar.jsx     # Editor formatting toolbar
│   │   ├── FormatButton.jsx      # Individual format buttons
│   │   ├── ImageUpload.jsx       # Image upload handler
│   │   └── LinkDialog.jsx        # Link insertion dialog
│   ├── layout/                   # Layout components
│   │   ├── Header.jsx            # Top navigation header
│   │   ├── Sidebar.jsx           # Left sidebar navigation
│   │   └── MainLayout.jsx        # Main layout wrapper
│   ├── profile/                  # Profile-related components
│   ├── subscription/             # Subscription UI components
│   └── ui/                       # Generic UI components (buttons, modals)
│
├── hooks/                        # Custom React hooks
│   └── useEditor.js              # Editor state management hook
│
├── lib/                          # Utility libraries
│   ├── editor/                   # Editor utilities
│   ├── subscription/             # Subscription logic
│   └── utils.js                  # General utility functions
│
├── public/                       # Static assets
│   └── images/                   # Image files
│       └── easy-blogger-logo.png # Application logo
│
├── styles/                       # Global styles
│   └── globals.css               # Global CSS & Tailwind imports
│
├── types/                        # TypeScript type definitions
│
├── .gitignore                    # Git ignore rules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # This file
```

## 🎯 Key Features

### 📝 Article Creation

- **TinyMCE Rich Text Editor**: Full-featured WYSIWYG editor (no API key required)
- **AI Writer**: AI-powered content generation via `/ai-generate`
- **Image Upload**: Support for article images
- **Draft System**: Save and resume article drafts
- **Writing Flow**: Choose method → Select AI or manual → Create article

### 👤 User Profiles

- **Personal Profile**: View and edit your profile
- **Stats Modal**: View followers, following, reads, and shares
- **Other Users**: Browse other user profiles
- **Platform Integrations**: Connect LinkedIn and WordPress accounts

### 🎨 User Interface

- **Modern Design**: Clean, professional interface with teal accent color
- **Responsive Layout**: Works on desktop and mobile devices
- **Smooth Animations**: Polished fade-in-up transitions and interactions
- **Hidden Scrollbars**: Clean UI with scrollbars hidden globally
- **Active Nav Highlighting**: Sidebar and header items highlight based on current route

### 🔐 Authentication

- **Login/Signup**: User authentication system (login, signup with Google/Facebook/Email)
- **Protected Routes**: Secure pages requiring authentication
- **Landing Page Navigation**: Sign in → `/login`, Start reading / Write → `/signup`

### 💎 Subscription

- **Free Tier**: Basic blogging features
- **Premium Tier**: Advanced features, AI assistance, and premium badge

### 💬 Messaging

- **Chat Page**: Messages accessible via `/chat`
- **Active State**: Messages link in header dropdown highlights when on chat page

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript/JSX
- **Package Manager**: npm

## 📄 Page Routes

| Route                       | Description                    |
| --------------------------- | ------------------------------ |
| `/`                         | Landing page                   |
| `/home`                     | Home feed with articles        |
| `/login`                    | User login                     |
| `/signup`                   | User registration              |
| `/signup/email`             | Sign up with email form        |
| `/write/choose-method`      | Choose article creation method |
| `/write/select-method`      | Select AI or manual writing    |
| `/write/create`             | Create/edit article (TinyMCE)  |
| `/write/unpublish`          | Unpublish article confirmation |
| `/ai-generate`              | AI content generation          |
| `/chat`                     | Messages / chat                |
| `/profile`                  | Current user's profile         |
| `/profile/edit`             | Edit profile                   |
| `/profile/user_stats`       | Current user's stats (modal)   |
| `/profile/[username]`       | View other user's profile      |
| `/profile/[username]/stats` | Other user's stats (modal)     |
| `/stories`                  | Stories feed                   |
| `/stats`                    | Global statistics              |
| `/engagement`               | User engagement page           |
| `/subscription/upgrade`     | Upgrade to premium             |
| `/subscription/manage`      | Manage existing subscription   |

## 🎨 Design System

### Colors

- **Primary**: `#1ABC9C` (Teal) - Main brand color
- **Text**: `#111827` (Dark gray) - Primary text
- **Secondary Text**: `#6B7280` (Medium gray)
- **Background**: `#F9FAFB` (Light gray)
- **Borders**: `#E5E7EB` (Light gray)

### Typography

- **Headings**: Georgia (serif)
- **Body**: System fonts

## 📝 Development Notes

### Component Organization

- **Layout components** (`Header`, `Sidebar`) are in `components/layout/`
- **Feature components** (article, editor, profile) are organized by feature
- **Shared UI components** (buttons, modals) are in `components/ui/`

### Routing

- Uses Next.js App Router with route groups `(auth)` and `(main)`
- Protected routes are wrapped in `(main)` layout
- Public routes are in `(auth)` or root level

### State Management

- Local component state with React hooks
- Custom hooks for complex logic (e.g., `useEditor`)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

### Branch Strategy

| Branch      | Owner     | Purpose                       |
| ----------- | --------- | ----------------------------- |
| `main`      | Team      | Stable, production-ready code |
| `dulan`     | Dulan     | Dulan's feature branch        |
| `dulsi`     | Dulsi     | Dulsi's feature branch        |
| `amandi`    | Amandi    | Amandi's feature branch       |
| `Charithma` | Charithma | Charithma's feature branch    |
| `Kisal`     | Kisal     | Kisal's feature branch        |
| `backup`    | Team      | Backup of stable state        |
| `temp`      | Team      | Temporary/experimental work   |

To sync your branch with the latest from `main`:

```bash
git fetch origin
git merge origin/main
```

## 🔄 Recent Changes

### v1.1 - UI & Navigation Improvements

- **Landing Page**: Fixed Sign in → `/login`, Write → `/signup`, Start reading → `/signup`
- **Signup Page**: Email button now has consistent hover pop-up effect (converted from `<Link>` to `<button>`)
- **Header**: Refactored with new icons (`BadgeCheck`, `LogOut`, `PenSquare`, `Bell`, `Menu`)
- **Header**: Messages link in dropdown highlights bold + green when on `/chat` page
- **Profile Edit**: Added WordPress integration section (connect/disconnect with confirmation dialog)
- **Article Editor**: Migrated to TinyMCE (removed obsolete textarea-based formatting functions)
- **Write Flow**: Fixed AI route from `/write/ai-generate` → `/ai-generate`
- **Select Method Modal**: Displays `choose-method` page in background as overlay
- **Scrollbars**: Hidden globally via `globals.css` for a cleaner UI

## 📧 Contact

For questions or support, please contact the development team.

---

**Easy Blogger** - Write, Share, Inspire ✨
