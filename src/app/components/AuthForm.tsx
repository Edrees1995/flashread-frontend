'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (mode === 'register') {
      if (!name.trim()) errs.name = 'Name is required';
      else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
      else if (name.trim().length > 50) errs.name = 'Name must be less than 50 characters';
    }

    if (!email.trim()) errs.email = 'Email is required';
    else if (!emailRegex.test(email.trim())) errs.email = 'Please enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (mode === 'register') {
      if (password.length < 8) errs.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(password)) errs.password = 'Password must contain at least one uppercase letter';
      else if (!/[a-z]/.test(password)) errs.password = 'Password must contain at least one lowercase letter';
      else if (!/[0-9]/.test(password)) errs.password = 'Password must contain at least one number';
    }

    if (mode === 'register') {
      if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      router.push('/editor');
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: string) => submitted ? errors[field] : undefined;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 65px)',
      padding: '32px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 40,
        borderRadius: 16,
        border: '1px solid #1a1a2e',
        backgroundColor: 'rgba(20,20,30,0.8)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <Link href="/" style={{
          background: 'none', border: 'none', color: '#858585', fontSize: 13,
          cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4,
          padding: 0, textDecoration: 'none',
        }}>
          ← Back
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Image src="/favicon.png" alt="FlashRead" width={40} height={40} style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontSize: 14, color: '#858585' }}>
            {mode === 'login' ? 'Log in to continue reading' : 'Start your speed reading journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <FormField label="Name" error={fieldError('name')}>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (submitted) setErrors(validate()); }}
                placeholder="Your name"
                style={fieldError('name') ? inputErrorStyle : inputStyle}
                autoComplete="name"
              />
            </FormField>
          )}

          <FormField label="Email" error={fieldError('email')}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (submitted) setErrors(validate()); }}
              placeholder="you@example.com"
              style={fieldError('email') ? inputErrorStyle : inputStyle}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            error={fieldError('password')}
            hint={mode === 'register' ? 'Min 8 chars, uppercase, lowercase, and a number' : undefined}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (submitted) setErrors(validate()); }}
              placeholder="••••••••"
              style={fieldError('password') ? inputErrorStyle : inputStyle}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </FormField>

          {mode === 'register' && (
            <FormField label="Confirm Password" error={fieldError('confirmPassword')}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (submitted) setErrors(validate()); }}
                placeholder="••••••••"
                style={fieldError('confirmPassword') ? inputErrorStyle : inputStyle}
                autoComplete="new-password"
              />
            </FormField>
          )}

          {serverError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(244,71,71,0.1)',
              border: '1px solid rgba(244,71,71,0.3)',
              color: '#f44747',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>!</span>
              {serverError}
            </div>
          )}

          {submitted && Object.keys(errors).length > 0 && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(244,71,71,0.08)',
              border: '1px solid rgba(244,71,71,0.2)',
              color: '#f44747',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>!</span>
              Please fix the errors above before submitting
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...heroBtnPrimary,
              width: '100%',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#858585' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link
            href={mode === 'login' ? '/register' : '/login'}
            style={{ color: '#007acc', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <div style={{ fontSize: 12, color: '#f44747', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="7" stroke="#f44747" strokeWidth="1.5" />
            <path d="M8 4v5" stroke="#f44747" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#f44747" />
          </svg>
          {error}
        </div>
      )}
      {!error && hint && (
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

const heroBtnPrimary: React.CSSProperties = {
  backgroundColor: '#007acc',
  border: 'none',
  color: '#fff',
  padding: '14px 32px',
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#d4d4d4',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #333',
  backgroundColor: '#141420',
  color: '#d4d4d4',
  fontSize: 14,
  outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid #f44747',
  backgroundColor: 'rgba(244,71,71,0.05)',
};
