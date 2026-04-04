// ════════════════════════════════════════════════════════════════════
// Qatar National Identity Theme — Design System v2.0
// ════════════════════════════════════════════════════════════════════

const theme = {
  // ── Colors ────────────────────────────────────────────────────────
  colors: {
    maroon: '#8A1538',        // Qatar official maroon
    maroonDark: '#6B1030',    // Darker shade
    maroonLight: '#A52050',   // Lighter shade
    gold: '#C5A55A',          // Gold accent
    goldLight: '#D4BC7C',     // Light gold
    white: '#FFFFFF',
    offWhite: '#F8F6F3',      // Warm off-white
    cream: '#FFF9F0',         // Cream background
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray500: '#6B7280',
    gray700: '#374151',
    gray900: '#111827',
    success: '#059669',       // Green
    successLight: '#D1FAE5',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    info: '#0284C7',
    infoLight: '#E0F2FE',
    chatBg: '#F5F0EB',        // Warm chat background
    userBubble: '#FCE4EC',    // Light maroon bubble
    botBubble: '#FFFFFF',
  },

  // ── Typography ────────────────────────────────────────────────────
  fonts: {
    primary: "'Tajawal', 'Segoe UI', sans-serif",
    heading: "'Cairo', 'Tajawal', sans-serif",
  },

  // ── Font sizes (px values) ────────────────────────────────────────
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
  },

  // ── Spacing (px values) ───────────────────────────────────────────
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // ── Box shadows ───────────────────────────────────────────────────
  shadows: {
    sm: '0 1px 3px rgba(138,21,56,0.08)',
    md: '0 4px 12px rgba(138,21,56,0.12)',
    lg: '0 8px 24px rgba(138,21,56,0.16)',
  },

  // ── Border radii ─────────────────────────────────────────────────
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  // ── Animation constants ───────────────────────────────────────────
  animation: {
    // CSS @keyframes names (defined in global style tag)
    bounce: 'bounce',
    msgIn: 'msgIn',
    menuPulse: 'menuPulse',
    fadeIn: 'fadeIn',
    slideUp: 'slideUp',

    // Duration tokens
    duration: {
      instant: '0.1s',
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
    },

    // Easing tokens
    easing: {
      default: 'ease',
      spring: 'cubic-bezier(0.34,1.56,0.64,1)',
      smooth: 'cubic-bezier(0.4,0,0.2,1)',
    },

    // Reusable keyframe strings (embed in <style> tags)
    keyframes: `
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40%            { transform: translateY(-7px); }
      }
      @keyframes msgIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes menuPulse {
        0%   { box-shadow: 0 0 0 0   rgba(197,165,90,0.6); }
        70%  { box-shadow: 0 0 0 6px rgba(197,165,90,0);   }
        100% { box-shadow: 0 0 0 0   rgba(197,165,90,0);   }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `,
  },
};

export default theme;
