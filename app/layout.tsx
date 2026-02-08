import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Striver SDE Sheet — Question Tracker",
  description: "A polished interactive question sheet manager for DSA preparation",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
