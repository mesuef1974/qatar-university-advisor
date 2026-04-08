import React from 'react';
import SuggestionBar from './SuggestionBar.jsx';
import theme from '../styles/theme.js';
import {
  GraduationCapIcon,
  SendIcon,
  PdfIcon,
  LoadingIcon,
  BookIcon,
  SearchIcon,
  LightBulbIcon,
  CompareIcon,
} from './icons/Icons';

// ════════════════════════════════════════════════════════════════════
// ChatView — Professional Chat Interface v2.0
// ════════════════════════════════════════════════════════════════════


// ─── Render text (XSS-safe: no dangerouslySetInnerHTML) ───

// Apply inline markdown: **bold** and [link](url)
function applyInline(line, baseIdx) {
  const parts = [];
  const inlineRe = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0, pIdx = baseIdx * 1000;
  let m;
  while ((m = inlineRe.exec(line)) !== null) {
    if (m.index > last) {
      parts.push(<React.Fragment key={pIdx++}>{line.slice(last, m.index)}</React.Fragment>);
    }
    if (m[1] !== undefined) {
      parts.push(<strong key={pIdx++}>{m[1]}</strong>);
    } else {
      parts.push(
        <a key={pIdx++} href={m[3]} target="_blank" rel="noopener noreferrer"
           style={{color:'var(--gold,#C5A55A)',textDecoration:'underline'}}>
          {m[2]}
        </a>
      );
    }
    last = inlineRe.lastIndex;
  }
  if (last < line.length) {
    parts.push(<React.Fragment key={pIdx++}>{line.slice(last)}</React.Fragment>);
  }
  return parts;
}

// Parse a table block: array of raw lines -> <table> element
function renderTable(lines, idx) {
  const rows = lines
    .filter(l => l.trim() !== '' && !/^\s*\|[-| :]+\|\s*$/.test(l))
    .map(l =>
      l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
    );
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div key={idx} style={{overflowX:'auto',margin:'8px 0',borderRadius:8,border:'1px solid var(--border, rgba(0,0,0,0.08))'}}>
      <table style={{borderCollapse:'collapse',width:'100%',fontSize:13,fontFamily:"'Tajawal',sans-serif"}}>
        <thead>
          <tr>
            {header.map((cell, ci) => (
              <th key={ci} style={{
                padding:'10px 14px', background:'rgba(138,21,56,0.06)',
                borderBottom:'2px solid rgba(138,21,56,0.2)',
                textAlign:'right', fontWeight:700, whiteSpace:'nowrap',
                color:'var(--maroon, #8A1538)',
              }}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} style={{background: ri%2===0 ? 'transparent' : 'rgba(0,0,0,0.015)'}}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding:'8px 14px',
                  borderBottom:'1px solid var(--border, rgba(0,0,0,0.06))',
                  textAlign:'right',
                  fontSize:12.5,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderLine(line, idx) {
  if (!line || line.trim() === '') {
    return <p key={idx} style={{margin:'2px 0',lineHeight:1.7}}>&nbsp;</p>;
  }
  // ## Heading (h1-h3)
  if (/^#{1,3}\s/.test(line)) {
    const text = line.replace(/^#{1,3}\s+/, '');
    return (
      <p key={idx} style={{margin:'8px 0 4px',lineHeight:1.5}}>
        <span style={{fontSize:'1.1em',fontWeight:700,color:'var(--maroon, #8A1538)'}}>{applyInline(text, idx)}</span>
      </p>
    );
  }
  // --- horizontal separator
  if (/^---+$/.test(line.trim())) {
    return (
      <hr key={idx} style={{
        border:'none', borderTop:'1px solid rgba(138,21,56,0.12)',
        margin:'10px 0',
      }} />
    );
  }
  // - item or bullet item (list)
  if (/^[-•]\s/.test(line.trim())) {
    const text = line.trim().replace(/^[-•]\s+/, '');
    return (
      <p key={idx} style={{margin:'3px 0',lineHeight:1.8,paddingRight:16,display:'flex',alignItems:'flex-start',gap:8}}>
        <span style={{
          width:6, height:6, borderRadius:'50%',
          background:'var(--maroon, #8A1538)', flexShrink:0, marginTop:9,
          opacity:0.6,
        }}/>
        <span>{applyInline(text, idx)}</span>
      </p>
    );
  }
  // Default: inline formatting only
  return (
    <p key={idx} style={{margin:'2px 0',lineHeight:1.8}}>
      {applyInline(line, idx)}
    </p>
  );
}

const renderText = (text) => {
  const rawLines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < rawLines.length) {
    // Detect table block (lines starting with |)
    if (/^\|.+\|/.test(rawLines[i].trim())) {
      const tableLines = [];
      while (i < rawLines.length && /^\|/.test(rawLines[i].trim())) {
        tableLines.push(rawLines[i]);
        i++;
      }
      result.push(renderTable(tableLines, result.length));
    } else {
      result.push(renderLine(rawLines[i], result.length));
      i++;
    }
  }
  return result;
};

// ─── Welcome Card Component ───
function WelcomeCard({ sendMessage }) {
  const quickStarts = [
    { text: 'ما الجامعات المتاحة؟', Icon: SearchIcon, color: '#8A1538' },
    { text: 'قارن بين الجامعات', Icon: CompareIcon, color: '#7C3AED' },
    { text: 'أريد نصيحة أكاديمية', Icon: LightBulbIcon, color: '#C5A55A' },
    { text: 'ما التخصصات المطلوبة؟', Icon: BookIcon, color: '#059669' },
  ];

  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'32px 20px', minHeight:'60vh',
    }}>
      <div style={{
        background:'var(--card-bg, #FFFFFF)',
        borderRadius:24,
        padding:'40px 32px',
        maxWidth:420, width:'100%',
        boxShadow:'0 8px 40px rgba(138,21,56,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        border:'1px solid var(--border, rgba(0,0,0,0.06))',
        textAlign:'center',
      }}>
        {/* Avatar */}
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:`linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 20px',
          boxShadow:'0 8px 24px rgba(138,21,56,0.3)',
        }}>
          <GraduationCapIcon size={36} color="#FFFFFF" />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize:22, fontWeight:800, margin:'0 0 8px',
          color:'var(--text, #1C1C1E)',
          fontFamily:"'Cairo','Tajawal',sans-serif",
        }}>
          المستشار الجامعي القطري
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize:14, color:'var(--text-secondary, #6B7280)',
          margin:'0 0 28px', lineHeight:1.7,
        }}>
          مرحبا! أنا مساعدك الذكي للإرشاد الأكاديمي.
          اسألني عن الجامعات، التخصصات، المنح، أو أي استفسار أكاديمي.
        </p>

        {/* Quick Start Buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {quickStarts.map((item, i) => (
            <button
              key={i}
              onClick={() => sendMessage(item.text)}
              style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'14px 18px',
                background:'var(--surface, #F5F0EB)',
                border:'1.5px solid var(--border, rgba(0,0,0,0.06))',
                borderRadius:14,
                cursor:'pointer',
                fontSize:14, fontWeight:600,
                color:'var(--text, #1C1C1E)',
                fontFamily:"'Tajawal',sans-serif",
                textAlign:'right', direction:'rtl',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--maroon, #8A1538)';
                e.currentTarget.style.background = 'rgba(138,21,56,0.04)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(138,21,56,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.06))';
                e.currentTarget.style.background = 'var(--surface, #F5F0EB)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{
                width:36, height:36, borderRadius:10,
                background: `${item.color}12`,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <item.Icon size={18} color={item.color} />
              </span>
              <span>{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatView({
  messages,
  isTyping,
  input,
  setInput,
  sendMessage,
  messagesEndRef,
  userProfile,
  pdfLoading,
  setPdfLoading,
  suggStyle,
}) {
  // Show welcome card if only one welcome message exists
  const showWelcome = messages.length <= 1 && !isTyping;

  return (
    <>
      {/* Messages scroll area */}
      <div
        id="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="سجل المحادثة"
        style={{
          flex:1, overflowY:'auto',
          padding:'20px 16px 12px',
          background:'var(--bg, #FFFFFF)',
        }}
      >
        {showWelcome ? (
          <WelcomeCard sendMessage={sendMessage} />
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{
              display:'flex', gap:10, marginBottom:20,
              alignItems:'flex-start',
              flexDirection: msg.type==='user' ? 'row-reverse' : 'row',
              animation: msg.type==='bot' ? 'msgSlideIn 0.35s ease-out' : 'msgIn 0.25s ease-out',
            }}>
              {/* Bot avatar */}
              {msg.type==='bot' && (
                <div style={{
                  width:40, height:40,
                  background:`linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
                  borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0,
                  boxShadow:'0 4px 12px rgba(138,21,56,0.25)',
                  marginTop:2,
                }}>
                  <GraduationCapIcon size={20} color="#FFFFFF" />
                </div>
              )}

              <div style={{maxWidth:'78%', minWidth: 0}}>
                {/* Bot name label */}
                {msg.type==='bot' && (
                  <div style={{
                    fontSize:11.5, fontWeight:600,
                    color:'var(--maroon, #8A1538)',
                    marginBottom:4, paddingRight:4,
                    opacity:0.7,
                  }}>
                    المستشار الجامعي
                  </div>
                )}

                {/* Bubble */}
                <div style={{
                  padding:'14px 18px',
                  borderRadius: msg.type==='user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  fontSize:14, wordBreak:'break-word', lineHeight:1.8,
                  ...(msg.type==='user'
                    ? {
                        background:`linear-gradient(135deg, ${theme.colors.maroon} 0%, ${theme.colors.maroonDark} 100%)`,
                        color:theme.colors.white,
                        boxShadow:'0 4px 16px rgba(138,21,56,0.2)',
                      }
                    : {
                        background:'var(--card-bg, #FFFFFF)',
                        color:'var(--text, #1C1C1E)',
                        boxShadow:'0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                        border:'1px solid var(--border, rgba(0,0,0,0.06))',
                      }),
                }}>
                  {renderText(msg.content.text)}
                  {msg.type === 'bot' && msg.content.text.includes('تقريرك الأكاديمي الشخصي') && (
                    <button
                      onClick={async () => {
                        try {
                          setPdfLoading(true);
                          const { generateStudentPDF } = await import('../utils/generatePDF.js');
                          generateStudentPDF(
                            {
                              nationality: userProfile.nationality,
                              gpa: userProfile.grade,
                              track: userProfile.track,
                              preferredMajor: userProfile.preferredMajor || null,
                              userType: userProfile.type,
                            },
                            null,
                            ''
                          );
                        } catch (err) {
                          console.error('PDF generation failed:', err);
                        } finally {
                          setPdfLoading(false);
                        }
                      }}
                      disabled={pdfLoading}
                      style={{
                        marginTop: 12,
                        padding: '10px 20px',
                        background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.gold})`,
                        color: theme.colors.white,
                        border: 'none',
                        borderRadius: 12,
                        cursor: pdfLoading ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontFamily: "'Tajawal','Segoe UI',sans-serif",
                        boxShadow: '0 4px 16px rgba(138,21,56,0.25)',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                        opacity: pdfLoading ? 0.7 : 1,
                      }}
                      onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(138,21,56,0.35)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(138,21,56,0.25)'; }}
                    >
                      {pdfLoading
                        ? <><LoadingIcon size={15} color="#FFFFFF" /> جار التحضير...</>
                        : <><PdfIcon size={15} color="#FFFFFF" /> تنزيل تقريري PDF</>
                      }
                    </button>
                  )}
                  {/* Timestamp */}
                  <div style={{
                    fontSize:11, marginTop:8,
                    color: msg.type==='user'
                      ? 'rgba(255,255,255,0.5)'
                      : 'var(--text-secondary, #B0B8C4)',
                    textAlign: msg.type==='user' ? 'right' : 'left',
                  }}>{msg.time}</div>
                </div>

                {/* Suggestion chips */}
                <SuggestionBar
                  suggestions={msg.suggestions}
                  align={msg.type==='user' ? 'end' : 'start'}
                  onSelect={sendMessage}
                  style={suggStyle}
                />
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{display:'flex', gap:10, marginBottom:20, alignItems:'flex-start'}}>
            <div style={{
              width:40, height:40,
              background:`linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`,
              borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
              boxShadow:'0 4px 12px rgba(138,21,56,0.25)',
            }}>
              <GraduationCapIcon size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{
                fontSize:11.5, fontWeight:600,
                color:'var(--maroon, #8A1538)',
                marginBottom:4, paddingRight:4,
                opacity:0.7,
              }}>
                المستشار الجامعي
              </div>
              <div style={{
                background:'var(--card-bg, #FFFFFF)',
                padding:'16px 22px',
                borderRadius:'16px 16px 16px 4px',
                display:'flex', gap:6, alignItems:'center',
                boxShadow:'0 2px 12px rgba(0,0,0,0.04)',
                border:'1px solid var(--border, rgba(0,0,0,0.06))',
              }}>
                {[0,0.15,0.3].map((d,di) => (
                  <span key={di} style={{
                    width:8, height:8,
                    background: di === 1 ? theme.colors.maroon : theme.colors.gold,
                    borderRadius:'50%', display:'inline-block',
                    animation:`bounce 1.2s ${d}s infinite`,
                    opacity:0.7,
                  }}/>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* ─── Input Area ─── */}
      <div style={{
        padding:'12px 16px',
        paddingBottom:'max(12px, env(safe-area-inset-bottom, 12px))',
        background:'var(--card-bg, #FFFFFF)',
        borderTop:'1px solid var(--border, rgba(0,0,0,0.06))',
        flexShrink:0,
        boxShadow:'0 -4px 20px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--surface, #F5F0EB)',
          borderRadius:24,
          border:'2px solid transparent',
          padding:'4px 6px 4px 6px',
          transition:'all 0.25s ease',
          boxShadow:'0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <input
            type="text"
            aria-label="اكتب سؤالك هنا"
            aria-required="true"
            style={{
              flex:1, padding:'12px 16px',
              border:'none', background:'transparent',
              fontSize:14.5, outline:'none',
              color:'var(--text, #1C1C1E)', textAlign:'right',
              fontFamily:"'Tajawal',sans-serif",
              lineHeight:1.4,
              minHeight:24,
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && sendMessage()}
            onFocus={e => {
              const p = e.target.parentElement;
              p.style.borderColor = 'var(--maroon, #8A1538)';
              p.style.background = 'var(--card-bg, #FFFFFF)';
              p.style.boxShadow = '0 0 0 4px rgba(138,21,56,0.08)';
            }}
            onBlur={e => {
              const p = e.target.parentElement;
              p.style.borderColor = 'transparent';
              p.style.background = 'var(--surface, #F5F0EB)';
              p.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
            }}
            placeholder="اسأل عن الجامعات، التخصصات، المنح..."
          />
          <button
            type="submit"
            aria-label="إرسال الرسالة"
            title="إرسال"
            style={{
              width:44, height:44, borderRadius:'50%', border:'none',
              cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: input.trim()
                ? `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.maroonDark})`
                : 'var(--border, #E5E7EB)',
              boxShadow: input.trim()
                ? '0 4px 14px rgba(138,21,56,0.3)'
                : 'none',
              transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              transform: input.trim() ? 'scale(1)' : 'scale(0.95)',
            }}
            onClick={() => sendMessage()}
          >
            <SendIcon size={18} color={input.trim() ? '#FFFFFF' : '#9CA3AF'} />
          </button>
        </div>
      </div>
    </>
  );
}
