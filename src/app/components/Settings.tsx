'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar, removeAvatar, updatePreferences } from '../api';
import { EditorPreferences } from '../types';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

interface SettingsProps {
  onClose: () => void;
  isMobile?: boolean;
}

const API_URL = 'http://localhost:8000';

export default function Settings({ onClose, isMobile }: SettingsProps) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Settings header */}
      <div style={{
        height: isMobile ? 44 : 35,
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="var(--text-muted)" strokeWidth="1.2" />
            <path d="M13.5 8c0-.3-.2-.6-.4-.8l1-1.7-.9-.9-1.7 1c-.2-.2-.5-.4-.8-.4L10 3.5H9l-.7 1.7c-.3 0-.6.2-.8.4l-1.7-1-.9.9 1 1.7c-.2.2-.4.5-.4.8L3.5 8v1l1.7.7c0 .3.2.6.4.8l-1 1.7.9.9 1.7-1c.2.2.5.4.8.4l.7 1.7H10l.7-1.7c.3 0 .6-.2.8-.4l1.7 1 .9-.9-1-1.7c.2-.2.4-.5.4-.8l1.7-.7V8z" stroke="var(--text-muted)" strokeWidth="1.2" />
          </svg>
          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Settings</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 16,
            cursor: 'pointer', padding: '4px 8px', borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: isMobile ? 44 : undefined, minHeight: isMobile ? 44 : undefined,
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexShrink: 0,
      }}>
        {['profile', 'editor'].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: isMobile ? '10px 20px' : '8px 16px',
              fontSize: 13,
              color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab === 'profile' ? 'Profile' : 'Editor'}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '24px 16px' : '32px 48px',
        maxWidth: 640,
      }}>
        {activeTab === 'profile' && user && (
          <ProfileTab user={user} onUpdate={updateUser} isMobile={isMobile} />
        )}
        {activeTab === 'editor' && user && (
          <EditorPreferencesTab user={user} onUpdate={updateUser} isMobile={isMobile} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ user, onUpdate, isMobile }: {
  user: { id: number; name: string; email: string; avatar: string | null };
  onUpdate: (user: any) => void;
  isMobile?: boolean;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const avatarUrl = user.avatar ? `${API_URL}${user.avatar}` : null;

  const handleSaveProfile = async () => {
    setProfileMsg(null);
    if (!name.trim()) { setProfileMsg({ type: 'error', text: 'Name is required' }); return; }
    if (!email.trim()) { setProfileMsg({ type: 'error', text: 'Email is required' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setProfileMsg({ type: 'error', text: 'Invalid email' }); return; }

    setSavingProfile(true);
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() });
      onUpdate(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword) { setPasswordMsg({ type: 'error', text: 'Current password is required' }); return; }
    if (!newPassword) { setPasswordMsg({ type: 'error', text: 'New password is required' }); return; }
    if (newPassword.length < 8) { setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
    if (!/[A-Z]/.test(newPassword)) { setPasswordMsg({ type: 'error', text: 'Password must contain an uppercase letter' }); return; }
    if (!/[a-z]/.test(newPassword)) { setPasswordMsg({ type: 'error', text: 'Password must contain a lowercase letter' }); return; }
    if (!/[0-9]/.test(newPassword)) { setPasswordMsg({ type: 'error', text: 'Password must contain a number' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match' }); return; }

    setSavingPassword(true);
    try {
      const updated = await updateProfile({ password: newPassword, currentPassword });
      onUpdate(updated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg({ type: 'success', text: 'Password updated' });
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMsg(null);
    setUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(file);
      onUpdate(updated);
      setAvatarMsg({ type: 'success', text: 'Avatar updated' });
    } catch (err: any) {
      setAvatarMsg({ type: 'error', text: err.response?.data?.message || 'Failed to upload' });
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarMsg(null);
    setUploadingAvatar(true);
    try {
      const updated = await removeAvatar();
      onUpdate(updated);
      setAvatarMsg({ type: 'success', text: 'Avatar removed' });
    } catch {
      setAvatarMsg({ type: 'error', text: 'Failed to remove avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Avatar section */}
      <Section title="Profile Photo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: avatarUrl ? 'transparent' : 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--accent-fg)',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid var(--border)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <SettingsBtn
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                primary
              >
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </SettingsBtn>
              {avatarUrl && (
                <SettingsBtn onClick={handleRemoveAvatar} disabled={uploadingAvatar} danger>
                  Remove
                </SettingsBtn>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, GIF or WebP. Max 2MB.</span>
            {avatarMsg && <Msg type={avatarMsg.type}>{avatarMsg.text}</Msg>}
          </div>
        </div>
      </Section>

      {/* Profile info */}
      <Section title="Personal Information">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SettingsField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </SettingsField>
          <SettingsField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </SettingsField>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingsBtn onClick={handleSaveProfile} disabled={savingProfile} primary>
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </SettingsBtn>
            {profileMsg && <Msg type={profileMsg.type}>{profileMsg.text}</Msg>}
          </div>
        </div>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SettingsField label="Current Password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
            />
          </SettingsField>
          <SettingsField label="New Password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Min 8 chars, uppercase, lowercase, and a number
            </span>
          </SettingsField>
          <SettingsField label="Confirm New Password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={inputStyle}
            />
          </SettingsField>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SettingsBtn onClick={handleSavePassword} disabled={savingPassword} primary>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </SettingsBtn>
            {passwordMsg && <Msg type={passwordMsg.type}>{passwordMsg.text}</Msg>}
          </div>
        </div>
      </Section>
    </div>
  );
}

const GOOGLE_FONTS = [
  'Consolas',
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

const DEFAULT_PREFS: EditorPreferences = {
  defaultFont: 'Consolas',
  headingSize: 18,
  paragraphSize: 14,
  sentenceSize: 14,
};

function EditorPreferencesTab({ user, onUpdate, isMobile }: {
  user: { preferences: Record<string, any> | null };
  onUpdate: (user: any) => void;
  isMobile?: boolean;
}) {
  const prefs = { ...DEFAULT_PREFS, ...(user.preferences || {}) };
  const [defaultFont, setDefaultFont] = useState(prefs.defaultFont);
  const [headingSize, setHeadingSize] = useState(prefs.headingSize);
  const [paragraphSize, setParagraphSize] = useState(prefs.paragraphSize);
  const [sentenceSize, setSentenceSize] = useState(prefs.sentenceSize);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setMsg(null);
    setSaving(true);
    try {
      const updated = await updatePreferences({ defaultFont, headingSize, paragraphSize, sentenceSize });
      onUpdate(updated);
      setMsg({ type: 'success', text: 'Preferences saved' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDefaultFont(DEFAULT_PREFS.defaultFont);
    setHeadingSize(DEFAULT_PREFS.headingSize);
    setParagraphSize(DEFAULT_PREFS.paragraphSize);
    setSentenceSize(DEFAULT_PREFS.sentenceSize);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <ThemeSelector isMobile={isMobile} />

      <Section title="Default Font">
        <SettingsField label="Font Family">
          <select
            value={defaultFont}
            onChange={(e) => setDefaultFont(e.target.value)}
            style={{
              ...inputStyle,
              maxWidth: 280,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23858585'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: 32,
            }}
          >
            {GOOGLE_FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: `'${font}', sans-serif` }}>
                {font}
              </option>
            ))}
          </select>
        </SettingsField>
        <div style={{ marginTop: 8, padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-light)' }}>
          <span style={{ fontFamily: `'${defaultFont}', sans-serif`, fontSize: 15, color: 'var(--text)' }}>
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      </Section>

      <Section title="Default Font Sizes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <SettingsField label="Heading Size (px)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={12}
                max={72}
                value={headingSize}
                onChange={(e) => setHeadingSize(Number(e.target.value))}
                style={{ width: isMobile ? '100%' : 200, accentColor: 'var(--accent)' }}
              />
              <input
                type="number"
                min={8}
                max={200}
                value={headingSize}
                onChange={(e) => setHeadingSize(Number(e.target.value))}
                style={{ ...inputStyle, width: 64, maxWidth: 64, textAlign: 'center' as const }}
              />
            </div>
            <span style={{ fontSize: headingSize > 32 ? 32 : headingSize, fontFamily: `'${defaultFont}', sans-serif`, color: 'var(--heading-color)', fontWeight: 600, marginTop: 4 }}>
              Heading Preview
            </span>
          </SettingsField>

          <SettingsField label="Paragraph Size (px)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={8}
                max={48}
                value={paragraphSize}
                onChange={(e) => setParagraphSize(Number(e.target.value))}
                style={{ width: isMobile ? '100%' : 200, accentColor: 'var(--accent)' }}
              />
              <input
                type="number"
                min={8}
                max={200}
                value={paragraphSize}
                onChange={(e) => setParagraphSize(Number(e.target.value))}
                style={{ ...inputStyle, width: 64, maxWidth: 64, textAlign: 'center' as const }}
              />
            </div>
            <span style={{ fontSize: paragraphSize > 24 ? 24 : paragraphSize, fontFamily: `'${defaultFont}', sans-serif`, color: 'var(--text)', marginTop: 4 }}>
              Paragraph preview text
            </span>
          </SettingsField>

          <SettingsField label="Sentence Size (px)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min={8}
                max={48}
                value={sentenceSize}
                onChange={(e) => setSentenceSize(Number(e.target.value))}
                style={{ width: isMobile ? '100%' : 200, accentColor: 'var(--accent)' }}
              />
              <input
                type="number"
                min={8}
                max={200}
                value={sentenceSize}
                onChange={(e) => setSentenceSize(Number(e.target.value))}
                style={{ ...inputStyle, width: 64, maxWidth: 64, textAlign: 'center' as const }}
              />
            </div>
            <span style={{ fontSize: sentenceSize > 24 ? 24 : sentenceSize, fontFamily: `'${defaultFont}', sans-serif`, color: 'var(--sentence-color)', marginTop: 4 }}>
              Sentence preview text
            </span>
          </SettingsField>
        </div>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SettingsBtn onClick={handleSave} disabled={saving} primary>
          {saving ? 'Saving...' : 'Save Preferences'}
        </SettingsBtn>
        <SettingsBtn onClick={handleReset} disabled={saving}>
          Reset to Defaults
        </SettingsBtn>
        {msg && <Msg type={msg.type}>{msg.text}</Msg>}
      </div>
    </div>
  );
}

const THEME_COLORS: Record<string, { bg: string; sidebar: string; accent: string; text: string }> = {
  dark: { bg: '#1e1e1e', sidebar: '#252526', accent: '#007acc', text: '#d4d4d4' },
  light: { bg: '#ffffff', sidebar: '#f3f3f3', accent: '#007acc', text: '#1e1e1e' },
  system: { bg: '#1e1e1e', sidebar: '#252526', accent: '#007acc', text: '#d4d4d4' },
  monokai: { bg: '#272822', sidebar: '#1e1f1c', accent: '#a6e22e', text: '#f8f8f2' },
  dracula: { bg: '#282a36', sidebar: '#21222c', accent: '#bd93f9', text: '#f8f8f2' },
  nord: { bg: '#2e3440', sidebar: '#2e3440', accent: '#88c0d0', text: '#d8dee9' },
  'github-dark': { bg: '#0d1117', sidebar: '#161b22', accent: '#58a6ff', text: '#c9d1d9' },
  'solarized-dark': { bg: '#002b36', sidebar: '#073642', accent: '#268bd2', text: '#839496' },
  'solarized-light': { bg: '#fdf6e3', sidebar: '#eee8d5', accent: '#268bd2', text: '#657b83' },
  'high-contrast': { bg: '#000000', sidebar: '#0a0a0a', accent: '#1aebff', text: '#ffffff' },
};

function ThemeSelector({ isMobile }: { isMobile?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <Section title="Theme">
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {THEMES.map((t) => {
            const colors = THEME_COLORS[t.id];
            const isActive = theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as ThemeId)}
                style={{
                  cursor: 'pointer',
                  borderRadius: 8,
                  border: isActive ? `2px solid ${colors.accent}` : '2px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Mini preview */}
                <div style={{
                  display: 'flex',
                  height: 60,
                  backgroundColor: colors.bg,
                }}>
                  {/* Sidebar preview */}
                  <div style={{
                    width: 20,
                    backgroundColor: colors.sidebar,
                    borderRight: `1px solid ${colors.accent}22`,
                  }} />
                  {/* Editor area preview */}
                  <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 4, width: '60%', backgroundColor: colors.accent, borderRadius: 2, opacity: 0.8 }} />
                    <div style={{ height: 3, width: '80%', backgroundColor: colors.text, borderRadius: 2, opacity: 0.3 }} />
                    <div style={{ height: 3, width: '45%', backgroundColor: colors.text, borderRadius: 2, opacity: 0.3 }} />
                    <div style={{ height: 3, width: '70%', backgroundColor: colors.text, borderRadius: 2, opacity: 0.3 }} />
                  </div>
                </div>
                {/* Label */}
                <div style={{
                  padding: '8px 10px',
                  backgroundColor: colors.sidebar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: colors.text }}>
                    {t.name}
                  </span>
                  {t.id === 'system' && (
                    <span style={{ fontSize: 10, color: colors.text, opacity: 0.5 }}>Auto</span>
                  )}
                  {isActive && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: colors.accent,
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-light)',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SettingsField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

function SettingsBtn({ onClick, disabled, primary, danger, children }: {
  onClick: () => void; disabled?: boolean; primary?: boolean; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 16px',
        borderRadius: 4,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        border: primary ? 'none' : '1px solid ' + (danger ? 'var(--error)' : 'var(--border)'),
        backgroundColor: primary ? 'var(--accent)' : 'transparent',
        color: danger ? 'var(--error)' : primary ? 'var(--accent-fg)' : 'var(--text)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Msg({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 12,
      color: type === 'success' ? 'var(--success)' : 'var(--error)',
    }}>
      {children}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 360,
  padding: '8px 12px',
  borderRadius: 4,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};
