import "../styles/globals.css";
import { SubscriptionProvider } from "./subscription/SubscriptionContext";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Easy Blogger",
  description: "A simple blogging platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SubscriptionProvider>{children}</SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
