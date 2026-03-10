'use client';

export function FolderIcon({ open, size = 16 }: { open?: boolean; size?: number }) {
  if (open) {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M1.5 3A1.5 1.5 0 013 1.5h3.1a1.5 1.5 0 011.2.6L8.5 4H13a1.5 1.5 0 011.5 1.5v.5H3.5L1.5 12V3z" fill="#dcb67a" />
        <path d="M2 7h11.5a1 1 0 01.97 1.24l-1.5 6A1 1 0 0112 15H2.5a1 1 0 01-.97-1.24l1.5-6A1 1 0 014 7z" fill="#e8a838" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1.5 3A1.5 1.5 0 013 1.5h3.1a1.5 1.5 0 011.2.6L8.5 4H13a1.5 1.5 0 011.5 1.5v8A1.5 1.5 0 0113 15H3a1.5 1.5 0 01-1.5-1.5V3z" fill="#dcb67a" />
    </svg>
  );
}

export function FileIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 1h7l4 4v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" fill="#519aba" />
      <path d="M10 1v4h4" fill="#3d8fb5" />
      <path d="M10 1l4 4h-3a1 1 0 01-1-1V1z" fill="#75bfef" />
      <rect x="4" y="7" width="6" height="1" rx="0.5" fill="rgba(255,255,255,0.4)" />
      <rect x="4" y="9.5" width="4.5" height="1" rx="0.5" fill="rgba(255,255,255,0.3)" />
      <rect x="4" y="12" width="5" height="1" rx="0.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function ChevronIcon({ open, size = 10 }: { open?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.15s ease',
      }}
    >
      <path d="M3 1.5l4 3.5-4 3.5" stroke="#858585" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
