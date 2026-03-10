'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, ContentBlock, Folder } from '../types';
import { updateDocument, updateBlock, createBlock, deleteBlock } from '../api';
import { FileIcon, FolderIcon } from './Icons';

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
          backgroundColor: '#1e1e1e',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: '#858585',
          fontSize: isMobile ? 16 : 14,
          flexDirection: 'column',
          gap: 8,
          padding: isMobile ? '24px 16px' : 0,
          textAlign: 'center',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M12 8h18l8 8v24a2 2 0 01-2 2H12a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#454545" strokeWidth="2" />
          <path d="M30 8v8h8" stroke="#454545" strokeWidth="2" />
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
        backgroundColor: '#1e1e1e',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          minHeight: isMobile ? 40 : 35,
          backgroundColor: '#252526',
          display: 'flex',
          alignItems: 'stretch',
          borderBottom: '1px solid #454545',
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
            backgroundColor: '#1e1e1e',
            borderRight: '1px solid #454545',
            borderTop: '1px solid #007acc',
            fontSize: 13,
            color: '#d4d4d4',
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
                flex: 1, minWidth: 0, backgroundColor: '#1e1e1e',
                border: '1px solid #007acc', borderRadius: 2, color: '#d4d4d4',
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
              color: '#858585',
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
            onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#858585'; }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          minHeight: isMobile ? 'auto' : 38,
          backgroundColor: '#252526',
          borderBottom: '1px solid #454545',
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
        <div style={{ flex: 1, minWidth: isMobile ? 0 : undefined }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 4 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              backgroundColor: '#1e1e1e',
              borderRadius: 5,
              border: '1px solid #454545',
              padding: '4px 2px',
            }}
          >
            <button
              onClick={() => handleSpeedChange(speed - 10)}
              style={{
                background: 'none',
                border: 'none',
                color: '#858585',
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
              onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d4'; e.currentTarget.style.backgroundColor = '#3c3c3c'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#858585'; e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                  color: '#d4d4d4',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                  textAlign: 'center',
                  outline: 'none',
                  MozAppearance: 'textfield' as never,
                  WebkitAppearance: 'none' as never,
                }}
              />
              <span style={{ fontSize: 10, color: '#858585', fontFamily: "'Segoe UI', system-ui, sans-serif", letterSpacing: '0.5px' }}>WPM</span>
            </div>
            <button
              onClick={() => handleSpeedChange(speed + 10)}
              style={{
                background: 'none',
                border: 'none',
                color: '#858585',
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
              onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d4'; e.currentTarget.style.backgroundColor = '#3c3c3c'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#858585'; e.currentTarget.style.backgroundColor = 'transparent'; }}
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
              color: '#d4d4d4',
              fontSize: isMobile ? 20 : 24,
              fontWeight: 600,
              fontFamily: "'Consolas', 'Courier New', monospace",
              caretColor: '#d4d4d4',
              padding: '4px 0',
              borderBottom: '1px solid #454545',
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
                color: '#858585',
                fontFamily: "'Consolas', 'Courier New', monospace",
                userSelect: 'none',
              }}
            >
              {block.type}
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', width: isMobile ? '100%' : undefined, paddingLeft: isMobile ? 16 : 0, paddingRight: isMobile ? 16 : 0 }}>
              {block.type === 'heading' ? (
                <input
                  type="text"
                  value={block.content || ''}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  placeholder="Heading..."
                  className="editable-block"
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#569cd6',
                    fontSize: isMobile ? 16 : 18,
                    fontWeight: 600,
                    fontFamily: "'Consolas', 'Courier New', monospace",
                    caretColor: '#d4d4d4',
                    padding: '4px 0',
                  }}
                />
              ) : (
                <textarea
                  value={block.content || ''}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  placeholder={block.type === 'paragraph' ? 'Paragraph...' : 'Sentence...'}
                  className="editable-block"
                  rows={block.type === 'paragraph' ? 3 : 1}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: block.type === 'sentence' ? '#ce9178' : '#d4d4d4',
                    fontSize: isMobile ? 14 : 14,
                    fontFamily: "'Consolas', 'Courier New', monospace",
                    caretColor: '#d4d4d4',
                    padding: '4px 0',
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
              )}
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
                  color: '#858585',
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
                  e.currentTarget.style.backgroundColor = '#3c3c3c';
                  e.currentTarget.style.color = '#d4d4d4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#858585';
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
              color: '#858585',
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
        backgroundColor: '#252526', border: '1px solid #454545', borderRadius: 5,
        minWidth: 180, padding: '4px 0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {items.map((item, i) =>
        'divider' in item ? (
          <div key={i} style={{ height: 1, backgroundColor: '#454545', margin: '4px 0' }} />
        ) : (
          <div
            key={i}
            onClick={item.onClick}
            style={{
              padding: '6px 16px', fontSize: 13, cursor: 'pointer',
              color: item.danger ? '#f44747' : '#d4d4d4',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#094771'; }}
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
            color: isCurrent ? '#858585' : '#d4d4d4', fontSize: 14,
          }}
          onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = '#094771'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <FolderIcon size={16} />
          <span style={{ flex: 1 }}>{folder.name}</span>
          {isCurrent && <span style={{ fontSize: 11, color: '#858585' }}>(current)</span>}
        </div>
        {children.map((c) => renderFolder(c, depth + 1))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#252526', border: '1px solid #454545', borderRadius: 8,
          width: 360, maxHeight: '60vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #454545',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#d4d4d4' }}>Move to Folder</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#858585', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#d4d4d4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#858585'; }}
          >✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div
            onClick={() => onSelect(null)}
            style={{
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
              cursor: currentFolderId === null ? 'default' : 'pointer',
              color: currentFolderId === null ? '#858585' : '#d4d4d4', fontSize: 14,
            }}
            onMouseEnter={(e) => { if (currentFolderId !== null) e.currentTarget.style.backgroundColor = '#094771'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: 14 }}>📂</span>
            <span>Root (no folder)</span>
            {currentFolderId === null && <span style={{ fontSize: 11, color: '#858585' }}>(current)</span>}
          </div>
          <div style={{ height: 1, backgroundColor: '#454545', margin: '2px 0' }} />
          {folders.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#858585', fontSize: 13 }}>No folders created yet</div>
          ) : (
            rootFolders.map((f) => renderFolder(f, 0))
          )}
        </div>
      </div>
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
        backgroundColor: accent ? '#007acc' : 'transparent',
        border: accent ? 'none' : '1px solid #454545',
        color: '#d4d4d4',
        fontSize: isMobile ? 13 : 12,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: isMobile ? '8px 12px' : '3px 10px',
        borderRadius: 3,
        cursor: 'pointer',
        minHeight: isMobile ? 36 : undefined,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!accent) e.currentTarget.style.backgroundColor = '#3c3c3c';
      }}
      onMouseLeave={(e) => {
        if (!accent) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {label}
    </button>
  );
}
