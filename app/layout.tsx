import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";

export const metadata: Metadata = {
  title: "Hollagram",
  description: "Share your moments",
  icons: {
    icon: '/hollagram-logo.png',
    apple: '/hollagram-logo.png',
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