// easy-blogger\app\(main)\stories\layout.jsx
"use client";

import FeedLayout from "../../../components/article/FeedLayout";

export default function Layout({ children }) {
  const tabs = [
    { name: "unpublished", href: "/write/unpublished" },
    { name: "published", href: "/stories/published" },
    { name: "scheduled", href: "/stories/scheduled" },
  ];

  return (
    <FeedLayout title="Stories" tabs={tabs}>
      {children}
    </FeedLayout>
  );
}
