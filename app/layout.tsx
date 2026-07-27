import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";

const siteUrl = "https://hollagram.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hollagram — Share your moments",
    template: "%s | Hollagram",
  },
  description:
    "Hollagram is a social app for sharing photos and videos, connecting with friends, and discovering new moments through posts, stories, and messages.",
  keywords: [
    "Hollagram",
    "social media app",
    "photo sharing",
    "video sharing",
    "stories",
    "social network",
  ],
  applicationName: "Hollagram",
  authors: [{ name: "Hollagram" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Hollagram",
    title: "Hollagram — Share your moments",
    description:
      "A social app for sharing photos and videos, connecting with friends, and discovering new moments.",
    images: [
      {
        url: "/hollagram-logo.png",
        width: 1024,
        height: 1024,
        alt: "Hollagram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hollagram — Share your moments",
    description:
      "A social app for sharing photos and videos, connecting with friends, and discovering new moments.",
    images: ["/hollagram-logo.png"],
  },
  icons: {
    icon: "/hollagram-logo.png",
    apple: "/hollagram-logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {  
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/hollagram-logo.png" type="image/png" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}