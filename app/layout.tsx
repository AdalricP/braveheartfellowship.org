import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Braveheart Fellowship",
  description:
    "Braveheart Fellowship backs founders & researchers willing to go against the world in pursuit of truth.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
