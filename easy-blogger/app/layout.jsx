import "../styles/globals.css";
import { SubscriptionProvider } from "./(settings)/subscription/SubscriptionContext";

export const metadata = {
  title: "Easy Blogger",
  description: "A simple blogging platform",
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
