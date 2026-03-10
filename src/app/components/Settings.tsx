'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadAvatar, removeAvatar } from '../api';

interface SettingsProps {
  onClose: () => void;
  isMobile?: boolean;
}

const API_URL = 'http://localhost:8000';

export default function Settings({ onClose, isMobile }: SettingsProps) {
  const { user, updateUser } = useAuth();
  const [activeTab] = useState('profile');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e',
      overflow: 'hidden',
    }}>
      {/* Settings header */}
      <div style={{
        height: isMobile ? 44 : 35,
        backgroundColor: '#252526',
        borderBottom: '1px solid #454545',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#858585" strokeWidth="1.2" />
            <path d="M13.5 8c0-.3-.2-.6-.4-.8l1-1.7-.9-.9-1.7 1c-.2-.2-.5-.4-.8-.4L10 3.5H9l-.7 1.7c-.3 0-.6.2-.8.4l-1.7-1-.9.9 1 1.7c-.2.2-.4.5-.4.8L3.5 8v1l1.7.7c0 .3.2.6.4.8l-1 1.7.9.9 1.7-1c.2.2.5.4.8.4l.7 1.7H10l.7-1.7c.3 0 .6-.2.8-.4l1.7 1 .9-.9-1-1.7c.2-.2.4-.5.4-.8l1.7-.7V8z" stroke="#858585" strokeWidth="1.2" />
          </svg>
          <span style={{ fontSize: 13, color: '#d4d4d4', fontWeight: 600 }}>Settings</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#858585', fontSize: 16,
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
        backgroundColor: '#252526',
        borderBottom: '1px solid #454545',
        display: 'flex',
        flexShrink: 0,
      }}>
        <div style={{
          padding: isMobile ? '10px 20px' : '8px 16px',
          fontSize: 13,
          color: '#d4d4d4',
          borderBottom: activeTab === 'profile' ? '2px solid #007acc' : '2px solid transparent',
          cursor: 'pointer',
          fontWeight: activeTab === 'profile' ? 600 : 400,
        }}>
          Profile
        </div>
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
            backgroundColor: avatarUrl ? 'transparent' : '#007acc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid #454545',
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
            <span style={{ fontSize: 11, color: '#858585' }}>JPG, PNG, GIF or WebP. Max 2MB.</span>
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
            <span style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#d4d4d4',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid #333',
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
      <label style={{ fontSize: 12, fontWeight: 600, color: '#858585' }}>{label}</label>
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
        border: primary ? 'none' : '1px solid ' + (danger ? '#f44747' : '#454545'),
        backgroundColor: primary ? '#007acc' : 'transparent',
        color: danger ? '#f44747' : primary ? '#fff' : '#d4d4d4',
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
      color: type === 'success' ? '#4ec9b0' : '#f44747',
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
  border: '1px solid #454545',
  backgroundColor: '#1e1e1e',
  color: '#d4d4d4',
  fontSize: 13,
  outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};
