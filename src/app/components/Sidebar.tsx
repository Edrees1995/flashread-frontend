'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Folder } from '../types';
import { FolderIcon, FileIcon, ChevronIcon } from './Icons';

interface SidebarProps {
  documents: Document[];
  folders: Folder[];
  activeDocId: number | null;
  onSelectDoc: (id: number) => void;
  onNewDoc: (folderId?: number | null) => void;
  onNewFolder: (parentId?: number | null) => void;
  onDeleteDoc: (id: number) => void;
  onDeleteFolder: (id: number) => void;
  onRenameFolder: (id: number, name: string) => void;
  onMoveDoc: (docId: number, folderId: number | null) => void;
  onRenameDoc: (id: number, title: string) => void;
  onLogout: () => void;
  userName: string;
  userAvatar: string | null;
  onOpenSettings: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const API_URL = 'http://localhost:8000';

export default function Sidebar({
  documents, folders, activeDocId, onSelectDoc, onNewDoc, onNewFolder,
  onDeleteDoc, onDeleteFolder, onRenameFolder, onMoveDoc, onRenameDoc,
  onLogout, userName, userAvatar, onOpenSettings, isMobile, onClose,
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const firstName = userName.split(' ')[0];
  const initials = userName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const avatarUrl = userAvatar ? `${API_URL}${userAvatar}` : null;
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; docId: number } | null>(null);
  const [moveModalDocId, setMoveModalDocId] = useState<number | null>(null);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingDocName, setEditingDocName] = useState('');
  const [dragDocId, setDragDocId] = useState<number | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<number | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Close context menu on click anywhere
  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [contextMenu]);

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRename = (id: number, currentName: string) => {
    setEditingFolderId(id);
    setEditingName(currentName);
  };

  const finishRename = () => {
    if (editingFolderId !== null && editingName.trim()) {
      const folder = folders.find(f => f.id === editingFolderId);
      const parentId = folder?.parent_id ?? null;
      const duplicate = folders.find(
        f => f.id !== editingFolderId && f.parent_id === parentId &&
          f.name.toLowerCase() === editingName.trim().toLowerCase()
      );
      if (duplicate) {
        setNameError(`"${editingName.trim()}" already exists in this location`);
        return;
      }
      onRenameFolder(editingFolderId, editingName.trim());
    }
    setEditingFolderId(null);
    setEditingName('');
    setNameError(null);
  };

  const startRenameDoc = (id: number, currentTitle: string) => {
    setEditingDocId(id);
    setEditingDocName(currentTitle || 'Untitled');
  };

  const finishRenameDoc = () => {
    if (editingDocId !== null && editingDocName.trim()) {
      const doc = documents.find(d => d.id === editingDocId);
      const folderId = doc?.folder_id ?? null;
      const duplicate = documents.find(
        d => d.id !== editingDocId && !d.trashed && d.folder_id === folderId &&
          d.title.toLowerCase() === editingDocName.trim().toLowerCase()
      );
      if (duplicate) {
        setNameError(`"${editingDocName.trim()}" already exists in this folder`);
        return;
      }
      onRenameDoc(editingDocId, editingDocName.trim());
    }
    setEditingDocId(null);
    setEditingDocName('');
    setNameError(null);
  };

  const rootFolders = folders.filter((f) => f.parent_id === null);
  const rootDocs = documents.filter((d) => d.folder_id === null && !d.trashed);
  const getFolderChildren = (parentId: number) => folders.filter((f) => f.parent_id === parentId);
  const getFolderDocs = (folderId: number) => documents.filter((d) => d.folder_id === folderId && !d.trashed);

  // Drag handlers for documents
  const handleDragStart = (e: React.DragEvent, docId: number) => {
    setDragDocId(docId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(docId));
  };

  const handleDragEnd = () => {
    setDragDocId(null);
    setDragOverFolder(null);
    setDragOverRoot(false);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
    // Auto-expand folder on drag over
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  };

  const handleFolderDrop = (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    if (dragDocId !== null) {
      onMoveDoc(dragDocId, folderId);
    }
    setDragDocId(null);
    setDragOverFolder(null);
  };

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRoot(true);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragDocId !== null) {
      onMoveDoc(dragDocId, null);
    }
    setDragDocId(null);
    setDragOverRoot(false);
  };

  const renderFolder = (folder: Folder, depth: number) => {
    const isOpen = expandedFolders.has(folder.id);
    const children = getFolderChildren(folder.id);
    const docs = getFolderDocs(folder.id);
    const isDragOver = dragOverFolder === folder.id;

    return (
      <div key={`folder-${folder.id}`}>
        <div
          onClick={() => toggleFolder(folder.id)}
          onDragOver={(e) => handleFolderDragOver(e, folder.id)}
          onDragLeave={() => setDragOverFolder(null)}
          onDrop={(e) => handleFolderDrop(e, folder.id)}
          style={{
            padding: isMobile ? '10px 12px' : '3px 8px',
            paddingLeft: isMobile ? 12 + depth * 16 : 8 + depth * 16,
            fontSize: isMobile ? 14 : 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--text)',
            backgroundColor: isDragOver ? 'var(--bg-active)' : 'transparent',
            minHeight: isMobile ? 44 : undefined,
            position: 'relative',
            outline: isDragOver ? '1px dashed var(--accent)' : 'none',
            borderRadius: isDragOver ? 3 : 0,
          }}
        >
          <ChevronIcon open={isOpen} />
          <FolderIcon open={isOpen} />
          {editingFolderId === folder.id ? (
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                autoFocus
                value={editingName}
                onChange={(e) => { setEditingName(e.target.value); setNameError(null); }}
                onBlur={finishRename}
                onKeyDown={(e) => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') { setEditingFolderId(null); setNameError(null); } }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', backgroundColor: 'var(--bg)',
                  border: nameError ? '1px solid var(--error)' : '1px solid var(--accent)',
                  borderRadius: 2, color: 'var(--text)', fontSize: 13, padding: '1px 4px',
                  outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif",
                }}
              />
              {nameError && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 2,
                  backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 3,
                  padding: '4px 8px', fontSize: 11, color: 'var(--error)', zIndex: 10,
                  whiteSpace: 'nowrap',
                }}>
                  {nameError}
                </div>
              )}
            </div>
          ) : (
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {folder.name}
            </span>
          )}
          {editingFolderId !== folder.id && (
            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
              <SidebarAction title="New file" onClick={() => onNewDoc(folder.id)}>+</SidebarAction>
              <SidebarAction title="Rename" onClick={() => startRename(folder.id, folder.name)}><EditIcon /></SidebarAction>
              <SidebarAction title="Delete" onClick={() => onDeleteFolder(folder.id)} danger>✕</SidebarAction>
            </div>
          )}
        </div>
        {isOpen && (
          <>
            {children.map((child) => renderFolder(child, depth + 1))}
            {docs.map((doc) => renderDoc(doc, depth + 1))}
            {children.length === 0 && docs.length === 0 && (
              <div style={{ paddingLeft: isMobile ? 28 + depth * 16 : 24 + depth * 16, fontSize: 12, color: 'var(--text-muted)', padding: '2px 8px', fontStyle: 'italic' }}>
                Empty
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderDoc = (doc: Document, depth: number) => {
    const isActive = activeDocId === doc.id;
    const isDragging = dragDocId === doc.id;

    return (
      <div
        key={`doc-${doc.id}`}
        draggable
        onDragStart={(e) => handleDragStart(e, doc.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectDoc(doc.id)}
        onDoubleClick={() => startRenameDoc(doc.id, doc.title || 'Untitled')}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, docId: doc.id });
        }}
        style={{
          padding: isMobile ? '10px 12px' : '3px 8px',
          paddingLeft: isMobile ? 12 + depth * 16 + 15 : 8 + depth * 16 + 15,
          fontSize: isMobile ? 14 : 13,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
          color: isActive ? 'var(--text-white)' : 'var(--text)',
          minHeight: isMobile ? 44 : undefined,
          position: 'relative',
          opacity: isDragging ? 0.4 : 1,
        }}
      >
        <FileIcon />
        {editingDocId === doc.id ? (
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              autoFocus
              value={editingDocName}
              onChange={(e) => { setEditingDocName(e.target.value); setNameError(null); }}
              onBlur={finishRenameDoc}
              onKeyDown={(e) => { if (e.key === 'Enter') finishRenameDoc(); if (e.key === 'Escape') { setEditingDocId(null); setEditingDocName(''); setNameError(null); } }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', backgroundColor: 'var(--bg)',
                border: nameError ? '1px solid var(--error)' : '1px solid var(--accent)',
                borderRadius: 2, color: 'var(--text)', fontSize: 13, padding: '1px 4px',
                outline: 'none', fontFamily: "'Segoe UI', system-ui, sans-serif",
              }}
            />
            {nameError && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 2,
                backgroundColor: 'var(--error-bg)', border: '1px solid var(--error)', borderRadius: 3,
                padding: '4px 8px', fontSize: 11, color: 'var(--error)', zIndex: 10,
                whiteSpace: 'nowrap',
              }}>
                {nameError}
              </div>
            )}
          </div>
        ) : (
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {doc.title || 'Untitled'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: isMobile ? '80vw' : 240,
        maxWidth: isMobile ? 320 : 240,
        minWidth: isMobile ? undefined : 240,
        height: isMobile ? '100%' : undefined,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        flexShrink: 0,
        overflow: 'hidden',
        ...(isMobile ? {
          position: 'fixed' as const, top: 0, right: 0, bottom: 0, zIndex: 1000,
          boxShadow: '-4px 0 16px var(--shadow)', borderRight: 'none', borderLeft: '1px solid var(--border)',
        } : {}),
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? '12px 16px' : '8px 12px',
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px',
          color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)', minHeight: isMobile ? 44 : undefined,
        }}
      >
        <span>Explorer</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HeaderBtn onClick={() => onNewFolder(null)} title="New Folder" isMobile={isMobile}>📁</HeaderBtn>
          <HeaderBtn onClick={() => onNewDoc(null)} title="New Document" isMobile={isMobile}>+</HeaderBtn>
          {isMobile && onClose && (
            <HeaderBtn onClick={onClose} title="Close" isMobile={isMobile} muted>✕</HeaderBtn>
          )}
        </div>
      </div>

      {/* Tree */}
      <div
        style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}
        onDragOver={handleRootDragOver}
        onDragLeave={() => setDragOverRoot(false)}
        onDrop={handleRootDrop}
      >
        {dragOverRoot && dragDocId !== null && (
          <div style={{
            padding: '4px 12px', fontSize: 11, color: 'var(--accent)', fontStyle: 'italic',
            borderBottom: '1px dashed var(--accent)',
          }}>
            Drop here to move to root
          </div>
        )}
        {rootFolders.map((f) => renderFolder(f, 0))}
        {rootDocs.map((d) => renderDoc(d, 0))}
        {rootFolders.length === 0 && rootDocs.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: isMobile ? 14 : 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No documents yet
          </div>
        )}
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { label: 'Rename', onClick: () => { const doc = documents.find(d => d.id === contextMenu.docId); startRenameDoc(contextMenu.docId, doc?.title || ''); setContextMenu(null); } },
            { divider: true },
            { label: 'Move to Folder...', onClick: () => { setMoveModalDocId(contextMenu.docId); setContextMenu(null); } },
            { label: 'Move to Root', onClick: () => { onMoveDoc(contextMenu.docId, null); setContextMenu(null); } },
            { divider: true },
            { label: 'Delete', onClick: () => { onDeleteDoc(contextMenu.docId); setContextMenu(null); }, danger: true },
          ]}
        />
      )}

      {/* Move to folder modal */}
      {moveModalDocId !== null && (
        <MoveToFolderModal
          folders={folders}
          currentFolderId={documents.find((d) => d.id === moveModalDocId)?.folder_id ?? null}
          onSelect={(folderId) => { onMoveDoc(moveModalDocId, folderId); setMoveModalDocId(null); }}
          onClose={() => setMoveModalDocId(null)}
        />
      )}

      {/* User profile */}
      <div style={{ borderTop: '1px solid var(--border)', position: 'relative' }}>
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            padding: isMobile ? '12px 16px' : '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            minHeight: isMobile ? 52 : undefined,
          }}
        >
          <div style={{
            width: isMobile ? 32 : 28,
            height: isMobile ? 32 : 28,
            borderRadius: '50%',
            backgroundColor: avatarUrl ? 'transparent' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 14 : 12,
            fontWeight: 700,
            color: 'var(--accent-fg)',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <span style={{
            fontSize: isMobile ? 14 : 13,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {firstName}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, transform: showProfileMenu ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 4l3 3 3-3" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {showProfileMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }} onClick={() => setShowProfileMenu(false)} />
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 8,
              right: 8,
              marginBottom: 4,
              backgroundColor: 'var(--bg-sidebar)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 0',
              boxShadow: '0 -4px 16px var(--shadow)',
              zIndex: 2000,
            }}>
              <div style={{
                padding: '8px 14px',
                fontSize: 12,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {userName}
              </div>
              <ProfileMenuItem
                label="Settings"
                onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2" /><path d="M13.5 8c0-.3-.2-.6-.4-.8l1-1.7-.9-.9-1.7 1c-.2-.2-.5-.4-.8-.4L10 3.5H9l-.7 1.7c-.3 0-.6.2-.8.4l-1.7-1-.9.9 1 1.7c-.2.2-.4.5-.4.8L3.5 8v1l1.7.7c0 .3.2.6.4.8l-1 1.7.9.9 1.7-1c.2.2.5.4.8.4l.7 1.7H10l.7-1.7c.3 0 .6-.2.8-.4l1.7 1 .9-.9-1-1.7c.2-.2.4-.5.4-.8l1.7-.7V8z" stroke="currentColor" strokeWidth="1.2" /></svg>}
              />
              <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '2px 0' }} />
              <ProfileMenuItem
                label="Log Out"
                onClick={() => { setShowProfileMenu(false); onLogout(); }}
                danger
                icon={<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function HeaderBtn({ onClick, title, isMobile, muted, children }: {
  onClick: () => void; title: string; isMobile?: boolean; muted?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        background: 'none', border: 'none', color: muted ? 'var(--text-muted)' : 'var(--text)',
        fontSize: isMobile ? 18 : 16, cursor: 'pointer',
        padding: isMobile ? '8px' : '0 4px', lineHeight: 1,
        minWidth: isMobile ? 44 : undefined, minHeight: isMobile ? 44 : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

function SidebarAction({ title, onClick, danger, children }: {
  title: string; onClick: () => void; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      title={title} onClick={onClick}
      style={{
        background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11,
        cursor: 'pointer', padding: '3px 5px', lineHeight: 1, borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 22, minHeight: 22,
      }}
    >
      {children}
    </button>
  );
}

function EditIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9.5 3.5l3 3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ContextMenu({ x, y, onClose, items }: {
  x: number; y: number; onClose: () => void;
  items: Array<{ label?: string; onClick?: () => void; danger?: boolean; divider?: boolean }>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Adjust if off screen
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) ref.current.style.left = `${x - rect.width}px`;
      if (rect.bottom > window.innerHeight) ref.current.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

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
        item.divider ? (
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

function MoveToFolderModal({ folders, currentFolderId, onSelect, onClose }: {
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
            padding: '8px 16px',
            paddingLeft: 16 + depth * 20,
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: isCurrent ? 'default' : 'pointer',
            color: isCurrent ? 'var(--text-muted)' : 'var(--text)',
            fontSize: 14,
            backgroundColor: 'transparent',
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
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Move to Folder</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16,
              cursor: 'pointer', padding: '0 4px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ✕
          </button>
        </div>

        {/* Root option */}
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
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No folders created yet
            </div>
          ) : (
            rootFolders.map((f) => renderFolder(f, 0))
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileMenuItem({ label, onClick, danger, icon }: {
  label: string; onClick: () => void; danger?: boolean; icon: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '7px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        cursor: 'pointer',
        color: danger ? 'var(--error)' : 'var(--text)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-active)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {icon}
      {label}
    </div>
  );
}
