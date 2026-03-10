'use client';

import { Document, ContentBlock } from '../types';

interface StatusBarProps {
  document: Document | null;
  blocks: ContentBlock[];
  isMobile?: boolean;
}

export default function StatusBar({ document, blocks, isMobile }: StatusBarProps) {
  const wordCount = blocks
    .map((b) => b.content || '')
    .join(' ')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  return (
    <div
      style={{
        height: 22,
        backgroundColor: '#007acc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: isMobile ? 11 : 12,
        color: '#ffffff',
        flexShrink: 0,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: isMobile ? 8 : 16, overflow: 'hidden', minWidth: 0 }}>
        {document ? (
          isMobile ? (
            <>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{document.title || 'Untitled'}</span>
              <span>{wordCount}w</span>
            </>
          ) : (
            <>
              <span>{document.title || 'Untitled'}</span>
              <span>{blocks.length} blocks</span>
              <span>{wordCount} words</span>
            </>
          )
        ) : (
          <span>{isMobile ? 'No doc' : 'No document selected'}</span>
        )}
      </div>
      {!isMobile && (
        <div style={{ display: 'flex', gap: 16 }}>
          <span>FlashRead</span>
        </div>
      )}
    </div>
  );
}
