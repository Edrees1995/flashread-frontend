'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const menus = ['File', 'Edit', 'View', 'Help'];

interface MenuBarProps {
  onNewDocument: () => void;
  onSave: () => void;
  onToggleSidebar: () => void;
  onWordReaderMode: () => void;
  onOpenTrash: () => void;
  onLogout: () => void;
  userName: string;
  isMobile?: boolean;
}

export default function MenuBar({ onNewDocument, onSave, onToggleSidebar, onWordReaderMode, onOpenTrash, onLogout, userName, isMobile }: MenuBarProps) {
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
          backgroundColor: '#3c3c3c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: 14,
          color: '#d4d4d4',
          borderBottom: '1px solid #454545',
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
              color: '#d4d4d4',
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
              <rect y="3" width="20" height="2" rx="1" fill="#d4d4d4" />
              <rect y="9" width="20" height="2" rx="1" fill="#d4d4d4" />
              <rect y="15" width="20" height="2" rx="1" fill="#d4d4d4" />
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
            color: '#d4d4d4',
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
            <rect x="1" y="2" width="18" height="16" rx="2" stroke="#d4d4d4" strokeWidth="1.5" fill="none" />
            <line x1="7" y1="2" x2="7" y2="18" stroke="#d4d4d4" strokeWidth="1.5" />
          </svg>
        </button>

        {/* Mobile side menu */}
        {mobileMenuOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
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
                backgroundColor: '#252526',
                borderRight: '1px solid #454545',
                zIndex: 1000,
                boxShadow: '4px 0 16px rgba(0,0,0,0.5)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Menu header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #454545',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image src="/favicon.png" alt="FlashRead" width={20} height={20} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#d4d4d4' }}>Menu</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#858585',
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
                <MobileMenuItem label="FlashRead Mode" onClick={() => { onWordReaderMode(); closeMobileMenu(); }} />
              </MobileMenuSection>
              <MobileMenuSection title="Help">
                <MobileMenuItem label="About FlashRead" onClick={closeMobileMenu} />
              </MobileMenuSection>
              <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #454545' }}>
                <div style={{ fontSize: 12, color: '#858585', marginBottom: 8 }}>{userName}</div>
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
        backgroundColor: '#3c3c3c',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 8,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        fontSize: 13,
        color: '#d4d4d4',
        borderBottom: '1px solid #454545',
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
            backgroundColor: activeMenu === menu ? '#094771' : 'transparent',
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
                backgroundColor: '#252526',
                border: '1px solid #454545',
                borderRadius: 4,
                minWidth: 220,
                whiteSpace: 'nowrap',
                padding: '4px 0',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
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
                  <MenuItem label="FlashRead Mode" onClick={() => { onWordReaderMode(); setActiveMenu(null); }} />
                </>
              )}
              {menu === 'Help' && (
                <>
                  <MenuItem label="About FlashRead" onClick={() => setActiveMenu(null)} />
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
        color: '#d4d4d4',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#094771')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span>{label}</span>
      {shortcut && <span style={{ color: '#858585', marginLeft: 32 }}>{shortcut}</span>}
    </div>
  );
}

function MenuDivider() {
  return <div style={{ height: 1, backgroundColor: '#454545', margin: '4px 0' }} />;
}

function MobileMenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ padding: '10px 16px 4px', fontSize: 11, fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      {children}
      <div style={{ height: 1, backgroundColor: '#454545', margin: '4px 0' }} />
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
        color: '#d4d4d4',
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
