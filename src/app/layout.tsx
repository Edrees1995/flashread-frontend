import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const siteUrl = "https://flashread.app";
const siteName = "FlashRead";
const siteDescription = "Read faster, remember more. FlashRead is a speed reading tool with a built-in editor — write, organize, and speed-read your content all in one place.";

export const metadata: Metadata = {
  title: {
    default: `${siteName} — Speed Reading Tool`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ["speed reading", "flash reading", "read faster", "word reader", "reading tool", "speed reader app", "online editor", "document editor"],
  authors: [{ name: "FlashRead", url: siteUrl }],
  creator: "FlashRead",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Read Faster. Remember More.`,
    description: siteDescription,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Read Faster. Remember More.`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
