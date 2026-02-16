import "../styles/globals.css";

export const metadata = {
  title: "Easy Blogger",
  description: "A Medium-like blogging platform with AI writing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
