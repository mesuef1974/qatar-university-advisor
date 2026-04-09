// ════════════════════════════════════════════════════════════════════
// ChatMessage — Single chat bubble (bot or user) + SuggestionsRow
// Qatar University Advisor — Design System v2.0
// Uses theme.js for all colors and design tokens
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import theme from '../styles/theme.js';

// ─── renderLine: XSS-safe markdown bold support ──────────────────────
function renderLine(line, idx) {
  if (!line)
    return (
      <p key={idx} style={{ margin: `${theme.spacing.xs / 2}px 0`, lineHeight: 1.7 }}>
        &nbsp;
      </p>
    );

  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  let pIdx = 0;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<React.Fragment key={pIdx++}>{line.slice(lastIndex, match.index)}</React.Fragment>);
    }
    parts.push(<strong key={pIdx++}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(<React.Fragment key={pIdx++}>{line.slice(lastIndex)}</React.Fragment>);
  }

  return (
    <p key={idx} style={{ margin: `${theme.spacing.xs / 2}px 0`, lineHeight: 1.7 }}>
      {parts}
    </p>
  );
}

// ─── renderText: split by newlines and render each line ─────────────
// eslint-disable-next-line react-refresh/only-export-components
export function renderText(text) {
  return text.split('\n').map((line, i) => renderLine(line, i));
}

// ─── Styles derived from theme ───────────────────────────────────────
const styles = {
  wrapper: (isUser) => ({
    display: 'flex',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'flex-end',
    flexDirection: isUser ? 'row-reverse' : 'row',
    animation: `${theme.animation.msgIn} ${theme.animation.duration.fast} ease-out`,
  }),

  avatar: {
    width: 32,
    height: 32,
    background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
    borderRadius: theme.radius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSize.md,
    flexShrink: 0,
    boxShadow: `0 2px 8px ${theme.colors.maroon}4D`,
  },

  bubbleWrapper: {
    maxWidth: '78%',
  },

  bubble: (isUser) => ({
    padding: `${theme.spacing.sm + 4}px ${theme.spacing.md}px`,
    borderRadius: isUser ? `${theme.radius.xl} ${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl}` : `${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl} ${theme.radius.xl}`,
    fontSize: theme.fontSize.md - 0.5,
    wordBreak: 'break-word',
    lineHeight: 1.75,
    ...(isUser
      ? {
          background: `linear-gradient(135deg, ${theme.colors.maroon} 0%, ${theme.colors.maroonDark} 100%)`,
          color: theme.colors.white,
          boxShadow: `0 4px 14px ${theme.colors.maroon}38`,
        }
      : {
          background: theme.colors.botBubble,
          color: theme.colors.gray900,
          boxShadow: `${theme.shadows.sm}, 0 4px 14px rgba(0,0,0,0.06)`,
        }),
  }),

  timestamp: (isUser) => ({
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xs - 2,
    color: isUser ? 'rgba(255,255,255,0.5)' : theme.colors.gray300,
    textAlign: isUser ? 'right' : 'left',
  }),

  suggestionsRow: (isUser) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.sm - 2,
    marginTop: theme.spacing.sm,
    justifyContent: isUser ? 'flex-end' : 'flex-start',
  }),

  chip: {
    padding: `${theme.spacing.sm}px ${theme.spacing.sm + 7}px`,
    background: `linear-gradient(135deg, ${theme.colors.maroon}08, ${theme.colors.maroon}0F)`,
    border: `1px solid ${theme.colors.maroon}33`,
    borderRadius: theme.radius.full,
    fontSize: theme.fontSize.sm,
    color: theme.colors.maroon,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: theme.fonts.primary,
    boxShadow: `0 1px 4px rgba(0,0,0,0.06)`,
    whiteSpace: 'nowrap',
    transition: `all ${theme.animation.duration.fast} ease`,
  },

  chipHover: {
    background: `rgba(138,21,56,0.1)`,
    transform: 'translateY(-1px)',
    boxShadow: `0 3px 8px ${theme.colors.maroon}1F`,
  },
};

// ─── SuggestionsRow ───────────────────────────────────────────────────
export function SuggestionsRow({ suggestions, onSelect, isUser = false }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={styles.suggestionsRow(isUser)}>
      {suggestions.map((s, si) => (
        <button
          key={si}
          style={styles.chip}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.chipHover)}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = styles.chip.background;
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = styles.chip.boxShadow;
          }}
          onClick={() => onSelect && onSelect(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── TypingIndicator ──────────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.md, alignItems: 'flex-end' }}>
      <div style={styles.avatar}>🎓</div>
      <div
        style={{
          background: theme.colors.botBubble,
          padding: `13px 18px`,
          borderRadius: `${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl} ${theme.radius.xl}`,
          display: 'flex',
          gap: theme.spacing.xs + 1,
          alignItems: 'center',
          boxShadow: `0 2px 8px rgba(0,0,0,0.08)`,
        }}
      >
        {[0, 0.2, 0.4].map((delay, di) => (
          <span
            key={di}
            style={{
              width: 7,
              height: 7,
              background: theme.colors.gold,
              borderRadius: theme.radius.full,
              display: 'inline-block',
              animation: `${theme.animation.bounce} 1.2s ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────────────
export default function ChatMessage({ message, onSuggestionClick }) {
  const isUser = message.type === 'user';

  return (
    <div style={styles.wrapper(isUser)}>
      {/* Bot avatar — only for bot messages */}
      {!isUser && <div style={styles.avatar}>🎓</div>}

      <div style={styles.bubbleWrapper}>
        {/* Message bubble */}
        <div style={styles.bubble(isUser)}>
          {renderText(message.content.text)}
          <div style={styles.timestamp(isUser)}>{message.time}</div>
        </div>

        {/* Suggestion chips — only for bot messages that carry suggestions */}
        {!isUser && message.suggestions?.length > 0 && (
          <SuggestionsRow
            suggestions={message.suggestions}
            onSelect={onSuggestionClick}
            isUser={false}
          />
        )}
      </div>
    </div>
  );
}
