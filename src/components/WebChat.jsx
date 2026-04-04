// ════════════════════════════════════════════════════════════════════
// WebChat — Floating chat window with mock AI responses
// FS-T06: RTL, Accessible, Maroon + Gold, Mobile responsive
// ════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';
import theme from '../styles/theme.js';
import ChatBubble from './ChatBubble.jsx';

// ────────────────────────────────────────────────────────────────────
// Session storage helpers
// ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'webchat_conversation';

function loadConversation() {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveConversation(messages) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // sessionStorage full or unavailable — ignore silently
  }
}

// ────────────────────────────────────────────────────────────────────
// Mock responses (used until a real API endpoint is wired up)
// ────────────────────────────────────────────────────────────────────
const MOCK_RESPONSES = [
  {
    keywords: ['جامعة قطر', 'جامعه قطر', 'QU'],
    answer: '🎓 **جامعة قطر** هي أكبر جامعة حكومية في الدولة.\n\n• مجانية للقطريين\n• معدل القبول: 60%+ للقطريين، 80%+ للمقيمين\n• تضم 10 كليات وأكثر من 90 برنامج أكاديمي',
    suggestions: ['تخصصات جامعة قطر', 'رسوم المقيمين', 'منح متاحة'],
  },
  {
    keywords: ['منح', 'ابتعاث', 'بعثة', 'سبونسر'],
    answer: '💰 **المنح والابتعاث في قطر:**\n\n• **البعثة الأميرية**: أفضل جامعات العالم — تغطية كاملة\n• **برنامج طموح**: مكافأة 22,000 ريال/شهر للأعزب\n• **منح الشركات**: قطر للطاقة (4K)، الخطوط القطرية (3.5K)، QNB (3K)\n• **HBKU**: منح كاملة لجميع الجنسيات',
    suggestions: ['شروط البعثة الأميرية', 'منح لغير القطريين', 'HBKU'],
  },
  {
    keywords: ['تخصص', 'تخصصات', 'مستقبل'],
    answer: '🔮 **تخصصات المستقبل الأعلى طلباً 2025-2030:**\n\n• الذكاء الاصطناعي: نمو 35%+، رواتب 20-35K\n• الأمن السيبراني: نقص حاد، رواتب 18-30K\n• الطاقة المتجددة: رؤية 2030 تدعمه\n• هندسة البترول: قطر ثالث منتج عالمياً للغاز',
    suggestions: ['رواتب الذكاء الاصطناعي', 'جامعات الهندسة', 'كارنيجي ميلون'],
  },
  {
    keywords: ['راتب', 'رواتب', 'معاش'],
    answer: '💵 **الرواتب في قطر (معفاة ضريبياً 100%):**\n\n• الطب المتخصص: 30,000 – 55,000 ريال/شهر\n• هندسة البترول: 20,000 – 40,000 ريال/شهر\n• الذكاء الاصطناعي: 18,000 – 35,000 ريال/شهر\n• علوم الحاسوب: 15,000 – 30,000 ريال/شهر',
    suggestions: ['تخصصات المستقبل', 'المنح والابتعاث', 'جامعات قطر'],
  },
];

const DEFAULT_RESPONSE = {
  answer: '🎓 أنا المرشد الجامعي الذكي! يمكنني مساعدتك في:\n\n• اختيار الجامعة والتخصص المناسب\n• معلومات عن المنح والابتعاث\n• الرواتب المتوقعة بعد التخرج\n\nما الذي تريد معرفته؟',
  suggestions: ['جامعات قطر', 'المنح والابتعاث', 'تخصصات المستقبل'],
};

function getMockResponse(text) {
  const lower = text.trim();
  for (const entry of MOCK_RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry;
    }
  }
  return DEFAULT_RESPONSE;
}

// ────────────────────────────────────────────────────────────────────
// Timestamp helper
// ────────────────────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' });
}

// ────────────────────────────────────────────────────────────────────
// Simple markdown bold renderer (XSS-safe)
// ────────────────────────────────────────────────────────────────────
function renderText(text) {
  return text.split('\n').map((line, li) => {
    if (!line) return <p key={li} style={{ margin: '2px 0', lineHeight: 1.7 }}>&nbsp;</p>;
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let last = 0;
    let match;
    let pi = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(<span key={pi++}>{line.slice(last, match.index)}</span>);
      parts.push(<strong key={pi++}>{match[1]}</strong>);
      last = regex.lastIndex;
    }
    if (last < line.length) parts.push(<span key={pi++}>{line.slice(last)}</span>);
    return <p key={li} style={{ margin: '2px 0', lineHeight: 1.7 }}>{parts}</p>;
  });
}

// ────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────
const WINDOW_WIDTH = 370;
const WINDOW_HEIGHT = 520;

const s = {
  overlay: {
    position: 'fixed',
    bottom: 90,
    left: 24,
    right: 'auto',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    maxHeight: 'calc(100vh - 120px)',
    maxWidth: 'calc(100vw - 32px)',
    borderRadius: theme.radius.lg,
    background: theme.colors.offWhite,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
    fontFamily: theme.fonts.primary,
    direction: 'rtl',
    animation: `slideUp ${theme.animation.duration.normal} ${theme.animation.easing.spring}`,
  },

  header: {
    background: `linear-gradient(135deg, ${theme.colors.maroon} 0%, ${theme.colors.maroonDark} 100%)`,
    color: theme.colors.white,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontFamily: theme.fonts.heading,
    fontSize: theme.fontSize.lg,
    fontWeight: 700,
    flex: 1,
  },
  headerClose: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.white,
    fontSize: 18,
    cursor: 'pointer',
    padding: 4,
    borderRadius: theme.radius.sm,
    lineHeight: 1,
    opacity: 0.8,
    transition: `opacity ${theme.animation.duration.fast}`,
  },

  messagesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  msgRow: (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-start' : 'flex-end',
    alignItems: 'flex-end',
    gap: 6,
  }),
  bubble: (isUser) => ({
    maxWidth: '82%',
    padding: '10px 14px',
    borderRadius: isUser
      ? `${theme.radius.xl} ${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl}`
      : `${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl} ${theme.radius.xl}`,
    fontSize: theme.fontSize.md,
    lineHeight: 1.7,
    wordBreak: 'break-word',
    ...(isUser
      ? {
          background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
          color: theme.colors.white,
          boxShadow: `0 2px 8px rgba(138,21,56,0.25)`,
        }
      : {
          background: theme.colors.white,
          color: theme.colors.gray900,
          boxShadow: `0 1px 4px rgba(0,0,0,0.08)`,
        }),
  }),
  time: (isUser) => ({
    fontSize: theme.fontSize.xs,
    color: isUser ? 'rgba(255,255,255,0.5)' : theme.colors.gray300,
    marginTop: 3,
    textAlign: isUser ? 'right' : 'left',
  }),
  avatar: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    flexShrink: 0,
    boxShadow: `0 2px 6px rgba(138,21,56,0.3)`,
  },

  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  chip: {
    padding: '6px 12px',
    background: `${theme.colors.maroon}0D`,
    border: `1px solid ${theme.colors.maroon}33`,
    borderRadius: theme.radius.full,
    fontSize: theme.fontSize.sm,
    color: theme.colors.maroon,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: theme.fonts.primary,
    whiteSpace: 'nowrap',
    transition: `all ${theme.animation.duration.fast}`,
    outline: 'none',
  },

  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderTop: `1px solid ${theme.colors.gray200}`,
    background: theme.colors.white,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: `1.5px solid ${theme.colors.gray200}`,
    borderRadius: theme.radius.full,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.primary,
    direction: 'rtl',
    outline: 'none',
    transition: `border-color ${theme.animation.duration.fast}`,
    background: theme.colors.gray50,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    border: 'none',
    background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
    color: theme.colors.white,
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `transform ${theme.animation.duration.fast}, opacity ${theme.animation.duration.fast}`,
    outline: 'none',
  },

  typing: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
    padding: '10px 14px',
    background: theme.colors.white,
    borderRadius: `${theme.radius.sm} ${theme.radius.xl} ${theme.radius.xl} ${theme.radius.xl}`,
    maxWidth: '30%',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  dot: (delay) => ({
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    background: theme.colors.gold,
    animation: `${theme.animation.bounce} 1.2s ${delay}s infinite`,
  }),
};

// ────────────────────────────────────────────────────────────────────
// Keyframes (injected once)
// ────────────────────────────────────────────────────────────────────
const webChatKeyframes = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40%           { transform: translateY(-6px); }
  }
`;

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────
export default function WebChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadConversation);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Persist conversation on change
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          text: '🎓 **مرحباً بك في المرشد الجامعي!**\n\nكيف يمكنني مساعدتك اليوم؟ اسألني عن الجامعات أو التخصصات أو المنح في قطر.',
          suggestions: ['جامعات قطر', 'المنح والابتعاث', 'تخصصات المستقبل'],
          time: now(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Focus trap — keep focus inside the chat window when open
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ── Send message ──────────────────────────────────────────────────
  const sendMessage = useCallback(
    (text) => {
      const trimmed = (text || '').trim();
      if (!trimmed) return;

      const userMsg = { id: Date.now(), type: 'user', text: trimmed, time: now() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      // Simulate AI response delay
      setTimeout(() => {
        const { answer, suggestions } = getMockResponse(trimmed);
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: answer,
          suggestions,
          time: now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 800 + Math.random() * 600);
    },
    []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <style>{webChatKeyframes}</style>

      {/* Floating bubble */}
      <ChatBubble onClick={() => setIsOpen((o) => !o)} isOpen={isOpen} />

      {/* Chat window */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="نافذة المحادثة مع المرشد الجامعي"
          aria-modal="true"
          style={s.overlay}
        >
          {/* Header */}
          <div style={s.header}>
            <span style={s.headerIcon} aria-hidden="true">🎓</span>
            <span style={s.headerTitle}>المرشد الجامعي</span>
            <button
              style={s.headerClose}
              onClick={() => setIsOpen(false)}
              aria-label="أغلق المحادثة"
              title="إغلاق"
            >
              ✕
            </button>
          </div>

          {/* Messages list */}
          <div ref={listRef} style={s.messagesList} role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div style={s.msgRow(msg.type === 'user')}>
                  {msg.type === 'bot' && (
                    <div style={s.avatar} aria-hidden="true">🎓</div>
                  )}
                  <div>
                    <div style={s.bubble(msg.type === 'user')}>
                      {renderText(msg.text)}
                    </div>
                    <div style={s.time(msg.type === 'user')}>{msg.time}</div>
                  </div>
                </div>

                {/* Suggestion chips */}
                {msg.type === 'bot' && msg.suggestions?.length > 0 && (
                  <div style={s.suggestions}>
                    {msg.suggestions.map((sug, si) => (
                      <button
                        key={si}
                        style={s.chip}
                        onClick={() => sendMessage(sug)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${theme.colors.maroon}1A`;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = s.chip.background;
                          e.currentTarget.style.transform = '';
                        }}
                        aria-label={`اسأل عن: ${sug}`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={s.msgRow(false)}>
                <div style={s.avatar} aria-hidden="true">🎓</div>
                <div style={s.typing} aria-label="المرشد يكتب...">
                  <span style={s.dot(0)} />
                  <span style={s.dot(0.2)} />
                  <span style={s.dot(0.4)} />
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <form onSubmit={handleSubmit} style={s.inputBar}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              style={s.input}
              onFocus={(e) => (e.target.style.borderColor = theme.colors.maroon)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.gray200)}
              aria-label="اكتب سؤالك"
              dir="rtl"
              autoComplete="off"
            />
            <button
              type="submit"
              style={{
                ...s.sendBtn,
                opacity: input.trim() ? 1 : 0.5,
              }}
              disabled={!input.trim()}
              aria-label="إرسال"
              title="إرسال"
              onMouseEnter={(e) => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
