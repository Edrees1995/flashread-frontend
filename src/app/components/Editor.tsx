'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, ContentBlock, Folder, EditorPreferences } from '../types';
import { updateDocument, updateBlock, createBlock, deleteBlock } from '../api';
import { FileIcon, FolderIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PREFS: EditorPreferences = {
  defaultFont: "'Consolas', 'Courier New', monospace",
  headingSize: 18,
  paragraphSize: 14,
  sentenceSize: 14,
};

interface EditorProps {
  document: Document | null;
  folders: Folder[];
  onDocumentUpdated: () => void;
  onStartReader: (wpm: number) => void;
  onCloseDoc: () => void;
  onRenameDoc: (id: number, title: string) => void;
  onMoveDoc: (docId: number, folderId: number | null) => void;
  onDeleteDoc: (id: number) => void;
  isMobile?: boolean;
}

function getSavedWpm(): number {
  try {
    const raw = localStorage.getItem('word-reader-wpm');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expiry > Date.now()) return parsed.value;
      localStorage.removeItem('word-reader-wpm');
    }
  } catch {}
  return 60;
}

function saveWpm(value: number) {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  localStorage.setItem('word-reader-wpm', JSON.stringify({ value, expiry }));
}

export default function Editor({ document, folders, onDocumentUpdated, onStartReader, onCloseDoc, onRenameDoc, onMoveDoc, onDeleteDoc, isMobile }: EditorProps) {
  const { user } = useAuth();
  const prefs: EditorPreferences = { ...DEFAULT_PREFS, ...(user?.preferences as Partial<EditorPreferences> || {}) };
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [speed, setSpeed] = useState(60);
  const [tabContextMenu, setTabContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [editingTabTitle, setEditingTabTitle] = useState(false);
  const [editingTabName, setEditingTabName] = useState('');

  useEffect(() => {
    setSpeed(getSavedWpm());
  }, []);

  useEffect(() => {
    const close = () => setTabContextMenu(null);
    if (tabContextMenu) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [tabContextMenu]);

  const handleSpeedChange = (val: number) => {
    const clamped = Math.max(30, Math.min(600, val));
    setSpeed(clamped);
    saveWpm(clamped);
  };
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockTimerRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setBlocks(document.blocks?.sort((a, b) => a.order_index - b.order_index) || []);
    } else {
      setTitle('');
      setBlocks([]);
    }
  }, [document]);

  const debounceSaveTitle = useCallback(
    (newTitle: string) => {
      if (!document) return;
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      titleTimerRef.current = setTimeout(async () => {
        await updateDocument(document.id, { title: newTitle });
        onDocumentUpdated();
      }, 1000);
    },
    [document, onDocumentUpdated]
  );

  const debounceSaveBlock = useCallback(
    (blockId: number, content: string) => {
      const existing = blockTimerRefs.current.get(blockId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        await updateBlock(blockId, { content });
      }, 1000);
      blockTimerRefs.current.set(blockId, timer);
    },
    []
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debounceSaveTitle(value);
  };

  const handleBlockContentChange = (blockId: number, content: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b))
    );
    debounceSaveBlock(blockId, content);
  };

  const handleAddBlock = async (type: 'heading' | 'paragraph' | 'sentence') => {
    if (!document) return;
    const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.order_index)) : -1;
    const newBlock = await createBlock({
      document_id: document.id,
      type,
      content: '',
      order_index: maxOrder + 1,
    });
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleDeleteBlock = async (blockId: number) => {
    await deleteBlock(blockId);
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  if (!document) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: 'var(--text-muted)',
          fontSize: isMobile ? 16 : 14,
          flexDirection: 'column',
          gap: 8,
          padding: isMobile ? '24px 16px' : 0,
          textAlign: 'center',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M12 8h18l8 8v24a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="var(--border)" strokeWidth="2" />
          <path d="M30 8v8h8" stroke="var(--border)" strokeWidth="2" />
        </svg>
        <span>Select a document or create a new one</span>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          minHeight: isMobile ? 40 : 35,
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          overflowX: 'auto',
        }}
      >
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setTabContextMenu({ x: e.clientX, y: e.clientY });
          }}
          onDoubleClick={() => {
            if (document) {
              setEditingTabTitle(true);
              setEditingTabName(title || '');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: isMobile ? '0 12px' : '0 12px',
            backgroundColor: 'var(--bg)',
            borderRight: '1px solid var(--border)',
            borderTop: '1px solid var(--accent)',
            fontSize: 13,
            color: 'var(--text)',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            whiteSpace: 'nowrap',
            minWidth: 0,
            flex: isMobile ? 1 : undefined,
          }}
        >
          <FileIcon size={14} />
          {editingTabTitle ? (
            <input
              autoFocus
              value={editingTabName}
              onChange={(e) => setEditingTabName(e.target.value)}
              onBlur={() => {
                if (document && editingTabName.trim()) {
                  onRenameDoc(document.id, editingTabName.trim());
                  setTitle(editingTabName.trim());
                }
                setEditingTabTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (document && editingTabName.trim()) {
                    onRenameDoc(document.id, editingTabName.trim());
                    setTitle(editingTabName.trim());
                  }
                  setEditingTabTitle(false);
                }
                if (e.key === 'Escape') setEditingTabTitle(false);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1, minWidth: 0, backgroundColor: 'var(--bg)',
                border: '1px solid var(--accent)', borderRadius: 2, color: 'var(--text)',
                fontSize: 13, padding: '1px 4px', outline: 'none',
                fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            />
          ) : (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{title || 'Untitled'}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onCloseDoc(); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: isMobile ? 16 : 12,
              cursor: 'pointer',
              padding: isMobile ? '8px' : '0 2px',
              lineHeight: 1,
              minWidth: isMobile ? 44 : undefined,
              minHeight: isMobile ? 44 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          minHeight: isMobile ? 'auto' : 38,
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '6px 8px' : '0 12px',
          gap: isMobile ? 6 : 4,
          flexShrink: 0,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: isMobile ? 4 : 4, flexWrap: 'wrap' }}>
          <ToolbarButton label="+ Heading" onClick={() => handleAddBlock('heading')} isMobile={isMobile} />
          <ToolbarButton label="+ Paragraph" onClick={() => handleAddBlock('paragraph')} isMobile={isMobile} />
          <ToolbarButton label="+ Sentence" onClick={() => handleAddBlock('sentence')} isMobile={isMobile} />
        </div>
        {/* Formatting divider + buttons */}
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: isMobile ? '0 2px' : '0 6px', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormatButton label="B" command="bold" title="Bold (Ctrl+B)" isMobile={isMobile} style={{ fontWeight: 700 }} />
          <FormatButton label="I" command="italic" title="Italic (Ctrl+I)" isMobile={isMobile} style={{ fontStyle: 'italic' }} />
          <FormatButton label="U" command="underline" title="Underline (Ctrl+U)" isMobile={isMobile} style={{ textDecoration: 'underline' }} />
          <FormatButton label="S" command="strikeThrough" title="Strikethrough" isMobile={isMobile} style={{ textDecoration: 'line-through' }} />
          <FormatButton label="<>" command="code" title="Inline Code" isMobile={isMobile} style={{ fontFamily: "'Consolas', 'Courier New', monospace", fontSize: 11 }} />
          {/* Font divider */}
          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
          <FontPicker isMobile={isMobile} />
          <FontSizePicker isMobile={isMobile} />
        </div>
        <div style={{ flex: 1, minWidth: isMobile ? 0 : undefined }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 4 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              backgroundColor: 'var(--bg)',
              borderRadius: 5,
              border: '1px solid var(--border)',
              padding: '4px 2px',
            }}
          >
            <button
              onClick={() => handleSpeedChange(speed - 10)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                padding: isMobile ? '6px 10px' : '2px 6px',
                lineHeight: 1,
                borderRadius: 3,
                minWidth: isMobile ? 36 : undefined,
                minHeight: isMobile ? 36 : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              −
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <input
                type="number"
                min={30}
                max={600}
                step={10}
                value={speed}
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                style={{
                  width: 42,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                  textAlign: 'center',
                  outline: 'none',
                  MozAppearance: 'textfield' as never,
                  WebkitAppearance: 'none' as never,
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'Segoe UI', system-ui, sans-serif", letterSpacing: '0.5px' }}>WPM</span>
            </div>
            <button
              onClick={() => handleSpeedChange(speed + 10)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                padding: isMobile ? '6px 10px' : '2px 6px',
                lineHeight: 1,
                borderRadius: 3,
                minWidth: isMobile ? 36 : undefined,
                minHeight: isMobile ? 36 : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              +
            </button>
          </div>
          <ToolbarButton label="&#9654; Play" onClick={() => onStartReader(speed)} accent isMobile={isMobile} />
        </div>
      </div>

      {/* Editor content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 0' : '16px 0' }}>
        {/* Title */}
        <div style={{ padding: isMobile ? '0 16px 12px' : '0 48px 16px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: isMobile ? 20 : 24,
              fontWeight: 600,
              fontFamily: "'Consolas', 'Courier New', monospace",
              caretColor: 'var(--text)',
              padding: '4px 0',
              borderBottom: '1px solid var(--border)',
            }}
          />
        </div>

        {/* Blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            style={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              padding: isMobile ? '4px 8px 4px 0' : '2px 12px 2px 0',
              position: 'relative',
              flexDirection: isMobile ? 'column' : 'row',
            }}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
            onTouchStart={() => setHoveredBlock(block.id)}
          >
            {/* Type label */}
            <div
              style={{
                width: isMobile ? 'auto' : 80,
                minWidth: isMobile ? undefined : 80,
                textAlign: isMobile ? 'left' : 'right',
                paddingRight: isMobile ? 0 : 12,
                paddingLeft: isMobile ? 16 : 0,
                paddingTop: isMobile ? 2 : (block.type === 'heading' ? 6 : 4),
                paddingBottom: isMobile ? 2 : 0,
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: "'Consolas', 'Courier New', monospace",
                userSelect: 'none',
              }}
            >
              {block.type}
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', width: isMobile ? '100%' : undefined, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}>
              <EditableBlock
                block={block}
                isMobile={isMobile}
                prefs={prefs}
                onChange={(content) => handleBlockContentChange(block.id, content)}
              />
            </div>

            {/* Delete button - always visible on mobile via touch */}
            {(hoveredBlock === block.id || isMobile) && (
              <button
                onClick={() => handleDeleteBlock(block.id)}
                title="Delete block"
                style={{
                  position: isMobile ? 'absolute' : 'absolute',
                  right: isMobile ? 4 : 8,
                  top: isMobile ? 2 : 4,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: isMobile ? '8px' : '2px 6px',
                  borderRadius: 3,
                  minWidth: isMobile ? 36 : undefined,
                  minHeight: isMobile ? 36 : undefined,
                  display: isMobile && hoveredBlock !== block.id ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                &#10005;
              </button>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <div
            style={{
              padding: isMobile ? '20px 16px' : '24px 48px',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontFamily: "'Consolas', 'Courier New', monospace",
              fontStyle: 'italic',
            }}
          >
            Use the toolbar above to add content blocks
          </div>
        )}
      </div>

      {/* Tab context menu */}
      {tabContextMenu && document && (
        <TabContextMenu
          x={tabContextMenu.x}
          y={tabContextMenu.y}
          onClose={() => setTabContextMenu(null)}
          onRename={() => {
            setEditingTabTitle(true);
            setEditingTabName(title || '');
            setTabContextMenu(null);
          }}
          onMoveToFolder={() => {
            setShowMoveModal(true);
            setTabContextMenu(null);
          }}
          onMoveToRoot={() => {
            onMoveDoc(document.id, null);
            setTabContextMenu(null);
          }}
          onDelete={() => {
            onDeleteDoc(document.id);
            setTabContextMenu(null);
          }}
          onClose2={onCloseDoc}
        />
      )}

      {/* Move to folder modal */}
      {showMoveModal && document && (
        <EditorMoveToFolderModal
          folders={folders}
          currentFolderId={document.folder_id}
          onSelect={(folderId) => { onMoveDoc(document.id, folderId); setShowMoveModal(false); }}
          onClose={() => setShowMoveModal(false)}
        />
      )}
    </div>
  );
}

function TabContextMenu({ x, y, onClose, onRename, onMoveToFolder, onMoveToRoot, onDelete, onClose2 }: {
  x: number; y: number; onClose: () => void;
  onRename: () => void; onMoveToFolder: () => void; onMoveToRoot: () => void;
  onDelete: () => void; onClose2: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) ref.current.style.left = `${x - rect.width}px`;
      if (rect.bottom > window.innerHeight) ref.current.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  const items: Array<{ label: string; onClick: () => void; danger?: boolean } | { divider: true }> = [
    { label: 'Rename', onClick: onRename },
    { divider: true },
    { label: 'Move to Folder...', onClick: onMoveToFolder },
    { label: 'Move to Root', onClick: onMoveToRoot },
    { divider: true },
    { label: 'Close', onClick: () => { onClose(); onClose2(); } },
    { divider: true },
    { label: 'Delete', onClick: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 2000,
        backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 5,
        minWidth: 180, padding: '4px 0',
        boxShadow: '0 4px 16px var(--shadow)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {items.map((item, i) =>
        'divider' in item ? (
          <div key={i} style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
        ) : (
          <div
            key={i}
            onClick={item.onClick}
            style={{
              padding: '6px 16px', fontSize: 13, cursor: 'pointer',
              color: item.danger ? 'var(--error)' : 'var(--text)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {item.label}
          </div>
        )
      )}
    </div>
  );
}

function EditorMoveToFolderModal({ folders, currentFolderId, onSelect, onClose }: {
  folders: Folder[];
  currentFolderId: number | null;
  onSelect: (folderId: number | null) => void;
  onClose: () => void;
}) {
  const rootFolders = folders.filter((f) => f.parent_id === null);
  const getChildren = (parentId: number) => folders.filter((f) => f.parent_id === parentId);

  const renderFolder = (folder: Folder, depth: number): React.ReactNode => {
    const isCurrent = currentFolderId === folder.id;
    const children = getChildren(folder.id);
    return (
      <div key={folder.id}>
        <div
          onClick={() => !isCurrent && onSelect(folder.id)}
          style={{
            padding: '8px 16px', paddingLeft: 16 + depth * 20,
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: isCurrent ? 'default' : 'pointer',
            color: isCurrent ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
          }}
          onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <FolderIcon size={16} />
          <span style={{ flex: 1 }}>{folder.name}</span>
          {isCurrent && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(current)</span>}
        </div>
        {children.map((c) => renderFolder(c, depth + 1))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'var(--bg-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8,
          width: 360, maxHeight: '60vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px var(--shadow)', overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Move to Folder</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div
            onClick={() => onSelect(null)}
            style={{
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
              cursor: currentFolderId === null ? 'default' : 'pointer',
              color: currentFolderId === null ? 'var(--text-muted)' : 'var(--text)', fontSize: 14,
            }}
            onMouseEnter={(e) => { if (currentFolderId !== null) e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: 14 }}>📂</span>
            <span>Root (no folder)</span>
            {currentFolderId === null && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(current)</span>}
          </div>
          <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '2px 0' }} />
          {folders.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No folders created yet</div>
          ) : (
            rootFolders.map((f) => renderFolder(f, 0))
          )}
        </div>
      </div>
    </div>
  );
}

function EditableBlock({ block, isMobile, prefs, onChange }: { block: ContentBlock; isMobile?: boolean; prefs: EditorPreferences; onChange: (content: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(block.content || '');

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (block.content || '')) {
      ref.current.innerHTML = block.content || '';
      lastHtml.current = block.content || '';
    }
  }, [block.id]); // only reset when block changes, not on every keystroke

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    // Ignore if content hasn't actually changed (e.g. formatting command re-triggers)
    if (html === lastHtml.current) return;
    lastHtml.current = html;
    // Convert bare <div>/<br> from contentEditable to clean html
    onChange(html);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter on headings/sentences (single line)
    if (block.type !== 'paragraph' && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const isHeading = block.type === 'heading';
  const isSentence = block.type === 'sentence';
  const fontSize = isHeading ? prefs.headingSize : isSentence ? prefs.sentenceSize : prefs.paragraphSize;
  const fontFamily = prefs.defaultFont === 'Consolas'
    ? "'Consolas', 'Courier New', monospace"
    : `'${prefs.defaultFont}', sans-serif`;

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={isHeading ? 'Heading...' : isSentence ? 'Sentence...' : 'Paragraph...'}
      className="editable-block"
      style={{
        width: '100%',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        color: isHeading ? 'var(--heading-color)' : isSentence ? 'var(--sentence-color)' : 'var(--text)',
        fontSize: isMobile ? Math.max(fontSize - 2, 10) : fontSize,
        fontWeight: isHeading ? 600 : 400,
        fontFamily,
        caretColor: 'var(--text)',
        padding: '4px 0',
        minHeight: block.type === 'paragraph' ? (isMobile ? 60 : 72) : 'auto',
        lineHeight: 1.6,
        whiteSpace: block.type === 'paragraph' ? 'pre-wrap' : 'nowrap',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    />
  );
}

function FormatButton({ label, command, title, isMobile, style }: {
  label: string; command: string; title: string; isMobile?: boolean; style?: React.CSSProperties;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent stealing focus
    if (command === 'code') {
      // Wrap selection in <code> tag
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        // Check if already inside a <code> element
        const parentCode = range.commonAncestorContainer.parentElement?.closest('code');
        if (parentCode) {
          // Unwrap: replace code tag with its text content
          const textNode = window.document.createTextNode(parentCode.textContent || '');
          parentCode.replaceWith(textNode);
        } else {
          const code = window.document.createElement('code');
          code.style.backgroundColor = 'var(--bg)';
          code.style.padding = '1px 5px';
          code.style.borderRadius = '3px';
          code.style.fontSize = '0.9em';
          code.style.border = '1px solid var(--border)';
          range.deleteContents();
          code.textContent = selectedText;
          range.insertNode(code);
          // Move cursor after the code element
          selection.collapseToEnd();
        }
        // Trigger input event on the contentEditable parent
        const editableParent = range.commonAncestorContainer instanceof HTMLElement
          ? range.commonAncestorContainer.closest('.editable-block')
          : range.commonAncestorContainer.parentElement?.closest('.editable-block');
        if (editableParent) {
          editableParent.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    } else {
      window.document.execCommand(command, false);
    }
  };

  return (
    <button
      onMouseDown={handleClick}
      title={title}
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        color: 'var(--text)',
        fontSize: isMobile ? 13 : 12,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: isMobile ? '6px 8px' : '3px 8px',
        borderRadius: 3,
        cursor: 'pointer',
        minWidth: isMobile ? 36 : 26,
        minHeight: isMobile ? 36 : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {label}
    </button>
  );
}

const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Noto Sans',
  'Montserrat',
  'Lato',
  'Poppins',
  'Inter',
  'Roboto Slab',
  'Oswald',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Ubuntu',
  'PT Sans',
];

function FontPicker({ isMobile }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const applyFont = (font: string) => {
    // Save current selection, apply font, close picker
    document.execCommand('fontName', false, font);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        title="Font Family"
        style={{
          backgroundColor: open ? 'var(--bg-hover)' : 'transparent',
          border: 'none',
          color: 'var(--text)',
          fontSize: isMobile ? 12 : 11,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: isMobile ? '6px 8px' : '3px 8px',
          borderRadius: 3,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minHeight: isMobile ? 36 : undefined,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        Font
        <span style={{ fontSize: 8, lineHeight: 1 }}>&#9660;</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            backgroundColor: 'var(--bg-sidebar)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            minWidth: 200,
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 1500,
            boxShadow: '0 4px 16px var(--shadow)',
            padding: '4px 0',
          }}
        >
          {GOOGLE_FONTS.map((font) => (
            <div
              key={font}
              onMouseDown={(e) => { e.preventDefault(); applyFont(font); }}
              style={{
                padding: '7px 14px',
                fontSize: 13,
                color: 'var(--text)',
                cursor: 'pointer',
                fontFamily: `'${font}', sans-serif`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {font}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

function FontSizePicker({ isMobile }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const applySize = (size: number) => {
    // execCommand fontSize only supports 1-7, so we use a workaround:
    // Apply fontSize 7 (creates <font size="7">), then find and restyle it
    document.execCommand('fontSize', false, '7');
    // Find all font[size="7"] elements inside editable blocks and convert to span with px size
    const editableBlocks = document.querySelectorAll('.editable-block');
    editableBlocks.forEach((block) => {
      const fontTags = block.querySelectorAll('font[size="7"]');
      fontTags.forEach((fontTag) => {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.innerHTML = fontTag.innerHTML;
        fontTag.replaceWith(span);
      });
    });
    // Trigger input event so the change is saved
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const container = sel.getRangeAt(0).commonAncestorContainer;
      const editableParent = container instanceof HTMLElement
        ? container.closest('.editable-block')
        : container.parentElement?.closest('.editable-block');
      if (editableParent) {
        editableParent.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    const size = parseInt(customSize, 10);
    if (size >= 1 && size <= 200) {
      applySize(size);
      setCustomSize('');
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        title="Font Size"
        style={{
          backgroundColor: open ? 'var(--bg-hover)' : 'transparent',
          border: 'none',
          color: 'var(--text)',
          fontSize: isMobile ? 12 : 11,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: isMobile ? '6px 8px' : '3px 8px',
          borderRadius: 3,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minHeight: isMobile ? 36 : undefined,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        Size
        <span style={{ fontSize: 8, lineHeight: 1 }}>&#9660;</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            backgroundColor: 'var(--bg-sidebar)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            minWidth: 120,
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 1500,
            boxShadow: '0 4px 16px var(--shadow)',
            padding: '4px 0',
          }}
        >
          {/* Custom size input */}
          <div style={{ padding: '4px 10px 6px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                min={1}
                max={200}
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
                placeholder="px"
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  color: 'var(--text)',
                  fontSize: 12,
                  padding: '4px 6px',
                  outline: 'none',
                  fontFamily: "'Consolas', 'Courier New', monospace",
                }}
              />
              <button
                onMouseDown={(e) => { e.preventDefault(); handleCustomSubmit(); }}
                style={{
                  backgroundColor: 'var(--accent)',
                  border: 'none',
                  color: 'var(--accent-fg)',
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                Go
              </button>
            </div>
          </div>
          {FONT_SIZES.map((size) => (
            <div
              key={size}
              onMouseDown={(e) => { e.preventDefault(); applySize(size); }}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span>{size}px</span>
              <span style={{ fontSize: size > 24 ? 18 : size, lineHeight: 1, color: 'var(--text-muted)' }}>A</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  accent,
  isMobile,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
  isMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: accent ? 'var(--accent)' : 'transparent',
        border: accent ? 'none' : '1px solid var(--border)',
        color: accent ? 'var(--accent-fg)' : 'var(--text)',
        fontSize: isMobile ? 13 : 12,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: isMobile ? '8px 12px' : '3px 10px',
        borderRadius: 3,
        cursor: 'pointer',
        minHeight: isMobile ? 36 : undefined,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!accent) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!accent) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {label}
    </button>
  );
}
