import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your FlashRead account to continue speed reading and managing your documents.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Log In | FlashRead",
    description: "Log in to your FlashRead account to continue speed reading.",
    url: "/login",
  },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginContent />;
}
