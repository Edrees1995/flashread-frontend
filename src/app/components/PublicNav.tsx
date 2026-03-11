'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PublicNav() {
  return (
    <nav style={{
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1a1a2e',
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/favicon.png" alt="FlashRead" width={28} height={28} />
        <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: '#d4d4d4' }}>
          Flash<span style={{ color: '#007acc' }}>Read</span>
        </span>
      </Link>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/about" style={navBtn}>About</Link>
        <Link href="/login" style={navBtn}>Log In</Link>
        <Link href="/register" style={navBtnPrimary}>Get Started</Link>
      </div>
    </nav>
  );
}

const navBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid #333',
  color: '#d4d4d4',
  padding: '8px 18px',
  borderRadius: 8,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};

const navBtnPrimary: React.CSSProperties = {
  backgroundColor: '#007acc',
  border: 'none',
  color: '#fff',
  padding: '8px 18px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};
