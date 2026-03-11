'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const menus = ['File', 'Edit', 'View', 'Help'];

interface MenuBarProps {
  onNewDocument: () => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  onWordReaderMode: () => void;
  onReadMode: () => void;
  onOpenTrash: () => void;
  onLogout: () => void;
  userName: string;
  isMobile?: boolean;
}

export default function MenuBar({ onNewDocument, onSave, onToggleSidebar, onWordReaderMode, onReadMode, onOpenTrash, onLogout, userName, isMobile }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes('MAC') || navigator.userAgent.includes('Mac'));
  }, []);

  const mod = isMac ? '⌘' : 'Ctrl+';

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Shift + D — New Document
      if (modKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onNewDocument();
      }
      // Cmd/Ctrl + S — Save
      if (modKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
      // Cmd/Ctrl + B — Toggle Sidebar
      if (modKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleSidebar();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMac, onNewDocument, onSave, onToggleSidebar]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (isMobile) {
    return (
      <div
        style={{
          height: 44,
          backgroundColor: 'var(--bg-menubar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: 14,
          color: 'var(--text)',
          borderBottom: '1px solid var(--border)',
          userSelect: 'none',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              fontSize: 20,
              cursor: 'pointer',
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          <Image
            src="/favicon.png"
            alt="FlashRead"
            width={20}
            height={20}
            style={{ cursor: 'pointer' }}
            onClick={onLogout}
          />
          <span style={{ fontWeight: 600 }}>FlashRead</span>
        </div>

        {/* Sidebar toggle button on mobile */}
        <button
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="2" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="7" y1="2" x2="7" y2="18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {/* Mobile side menu */}
        {mobileMenuOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'var(--bg-overlay)',
                zIndex: 998,
              }}
              onClick={closeMobileMenu}
            />
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '75vw',
                maxWidth: 300,
                backgroundColor: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border)',
                zIndex: 1000,
                boxShadow: '4px 0 16px var(--shadow)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Menu header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image src="/favicon.png" alt="FlashRead" width={20} height={20} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Menu</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: 8,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
              <MobileMenuSection title="File">
                <MobileMenuItem label="New Document" onClick={() => { onNewDocument(); closeMobileMenu(); }} />
                <MobileMenuItem label="Save" onClick={() => { onSave(); closeMobileMenu(); }} />
                <MobileMenuItem label="Trash" onClick={() => { onOpenTrash(); closeMobileMenu(); }} />
              </MobileMenuSection>
              <MobileMenuSection title="View">
                <MobileMenuItem label="Toggle Sidebar" onClick={() => { onToggleSidebar(); closeMobileMenu(); }} />
                <MobileMenuItem label="Read Mode" onClick={() => { onReadMode(); closeMobileMenu(); }} />
                <MobileMenuItem label="FlashRead Mode" onClick={() => { onWordReaderMode(); closeMobileMenu(); }} />
              </MobileMenuSection>
              <MobileMenuSection title="Help">
                <MobileMenuItem label="About FlashRead" onClick={() => { window.open('/about', '_blank'); closeMobileMenu(); }} />
              </MobileMenuSection>
              <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{userName}</div>
                <MobileMenuItem label="Log Out" onClick={() => { onLogout(); closeMobileMenu(); }} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        height: 30,
        backgroundColor: 'var(--bg-menubar)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 8,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: 13,
        color: 'var(--text)',
        borderBottom: '1px solid var(--border)',
        userSelect: 'none',
        flexShrink: 0,
      }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <Image
        src="/favicon.png"
        alt="FlashRead"
        width={18}
        height={18}
        style={{ marginRight: 8, cursor: 'pointer' }}
        onClick={onLogout}
        title="Back to home"
      />
      {menus.map((menu) => (
        <div
          key={menu}
          onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
          onMouseEnter={() => {
            if (activeMenu) setActiveMenu(menu);
          }}
          style={{
            padding: '2px 8px',
            borderRadius: 3,
            cursor: 'pointer',
            backgroundColor: activeMenu === menu ? 'var(--bg-active)' : 'transparent',
            position: 'relative',
          }}
        >
          {menu}
          {activeMenu === menu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 2,
                backgroundColor: 'var(--bg-sidebar)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                minWidth: 220,
                whiteSpace: 'nowrap',
                padding: '4px 0',
                zIndex: 1000,
                boxShadow: '0 4px 12px var(--shadow)',
              }}
            >
              {menu === 'File' && (
                <>
                  <MenuItem label="New Document" shortcut={isMac ? '⇧⌘D' : 'Ctrl+Shift+D'} onClick={() => { onNewDocument(); setActiveMenu(null); }} />
                  <MenuItem label="Save" shortcut={`${mod}S`} onClick={() => { onSave(); setActiveMenu(null); }} />
                  <MenuDivider />
                  <MenuItem label="Trash" onClick={() => { onOpenTrash(); setActiveMenu(null); }} />
                  <MenuDivider />
                  <MenuItem label="Log Out" onClick={() => { onLogout(); setActiveMenu(null); }} />
                </>
              )}
              {menu === 'Edit' && (
                <>
                  <MenuItem label="Undo" shortcut={`${mod}Z`} />
                  <MenuItem label="Redo" shortcut={isMac ? '⇧⌘Z' : 'Ctrl+Y'} />
                  <MenuDivider />
                  <MenuItem label="Cut" shortcut={`${mod}X`} />
                  <MenuItem label="Copy" shortcut={`${mod}C`} />
                  <MenuItem label="Paste" shortcut={`${mod}V`} />
                </>
              )}
              {menu === 'View' && (
                <>
                  <MenuItem label="Toggle Sidebar" shortcut={`${mod}B`} onClick={() => { onToggleSidebar(); setActiveMenu(null); }} />
                  <MenuDivider />
                  <MenuItem label="Read Mode" onClick={() => { onReadMode(); setActiveMenu(null); }} />
                  <MenuItem label="FlashRead Mode" onClick={() => { onWordReaderMode(); setActiveMenu(null); }} />
                </>
              )}
              {menu === 'Help' && (
                <>
                  <MenuItem label="About FlashRead" onClick={() => { window.open('/about', '_blank'); setActiveMenu(null); }} />
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuItem({ label, shortcut, onClick }: { label: string; shortcut?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '4px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--text)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-active)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: 'var(--text-muted)', marginLeft: 32 }}>{shortcut}</span>}
    </div>
  );
}

function MenuDivider() {
  return <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />;
}

function MobileMenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
      <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
    </div>
  );
}

function MobileMenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        fontSize: 14,
        color: 'var(--text)',
        cursor: 'pointer',
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {label}
    </div>
  );
}
