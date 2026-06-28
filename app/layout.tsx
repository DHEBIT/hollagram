import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers";

export const metadata: Metadata = {
  title: "Hollagram",
  description: "Share your moments",
  icons: {
    icon: "/hollagram-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}