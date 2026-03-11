'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Document, Folder } from '../types';
import { fetchDocuments, fetchDocument, createDocument, updateDocument, trashDocument, fetchFolders, createFolder, updateFolder, deleteFolder } from '../api';
import MenuBar from '../components/MenuBar';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import StatusBar from '../components/StatusBar';
import WordReader from '../components/WordReader';
import TrashModal from '../components/TrashModal';
import ReadMode from '../components/ReadMode';
import Settings from '../components/Settings';
import { useAuth } from '../context/AuthContext';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export default function EditorPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [readerWpm, setReaderWpm] = useState(60);
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showReadMode, setShowReadMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorSpeedRef = useRef(60);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [docs, flds] = await Promise.all([fetchDocuments(), fetchFolders()]);
      setDocuments(docs);
      setFolders(flds);
    } catch {}
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (mounted) setShowSidebar(!isMobile);
  }, [isMobile, mounted]);

  if (loading || !user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border-light)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const handleSelectDoc = async (id: number) => {
    try {
      const doc = await fetchDocument(id);
      setActiveDoc(doc);
      if (isMobile) setShowSidebar(false);
    } catch {}
  };

  const handleNewDoc = async (folderId?: number | null) => {
    try {
      const doc = await createDocument(folderId);
      await loadData();
      const fullDoc = await fetchDocument(doc.id);
      setActiveDoc(fullDoc);
    } catch {}
  };

  const handleNewFolder = async (parentId?: number | null) => {
    try {
      await createFolder({ parent_id: parentId });
      await loadData();
    } catch {}
  };

  const handleDeleteFolder = async (id: number) => {
    try {
      await deleteFolder(id);
      await loadData();
    } catch {}
  };

  const handleRenameFolder = async (id: number, name: string) => {
    try {
      await updateFolder(id, { name });
      await loadData();
    } catch {}
  };

  const handleTrashDoc = async (id: number) => {
    try {
      await trashDocument(id);
      if (activeDoc?.id === id) setActiveDoc(null);
      await loadData();
    } catch {}
  };

  const handleRenameDoc = async (id: number, title: string) => {
    try {
      await updateDocument(id, { title });
      if (activeDoc?.id === id) {
        setActiveDoc({ ...activeDoc, title });
      }
      await loadData();
    } catch {}
  };

  const handleMoveDoc = async (docId: number, folderId: number | null) => {
    try {
      await updateDocument(docId, { folder_id: folderId } as Partial<Document>);
      await loadData();
    } catch {}
  };

  const handleDocumentUpdated = () => {
    loadData();
  };

  const handleSave = async () => {
    if (activeDoc) {
      await updateDocument(activeDoc.id, { title: activeDoc.title });
      await loadData();
    }
  };

  const handleToggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const handleStartReader = (wpm: number) => {
    if (activeDoc) {
      setReaderWpm(wpm);
      editorSpeedRef.current = wpm;
      setShowReader(true);
    }
  };

  const handleWordReaderMode = () => {
    if (activeDoc) {
      setReaderWpm(editorSpeedRef.current);
      setShowReader(true);
    }
  };

  const handleReadMode = () => {
    if (activeDoc) {
      setShowReadMode(true);
    }
  };

  const handleOpenTrash = () => {
    setShowTrash(true);
  };

  const mobile = mounted && isMobile;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MenuBar
        onNewDocument={() => handleNewDoc(null)}
        onSave={handleSave}
        onToggleSidebar={handleToggleSidebar}
        onWordReaderMode={handleWordReaderMode}
        onReadMode={handleReadMode}
        onOpenTrash={handleOpenTrash}
        onLogout={handleLogout}
        userName={user.name}
        isMobile={mobile}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {mobile && showSidebar && (
          <div
            className="sidebar-overlay"
            onClick={() => setShowSidebar(false)}
          />
        )}
        {mounted && showSidebar && (
          <Sidebar
            documents={documents}
            folders={folders}
            activeDocId={activeDoc?.id ?? null}
            onSelectDoc={handleSelectDoc}
            onNewDoc={handleNewDoc}
            onNewFolder={handleNewFolder}
            onDeleteDoc={handleTrashDoc}
            onDeleteFolder={handleDeleteFolder}
            onRenameFolder={handleRenameFolder}
            onMoveDoc={handleMoveDoc}
            onRenameDoc={handleRenameDoc}
            onLogout={handleLogout}
            userName={user.name}
            userAvatar={user.avatar}
            onOpenSettings={() => { setShowSettings(true); setActiveDoc(null); }}
            isMobile={mobile}
            onClose={() => setShowSidebar(false)}
          />
        )}
        {showSettings ? (
          <Settings onClose={() => setShowSettings(false)} isMobile={mobile} />
        ) : (
          <Editor
            document={activeDoc}
            folders={folders}
            onDocumentUpdated={handleDocumentUpdated}
            onStartReader={handleStartReader}
            onCloseDoc={() => setActiveDoc(null)}
            onRenameDoc={handleRenameDoc}
            onMoveDoc={handleMoveDoc}
            onDeleteDoc={handleTrashDoc}
            isMobile={mobile}
          />
        )}
      </div>

      <StatusBar document={activeDoc} blocks={activeDoc?.blocks || []} isMobile={mobile} />

      {showReader && activeDoc && (
        <WordReader
          blocks={activeDoc.blocks || []}
          initialWpm={readerWpm}
          onClose={() => setShowReader(false)}
          isMobile={mobile}
        />
      )}

      {showReadMode && activeDoc && (
        <ReadMode
          title={activeDoc.title}
          blocks={activeDoc.blocks || []}
          onClose={() => setShowReadMode(false)}
          isMobile={mobile}
        />
      )}

      {showTrash && (
        <TrashModal
          onClose={() => setShowTrash(false)}
          onRestored={loadData}
          isMobile={mobile}
        />
      )}
    </div>
  );
}
