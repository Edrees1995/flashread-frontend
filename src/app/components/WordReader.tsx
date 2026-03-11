'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ContentBlock } from '../types';

interface WordReaderProps {
  blocks: ContentBlock[];
  initialWpm: number;
  onClose: () => void;
  isMobile?: boolean;
}

interface Word {
  text: string;
  blockIndex: number;
  isHeading: boolean;
  endsWithPeriod: boolean;
  isFirstInBlock: boolean;
}

function stripHtml(html: string): string {
  // Remove HTML tags to get plain text for speed reading
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

function buildWords(blocks: ContentBlock[]): Word[] {
  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);
  const words: Word[] = [];

  sorted.forEach((block, blockIndex) => {
    const content = stripHtml(block.content || '').trim();
    if (!content) return;
    const isHeading = block.type === 'heading';
    const tokens = content.split(/\s+/).filter((w) => w.length > 0);
    tokens.forEach((token, i) => {
      words.push({
        text: token,
        blockIndex,
        isHeading,
        endsWithPeriod: /[.!?]$/.test(token),
        isFirstInBlock: i === 0,
      });
    });
  });

  return words;
}

export default function WordReader({ blocks, initialWpm, onClose, isMobile }: WordReaderProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialWpm);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const w = buildWords(blocks);
    setWords(w);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [blocks]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    if (!isPlaying || words.length === 0 || currentIndex >= words.length) return;

    const baseMs = Math.round(60000 / wpm);
    const current = words[currentIndex];
    // Pause longer at sentence endings
    const delay = current.endsWithPeriod ? baseMs + 1000 : baseMs;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= words.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, delay);

    return clearTimer;
  }, [isPlaying, currentIndex, words, wpm, clearTimer]);

  // Auto-scroll current word into view
  useEffect(() => {
    const el = document.getElementById(`word-${currentIndex}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentIndex]);

  const handleStop = () => {
    clearTimer();
    setIsPlaying(false);
    onClose();
  };

  const handlePause = () => {
    if (isPlaying) {
      clearTimer();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  if (words.length === 0) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          flexDirection: 'column',
          gap: 16,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          color: 'var(--text-muted)',
          padding: isMobile ? '24px 16px' : 0,
          textAlign: 'center',
        }}
      >
        <span>No content to read. Add some text first.</span>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            color: 'var(--accent-fg)',
            padding: isMobile ? '12px 24px' : '6px 20px',
            borderRadius: 3,
            cursor: 'pointer',
            fontSize: isMobile ? 16 : 13,
            minHeight: isMobile ? 44 : undefined,
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2000,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          minHeight: isMobile ? 'auto' : 48,
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '8px 12px' : '0 24px',
          flexShrink: 0,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 8 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            FlashRead
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {currentIndex + 1} / {words.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flex: isMobile ? 1 : undefined, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>30</span>
            <input
              type="range"
              min={30}
              max={600}
              step={10}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              style={{ width: isMobile ? '100%' : 120, accentColor: 'var(--accent)', flex: isMobile ? 1 : undefined, minWidth: 0 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>600</span>
            <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600, minWidth: isMobile ? 50 : 60, flexShrink: 0, textAlign: 'right' }}>
              {wpm} WPM
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handlePause}
              style={{
                backgroundColor: 'var(--accent)',
                border: 'none',
                color: 'var(--accent-fg)',
                padding: isMobile ? '10px 16px' : '5px 16px',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 13,
                minWidth: isMobile ? undefined : 70,
                minHeight: isMobile ? 44 : undefined,
              }}
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={handleStop}
              style={{
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: isMobile ? '10px 16px' : '5px 16px',
                borderRadius: 3,
                cursor: 'pointer',
                fontSize: 13,
                minHeight: isMobile ? 44 : undefined,
              }}
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: 'var(--bg-sidebar)', flexShrink: 0 }}>
        <div
          style={{
            width: `${((currentIndex + 1) / words.length) * 100}%`,
            height: '100%',
            backgroundColor: 'var(--accent)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Reading area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '24px 16px' : '48px 80px',
          maxWidth: 800,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {words.map((word, i) => {
          const visible = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const nextWord = words[i + 1];
          const isLastInBlock = !nextWord || nextWord.isFirstInBlock;

          return (
            <span key={i}>
              {/* Paragraph break between blocks */}
              {word.isFirstInBlock && i > 0 && (
                <div style={{ height: word.isHeading ? (isMobile ? 24 : 32) : (isMobile ? 14 : 20) }} />
              )}
              <span
                id={`word-${i}`}
                style={{
                  fontSize: word.isHeading ? (isMobile ? 22 : 28) : (isMobile ? 16 : 18),
                  fontWeight: word.isHeading ? 700 : 400,
                  lineHeight: word.isHeading ? 1.4 : 1.8,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                  visibility: visible ? 'visible' : 'hidden',
                  color: isCurrent ? 'var(--text-white)' : 'var(--text)',
                  backgroundColor: isCurrent ? 'var(--bg-active)' : 'transparent',
                  padding: isCurrent ? '2px 4px' : '0',
                  borderRadius: isCurrent ? 3 : 0,
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                }}
              >
                {word.text}
              </span>
              {/* Space after each word except last in block */}
              {!isLastInBlock && (
                <span style={{
                  fontSize: word.isHeading ? (isMobile ? 22 : 28) : (isMobile ? 16 : 18),
                  visibility: visible ? 'visible' : 'hidden',
                }}>{' '}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
