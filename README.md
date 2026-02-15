# Easy Blogger

A modern blogging platform built with Next.js, featuring AI-powered content generation, rich text editing, and a beautiful user interface.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Navigate to project directory
cd easy-blogger

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
│   │
│   ├── (main)/                   # Main application pages (requires auth)
│   │   ├── create/               # Create new article page
│   │   ├── engagement/           # User engagement stats page
│   │   ├── profile/              # User profile pages
│   │   │   ├── edit/             # Edit profile page
│   │   │   ├── user_stats/       # Current user's stats modal page
│   │   │   └── [username]/       # Other user's profile pages
│   │   │       └── stats/        # Other user's stats modal page
│   │   ├── stats/                # Global stats page
│   │   ├── stories/              # Stories feed page
│   │   └── layout.jsx            # Main layout with sidebar & header
│   │
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

- **Rich Text Editor**: Full-featured editor with formatting options
- **AI Writer**: AI-powered content generation assistance
- **Image Upload**: Support for article images
- **Draft System**: Save and resume article drafts

### 👤 User Profiles

- **Personal Profile**: View and edit your profile
- **Stats Modal**: View followers, following, reads, and shares
- **Other Users**: Browse other user profiles

### 🎨 User Interface

- **Modern Design**: Clean, professional interface with teal accent color
- **Responsive Layout**: Works on desktop and mobile devices
- **Dark Mode Ready**: Prepared for dark mode implementation
- **Smooth Animations**: Polished transitions and interactions

### 🔐 Authentication

- **Login/Signup**: User authentication system
- **Protected Routes**: Secure pages requiring authentication

### 💎 Subscription

- **Free Tier**: Basic blogging features
- **Premium Tier**: Advanced features and AI assistance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: JavaScript/JSX
- **Package Manager**: npm

## 📄 Page Routes

| Route                       | Description                  |
| --------------------------- | ---------------------------- |
| `/`                         | Landing page                 |
| `/home`                     | Home feed with articles      |
| `/login`                    | User login                   |
| `/signup`                   | User registration            |
| `/create`                   | Create new article           |
| `/profile`                  | Current user's profile       |
| `/profile/edit`             | Edit profile                 |
| `/profile/user_stats`       | Current user's stats (modal) |
| `/profile/[username]`       | View other user's profile    |
| `/profile/[username]/stats` | Other user's stats (modal)   |
| `/stories`                  | Stories feed                 |
| `/stats`                    | Global statistics            |
| `/engagement`               | User engagement page         |
| `/subscription/upgrade`     | Upgrade to premium           |

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

## 📧 Contact

For questions or support, please contact the development team.

---

**Easy Blogger** - Write, Share, Inspire ✨
