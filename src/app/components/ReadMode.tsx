'use client';

import { ContentBlock } from '../types';

interface ReadModeProps {
  title: string;
  blocks: ContentBlock[];
  onClose: () => void;
  isMobile?: boolean;
}

export default function ReadMode({ title, blocks, onClose, isMobile }: ReadModeProps) {
  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      {/* Top bar with close */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: isMobile ? '8px 16px' : '12px 32px',
          flexShrink: 0,
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: isMobile ? 44 : 32,
            height: isMobile ? 44 : 32,
            borderRadius: 4,
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="Close Read Mode"
        >
          ✕
        </button>
      </div>

      {/* Scrollable content — full width, left aligned */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: isMobile ? '32px 24px 60px' : '48px 64px 80px',
          }}
        >
          {/* Document title */}
          <h1
            style={{
              fontSize: isMobile ? 26 : 32,
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.3,
              marginBottom: isMobile ? 24 : 32,
            }}
          >
            {title}
          </h1>

          {/* Content blocks */}
          {sorted.map((block) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={block.id}
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1.4,
                    marginTop: isMobile ? 24 : 32,
                    marginBottom: isMobile ? 10 : 14,
                  }}
                  dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
              );
            }

            return (
              <p
                key={block.id}
                style={{
                  fontSize: isMobile ? 16 : 18,
                  lineHeight: 1.8,
                  color: 'var(--text)',
                  marginBottom: isMobile ? 14 : 18,
                }}
                dangerouslySetInnerHTML={{ __html: block.content || '' }}
              />
            );
          })}

          {sorted.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              No content to display.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
