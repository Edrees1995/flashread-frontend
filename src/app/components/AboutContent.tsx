'use client';

import Link from 'next/link';
import Image from 'next/image';
import PublicNav from './PublicNav';

export default function AboutContent() {
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
          background: 'radial-gradient(circle, rgba(0,122,204,0.08) 0%, transparent 70%)',
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
          About FlashRead
        </div>
        <h1 style={{
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-2px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, #ffffff 0%, #858585 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Read smarter,<br />not harder.
        </h1>
        <p style={{
          fontSize: 18,
          color: '#858585',
          lineHeight: 1.7,
          maxWidth: 600,
          margin: '0 auto',
        }}>
          FlashRead is a speed reading tool with a built-in document editor.
          Write, organize, and speed-read your content — all in one place.
        </p>
      </section>

      {/* What is FlashRead */}
      <section style={{
        padding: '60px 32px',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <h2 style={sectionTitle}>What is FlashRead?</h2>
        <p style={bodyText}>
          FlashRead combines a powerful document editor with a speed reading engine.
          Instead of scanning lines of text, words are displayed progressively — one at a time —
          training your brain to process information faster without losing comprehension.
        </p>
        <p style={bodyText}>
          Built with a VS Code-inspired interface, FlashRead feels familiar to developers and
          writers alike. Organize your documents in folders, format with rich text, and when
          you&apos;re ready, switch to FlashRead mode to absorb content at speeds up to 600 words per minute.
        </p>
      </section>

      {/* How it works */}
      <section style={{
        padding: '60px 32px',
        maxWidth: 900,
        margin: '0 auto',
        borderTop: '1px solid #1a1a2e',
      }}>
        <h2 style={{ ...sectionTitle, textAlign: 'center' }}>How it works</h2>
        <p style={{ ...bodyText, textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
          Three simple steps to start reading faster.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 32,
        }}>
          {[
            {
              step: '01',
              title: 'Write or paste',
              desc: 'Create a document and add your content. Use headings, paragraphs, and rich text formatting to structure your writing.',
            },
            {
              step: '02',
              title: 'Set your speed',
              desc: 'Choose a reading speed from 30 to 600 WPM. Start slow and work your way up as your brain adapts.',
            },
            {
              step: '03',
              title: 'Start reading',
              desc: 'Hit play and watch words appear progressively. Your eyes stay fixed while your mind absorbs every word.',
            },
          ].map((item) => (
            <div key={item.step} style={{
              padding: 28,
              borderRadius: 12,
              border: '1px solid #1a1a2e',
              backgroundColor: 'rgba(20,20,30,0.5)',
            }}>
              <div style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#007acc',
                marginBottom: 12,
                fontFamily: "'Consolas', monospace",
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#d4d4d4' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14, color: '#858585', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features highlight */}
      <section style={{
        padding: '60px 32px',
        maxWidth: 800,
        margin: '0 auto',
        borderTop: '1px solid #1a1a2e',
      }}>
        <h2 style={{ ...sectionTitle, textAlign: 'center' }}>Built for focus</h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          marginTop: 40,
        }}>
          {[
            {
              icon: '⚡',
              title: 'Flash Reading Engine',
              desc: 'Words appear one by one, building sentences progressively. Pause longer at sentence endings for natural comprehension.',
            },
            {
              icon: '📝',
              title: 'Rich Text Editor',
              desc: 'Bold, italic, underline, strikethrough, and inline code. Choose from 16 fonts and adjust sizes for headings, paragraphs, and more.',
            },
            {
              icon: '📁',
              title: 'Smart Organization',
              desc: 'Nested folders, drag-and-drop, right-click context menus. Manage hundreds of documents effortlessly.',
            },
            {
              icon: '🎨',
              title: '10 Beautiful Themes',
              desc: 'Dark, Light, Monokai, Dracula, Nord, GitHub Dark, Solarized, High Contrast, and more. Pick the look that suits you.',
            },
            {
              icon: '📖',
              title: 'Read Mode',
              desc: 'A clean, distraction-free reading view for your documents. No toolbars, no sidebars — just your content.',
            },
            {
              icon: '📱',
              title: 'Fully Responsive',
              desc: 'Works beautifully on desktop and mobile. Read and write from anywhere.',
            },
          ].map((f) => (
            <div key={f.title} style={{
              display: 'flex',
              gap: 20,
              padding: '20px 24px',
              borderRadius: 12,
              border: '1px solid #1a1a2e',
              backgroundColor: 'rgba(20,20,30,0.3)',
              alignItems: 'flex-start',
            }}>
              <div style={{
                fontSize: 28,
                flexShrink: 0,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                backgroundColor: 'rgba(0,122,204,0.08)',
                border: '1px solid #1a3a5c',
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#d4d4d4' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: '#858585', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section style={{
        padding: '60px 32px',
        maxWidth: 800,
        margin: '0 auto',
        borderTop: '1px solid #1a1a2e',
      }}>
        <h2 style={{ ...sectionTitle, textAlign: 'center' }}>Built with modern tech</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginTop: 32,
        }}>
          {['Next.js', 'React', 'TypeScript', 'NestJS', 'MySQL', 'JWT'].map((tech) => (
            <span key={tech} style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid #1a1a2e',
              backgroundColor: 'rgba(20,20,30,0.5)',
              fontSize: 14,
              color: '#858585',
              fontFamily: "'Consolas', monospace",
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 32px',
        textAlign: 'center',
        borderTop: '1px solid #1a1a2e',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, letterSpacing: '-1px', color: '#d4d4d4' }}>
          Ready to read faster?
        </h2>
        <p style={{ color: '#858585', fontSize: 16, marginBottom: 32 }}>
          Create a free account and start speed reading today.
        </p>
        <Link href="/register" style={heroBtnPrimary}>
          Get Started Free
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
        &copy; {new Date().getFullYear()} FlashRead. All rights reserved.{' '}
        <a href="https://esb1995.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#007acc', textDecoration: 'none' }}>
          esb1995.com
        </a>
      </footer>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  letterSpacing: '-1px',
  marginBottom: 20,
  color: '#d4d4d4',
};

const bodyText: React.CSSProperties = {
  fontSize: 16,
  color: '#858585',
  lineHeight: 1.8,
  marginBottom: 16,
};

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
