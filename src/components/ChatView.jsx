import React from 'react';
import SuggestionBar from './SuggestionBar.jsx';
import theme from '../styles/theme.js';
import {
  GraduationCapIcon,
  SendIcon,
  PdfIcon,
  LoadingIcon,
} from './icons/Icons';

// ════════════════════════════════════════════════════════════════════
// ChatView — Chat messages area + input + send button
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

// Parse a table block: array of raw lines → <table> element
function renderTable(lines, idx) {
  const rows = lines
    .filter(l => l.trim() !== '' && !/^\s*\|[-| :]+\|\s*$/.test(l))
    .map(l =>
      l.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
    );
  if (rows.length === 0) return null;
  const [header, ...body] = rows;
  return (
    <div key={idx} style={{overflowX:'auto',margin:'6px 0'}}>
      <table style={{borderCollapse:'collapse',width:'100%',fontSize:12.5,fontFamily:"'Tajawal',sans-serif"}}>
        <thead>
          <tr>
            {header.map((cell, ci) => (
              <th key={ci} style={{
                padding:'6px 10px', background:'rgba(138,21,56,0.08)',
                borderBottom:'2px solid rgba(138,21,56,0.25)',
                textAlign:'right', fontWeight:700, whiteSpace:'nowrap',
              }}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} style={{background: ri%2===0 ? 'transparent' : 'rgba(0,0,0,0.02)'}}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding:'5px 10px',
                  borderBottom:'1px solid rgba(0,0,0,0.06)',
                  textAlign:'right',
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
      <p key={idx} style={{margin:'6px 0 2px',lineHeight:1.5}}>
        <span style={{fontSize:'1.1em',fontWeight:700}}>{applyInline(text, idx)}</span>
      </p>
    );
  }
  // --- horizontal separator
  if (/^---+$/.test(line.trim())) {
    return (
      <hr key={idx} style={{
        border:'none', borderTop:'1px solid rgba(138,21,56,0.18)',
        margin:'8px 0',
      }} />
    );
  }
  // - item or • item (list)
  if (/^[-•]\s/.test(line.trim())) {
    const text = line.trim().replace(/^[-•]\s+/, '');
    return (
      <p key={idx} style={{margin:'2px 0',lineHeight:1.7,paddingRight:16,display:'flex',alignItems:'flex-start',gap:6}}>
        <span style={{color:'var(--maroon, #8A1538)',flexShrink:0,marginTop:2}}>•</span>
        <span>{applyInline(text, idx)}</span>
      </p>
    );
  }
  // Default: inline formatting only
  return (
    <p key={idx} style={{margin:'2px 0',lineHeight:1.7}}>
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
  return (
    <>
      {/* Messages scroll area */}
      <div
        id="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="سجل المحادثة"
        style={{flex:1,overflowY:'auto',padding:'16px 14px 8px',background:'var(--bg,#FFFFFF)'}}
      >
        {messages.map(msg=>(
          <div key={msg.id} style={{
            display:'flex', gap:8, marginBottom:16,
            alignItems:'flex-end',
            flexDirection: msg.type==='user' ? 'row-reverse' : 'row',
            animation: msg.type==='bot' ? 'msgSlideIn 0.3s ease-out' : 'msgIn 0.25s ease-out',
          }}>
            {/* Bot avatar */}
            {msg.type==='bot'&&(
              <div style={{
                width:32, height:32,
                background:`linear-gradient(135deg,${theme.colors.maroon},${theme.colors.maroonDark})`,
                borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
                boxShadow:'0 2px 8px rgba(138,21,56,0.3)',
              }}>
                <GraduationCapIcon size={18} color="#FFFFFF" />
              </div>
            )}

            <div style={{maxWidth:'78%'}}>
              {/* Bubble */}
              <div style={{
                padding:'12px 16px',
                borderRadius: msg.type==='user'
                  ? '18px 4px 18px 18px'
                  : '4px 18px 18px 18px',
                fontSize:13.5, wordBreak:'break-word', lineHeight:1.75,
                ...(msg.type==='user'
                  ? {
                      background:`linear-gradient(135deg,${theme.colors.maroon} 0%,${theme.colors.maroonDark} 100%)`,
                      color:theme.colors.white,
                      boxShadow:'0 4px 14px rgba(138,21,56,0.22)',
                    }
                  : {
                      background:'var(--card-bg,#FFFFFF)',
                      color:'var(--text,#1C1C1E)',
                      boxShadow:'var(--shadow-md, 0 1px 4px rgba(0,0,0,0.06))',
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
                      marginTop: '10px',
                      padding: '9px 18px',
                      background: `linear-gradient(135deg, ${theme.colors.maroon}, ${theme.colors.gold})`,
                      color: theme.colors.white,
                      border: 'none',
                      borderRadius: 'var(--radius-sm, 10px)',
                      cursor: pdfLoading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      fontFamily: "'Tajawal','Segoe UI',sans-serif",
                      boxShadow: '0 4px 14px rgba(138,21,56,0.28)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      opacity: pdfLoading ? 0.75 : 1,
                    }}
                    onMouseEnter={e => { if (!pdfLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(138,21,56,0.38)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(138,21,56,0.28)'; }}
                  >
                    {pdfLoading
                      ? <><LoadingIcon size={14} color="#FFFFFF" /> جارٍ التحضير...</>
                      : <><PdfIcon size={14} color="#FFFFFF" /> تنزيل تقريري PDF</>
                    }
                  </button>
                )}
                <div style={{
                  fontSize:11, marginTop:5,
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
        ))}

        {/* Typing indicator */}
        {isTyping&&(
          <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'flex-end'}}>
            <div style={{
              width:32, height:32,
              background:`linear-gradient(135deg,${theme.colors.maroon},${theme.colors.maroonDark})`,
              borderRadius:10, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0,
              boxShadow:'0 2px 8px rgba(138,21,56,0.3)',
            }}>
              <GraduationCapIcon size={18} color="#FFFFFF" />
            </div>
            <div style={{
              background:'var(--card-bg,#FFFFFF)', padding:'13px 18px',
              borderRadius:'4px 18px 18px 18px',
              display:'flex', gap:5, alignItems:'center',
              boxShadow:'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08))',
              border:'1px solid var(--border, rgba(0,0,0,0.06))',
            }}>
              {[0,0.2,0.4].map((d,di)=>(
                <span key={di} style={{
                  width:7, height:7,
                  background:theme.colors.gold,
                  borderRadius:'50%', display:'inline-block',
                  animation:`bounce 1.2s ${d}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input area */}
      <div style={{
        padding:'10px 14px',
        paddingBottom:'max(10px,env(safe-area-inset-bottom,10px))',
        background:'var(--card-bg,#FFFFFF)',
        borderTop:'1px solid var(--border,rgba(0,0,0,0.06))',
        flexShrink:0,
        boxShadow:'0 -2px 16px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          display:'flex', alignItems:'center',
          background:'var(--surface,#F5F0EB)',
          borderRadius:'var(--radius-md, 12px)',
          border:'1.5px solid rgba(138,21,56,0.13)',
          padding:'4px 4px 4px 8px',
          transition:'all 0.2s ease',
        }}>
          <input
            type="text"
            aria-label="اكتب سؤالك هنا"
            aria-required="true"
            style={{
              flex:1, padding:'9px 10px',
              border:'none', background:'transparent',
              fontSize:14, outline:'none',
              color:'var(--text,#1C1C1E)', textAlign:'right',
              fontFamily:"'Tajawal',sans-serif",
            }}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&sendMessage()}
            onFocus={e=>{const p=e.target.parentElement;p.style.borderColor='var(--maroon, #8A1538)';p.style.background='var(--card-bg,#FFFFFF)';p.style.boxShadow='0 0 0 3px rgba(138,21,56,0.08)';}}
            onBlur={e=>{const p=e.target.parentElement;p.style.borderColor='rgba(138,21,56,0.13)';p.style.background='var(--surface,#F5F0EB)';p.style.boxShadow='none';}}
            placeholder="اسأل عن خطة دراسية، مواد، مقارنة..."
          />
          <button
            type="submit"
            aria-label="إرسال الرسالة"
            title="إرسال"
            style={{
              width:44, height:44, borderRadius:'var(--radius-md, 12px)', border:'none',
              cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: input.trim()
                ? `linear-gradient(135deg,${theme.colors.maroon},${theme.colors.maroonDark})`
                : 'var(--border, #E5E7EB)',
              boxShadow: input.trim()
                ? '0 3px 12px rgba(138,21,56,0.32)'
                : 'none',
              transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={()=>sendMessage()}
          >
            <SendIcon size={18} color={input.trim() ? '#FFFFFF' : '#9CA3AF'} />
          </button>
        </div>
      </div>
    </>
  );
}
