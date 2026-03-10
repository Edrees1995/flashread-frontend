import type { Metadata } from "next";
import HomeContent from "./components/HomeContent";

export const metadata: Metadata = {
  title: "FlashRead — Speed Reading Tool | Read Faster, Remember More",
  description:
    "FlashRead helps you read at lightning speed with word-by-word progressive display. Write, organize, and speed-read your content in a beautiful VS Code-inspired editor.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FlashRead — Read Faster. Remember More.",
    description:
      "Speed reading reimagined. Write, organize, and read your content at up to 600 words per minute.",
    url: "/",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
