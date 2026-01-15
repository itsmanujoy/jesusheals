import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verse Order - Bible Puzzle Game",
  description: "A Bible verse puzzle game for church events",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 via-white to-amber-50 text-gray-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

