'use client';

import PublicNav from '../components/PublicNav';
import AuthForm from '../components/AuthForm';

export default function LoginContent() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      color: '#d4d4d4',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <PublicNav />
      <AuthForm mode="login" />
    </div>
  );
}
