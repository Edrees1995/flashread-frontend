'use client';

import Link from 'next/link';
import PublicNav from './PublicNav';

export default function HomeContent() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      color: '#d4d4d4',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <PublicNav />

      {/* Hero */}
      <section style={{
        padding: '80px 32px 60px',
        textAlign: 'center',
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(0,122,204,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 16px',
          borderRadius: 20,
          border: '1px solid #1a3a5c',
          backgroundColor: 'rgba(0,122,204,0.08)',
          fontSize: 13,
          color: '#007acc',
          marginBottom: 32,
        }}>
          <span style={{ fontSize: 10 }}>⚡</span> Speed reading reimagined
        </div>
        <h1 style={{
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-2px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, #ffffff 0%, #858585 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Read Faster.<br />Remember More.
        </h1>
        <p style={{
          fontSize: 18,
          color: '#858585',
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          FlashRead helps you read at lightning speed with word-by-word progressive display.
          Write, organize, and speed-read your content — all in one beautiful editor.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={heroBtnPrimary}>
            Start Reading Free
          </Link>
          <button onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }} style={heroBtnSecondary}>
            See How It Works
          </button>
        </div>
      </section>

      {/* Preview mockup */}
      <section style={{
        padding: '0 32px 80px',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <div style={{
          borderRadius: 12,
          border: '1px solid #1a1a2e',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,122,204,0.1)',
        }}>
          <div style={{
            height: 36,
            backgroundColor: '#3c3c3c',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
            </div>
            <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#858585' }}>FlashRead</span>
          </div>
          <div style={{ display: 'flex', height: 300 }}>
            <div style={{ width: 200, backgroundColor: '#252526', borderRight: '1px solid #454545', padding: '12px 0' }}>
              <div style={{ padding: '4px 12px', fontSize: 11, color: '#858585', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Explorer</div>
              {['My Story.txt', 'Notes.txt', 'Research.txt'].map((f, i) => (
                <div key={f} style={{
                  padding: '4px 16px', fontSize: 13,
                  color: i === 0 ? '#fff' : '#d4d4d4',
                  backgroundColor: i === 0 ? '#094771' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 1h7l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" fill="#519aba" /></svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, backgroundColor: '#1e1e1e', padding: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#569cd6', marginBottom: 16, fontFamily: "'Consolas', monospace" }}>
                The Art of Reading
              </div>
              <div style={{ fontSize: 14, color: '#d4d4d4', lineHeight: 1.8, fontFamily: "'Consolas', monospace" }}>
                Reading is not just about consuming words on a page. It&apos;s about understanding ideas, connecting concepts, and building knowledge...
              </div>
              <div style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                backgroundColor: '#007acc',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
              }}>
                ▶ 120 WPM
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '80px 32px',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: 36,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 12,
          letterSpacing: '-1px',
        }}>
          Everything you need to read smarter
        </h2>
        <p style={{ textAlign: 'center', color: '#858585', fontSize: 16, marginBottom: 48 }}>
          Powerful features designed for focused reading
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280, 1fr))',
          gap: 24,
        }}>
          {[
            { icon: '⚡', title: 'Flash Reading', desc: 'Words appear one by one, building sentences progressively. Your brain processes faster without eye movement.' },
            { icon: '📝', title: 'Built-in Editor', desc: 'Write and organize content with headings, paragraphs, and sentences. VS Code-inspired dark interface.' },
            { icon: '📁', title: 'Smart Folders', desc: 'Organize documents in nested folders. Drag and drop, right-click menus — it just works.' },
            { icon: '🎯', title: 'Adjustable Speed', desc: 'Read from 30 to 600 words per minute. Find your perfect pace and push your limits.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'Your data is encrypted and belongs to you. AES-256 password encryption keeps your account safe.' },
            { icon: '📱', title: 'Fully Responsive', desc: 'Works beautifully on desktop and mobile. Read anywhere, anytime.' },
          ].map((f) => (
            <div key={f.title} style={{
              padding: 28,
              borderRadius: 12,
              border: '1px solid #1a1a2e',
              backgroundColor: 'rgba(20,20,30,0.5)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#858585', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 32px',
        textAlign: 'center',
        borderTop: '1px solid #1a1a2e',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: '-1px' }}>
          Ready to read faster?
        </h2>
        <p style={{ color: '#858585', fontSize: 16, marginBottom: 32 }}>
          Join FlashRead and unlock your reading potential.
        </p>
        <Link href="/register" style={heroBtnPrimary}>
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid #1a1a2e',
        textAlign: 'center',
        fontSize: 13,
        color: '#555',
      }}>
        &copy; {new Date().getFullYear()} FlashRead. All rights reserved. <a href="https://esb1995.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#007acc', textDecoration: 'none' }}>esb1995.com</a>
      </footer>
    </div>
  );
}

const heroBtnPrimary: React.CSSProperties = {
  backgroundColor: '#007acc',
  border: 'none',
  color: '#fff',
  padding: '14px 32px',
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
};

const heroBtnSecondary: React.CSSProperties = {
  background: 'none',
  border: '1px solid #333',
  color: '#d4d4d4',
  padding: '14px 32px',
  borderRadius: 10,
  fontSize: 16,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};
