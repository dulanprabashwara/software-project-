// easy-blogger\app\(main)\shares\layout.jsx
"use client";

import FeedLayout from "../../../components/article/FeedLayout";

export default function SharesLayout({ children }) {
  const tabs = [
    { name: "All shares", href: "/shares/all" },
    { name: "Linkedin", href: "/shares/linkedin" },
    { name: "Wordpress", href: "/shares/wordpress" },
  ];

  return (
    <FeedLayout title="Shares" tabs={tabs}>
      {children}
    </FeedLayout>
  );
}
