// ════════════════════════════════════════════════════════════════════
// ChatBubble — Floating chat button (bottom-left for RTL)
// FS-T06: Accessible, animated, Maroon + Gold theme
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import theme from '../styles/theme.js';

const BUBBLE_SIZE = 56;

const styles = {
  button: {
    position: 'fixed',
    bottom: 24,
    left: 24,
    right: 'auto',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: theme.radius.full,
    background: `linear-gradient(135deg, ${theme.colors.maroon} 0%, ${theme.colors.maroonDark} 100%)`,
    color: theme.colors.white,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    boxShadow: `0 4px 16px rgba(138,21,56,0.35)`,
    zIndex: 9998,
    transition: `transform ${theme.animation.duration.fast} ${theme.animation.easing.spring}, box-shadow ${theme.animation.duration.fast}`,
    animation: 'chatBubblePulse 2.5s ease-in-out infinite',
    outline: 'none',
    fontFamily: theme.fonts.primary,
    lineHeight: 1,
  },
  buttonHover: {
    transform: 'scale(1.1)',
    boxShadow: `0 6px 24px rgba(138,21,56,0.45)`,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: theme.radius.full,
    background: theme.colors.gold,
    border: `2px solid ${theme.colors.white}`,
  },
};

const keyframesCSS = `
  @keyframes chatBubblePulse {
    0%   { box-shadow: 0 4px 16px rgba(138,21,56,0.35), 0 0 0 0 rgba(138,21,56,0.4); }
    50%  { box-shadow: 0 4px 16px rgba(138,21,56,0.35), 0 0 0 12px rgba(138,21,56,0); }
    100% { box-shadow: 0 4px 16px rgba(138,21,56,0.35), 0 0 0 0 rgba(138,21,56,0); }
  }
`;

export default function ChatBubble({ onClick, isOpen }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      <style>{keyframesCSS}</style>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        style={{
          ...styles.button,
          ...(hovered ? styles.buttonHover : {}),
          animation: isOpen ? 'none' : styles.button.animation,
        }}
        aria-label="افتح المحادثة"
        aria-expanded={isOpen}
        title="افتح المحادثة"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span style={styles.badge} aria-hidden="true" />}
      </button>
    </>
  );
}
