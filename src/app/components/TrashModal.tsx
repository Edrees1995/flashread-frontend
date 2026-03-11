'use client';

import { useState, useEffect } from 'react';
import { Document } from '../types';
import { fetchTrashedDocuments, restoreDocument, deleteDocumentPermanently } from '../api';

interface TrashModalProps {
  onClose: () => void;
  onRestored: () => void;
  isMobile?: boolean;
}

export default function TrashModal({ onClose, onRestored, isMobile }: TrashModalProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchTrashedDocuments();
      setDocs(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (id: number) => {
    await restoreDocument(id);
    await load();
    onRestored();
  };

  const handleDeletePermanently = async (id: number) => {
    await deleteDocumentPermanently(id);
    await load();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: isMobile ? 'var(--bg-sidebar)' : 'var(--bg-overlay)',
        display: 'flex',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: isMobile ? 'stretch' : 'center',
        zIndex: 3000,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={isMobile ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          border: isMobile ? 'none' : '1px solid var(--border)',
          borderRadius: isMobile ? 0 : 8,
          width: isMobile ? '100%' : 500,
          height: isMobile ? '100%' : undefined,
          maxHeight: isMobile ? '100%' : '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMobile ? 'none' : '0 8px 32px var(--shadow)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? '12px 16px' : '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: isMobile ? 44 : undefined,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🗑</span>
            <span style={{ fontSize: isMobile ? 16 : 14, fontWeight: 600, color: 'var(--text)' }}>Trash</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({docs.length})</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: isMobile ? 20 : 16,
              cursor: 'pointer',
              padding: isMobile ? '8px' : '0 4px',
              minWidth: isMobile ? 44 : undefined,
              minHeight: isMobile ? 44 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading...
            </div>
          )}
          {!loading && docs.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: isMobile ? 15 : 13 }}>
              Trash is empty
            </div>
          )}
          {docs.map((doc) => (
            <div
              key={doc.id}
              style={{
                padding: isMobile ? '12px 16px' : '8px 20px',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-light)',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 10 : 0,
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden', width: isMobile ? '100%' : undefined }}>
                <div style={{ fontSize: isMobile ? 15 : 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.title || 'Untitled'}
                </div>
                <div style={{ fontSize: isMobile ? 12 : 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(doc.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: isMobile ? 10 : 6, flexShrink: 0, marginLeft: isMobile ? 0 : 12, width: isMobile ? '100%' : undefined }}>
                <button
                  onClick={() => handleRestore(doc.id)}
                  style={{
                    backgroundColor: 'var(--accent)',
                    border: 'none',
                    color: 'var(--accent-fg)',
                    fontSize: isMobile ? 14 : 12,
                    padding: isMobile ? '10px 16px' : '4px 12px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    minHeight: isMobile ? 44 : undefined,
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => handleDeletePermanently(doc.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--error)',
                    color: 'var(--error)',
                    fontSize: isMobile ? 14 : 12,
                    padding: isMobile ? '10px 16px' : '4px 12px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    minHeight: isMobile ? 44 : undefined,
                    flex: isMobile ? 1 : undefined,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error)'; e.currentTarget.style.color = 'var(--accent-fg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--error)'; }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
