import "../styles/globals.css";
import { SubscriptionProvider } from "./subscription/SubscriptionContext";

export const metadata = {
  title: "Easy Blogger",
  description: "A Medium-like blogging platform with AI writing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SubscriptionProvider>{children}</SubscriptionProvider>
      </body>
    </html>
  );
}
