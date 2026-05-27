import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://braveheartfellowship.org";
const title = "Braveheart Fellowship";
const description =
  "Braveheart Fellowship backs young founders and researchers willing to go against the world in pursuit of truth.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: title,
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/assets/icon.png",
    shortcut: "/assets/icon.png",
    apple: "/assets/icon.png",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: title,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Braveheart Fellowship social preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: "/twitter-image",
        alt: "Braveheart Fellowship social preview",
      },
    ],
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
