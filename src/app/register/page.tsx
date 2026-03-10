import type { Metadata } from "next";
import RegisterContent from "./RegisterContent";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Sign up for FlashRead — the free speed reading tool. Create your account and start reading faster today.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: "Create Account | FlashRead",
    description: "Sign up for FlashRead and start speed reading for free.",
    url: "/register",
  },
  robots: { index: true, follow: true },
};

export default function RegisterPage() {
  return <RegisterContent />;
}
