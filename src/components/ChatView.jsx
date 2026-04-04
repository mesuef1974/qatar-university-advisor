import React from 'react';
import SuggestionBar from './SuggestionBar.jsx';

// ════════════════════════════════════════════════════════════════════
// ChatView — Chat messages area + input + send button
// ════════════════════════════════════════════════════════════════════

// ─── Render text (XSS-safe: no dangerouslySetInnerHTML) ───
function renderLine(line, idx) {
  if (!line) return <p key={idx} style={{margin:'2px 0',lineHeight:1.7}}>&nbsp;</p>;
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
  return <p key={idx} style={{margin:'2px 0',lineHeight:1.7}}>{parts}</p>;
}
const renderText = (text) => text.split('\n').map((line, i) => renderLine(line, i));

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
        style={{flex:1,overflowY:'auto',padding:'16px 14px 8px',background:'#EDE5DA',backgroundImage:'radial-gradient(circle,rgba(138,21,56,0.055) 1.5px,transparent 1.5px)',backgroundSize:'24px 24px'}}
      >
        {messages.map(msg=>(
          <div key={msg.id} style={{
            display:'flex', gap:8, marginBottom:16,
            alignItems:'flex-end',
            flexDirection: msg.type==='user' ? 'row-reverse' : 'row',
            animation:'msgIn 0.25s ease-out',
          }}>
            {/* Bot avatar */}
            {msg.type==='bot'&&(
              <div style={{
                width:32, height:32,
                background:'linear-gradient(135deg,#8A1538,#6B1030)',
                borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:15, flexShrink:0,
                boxShadow:'0 2px 8px rgba(138,21,56,0.3)',
              }}>🎓</div>
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
                      background:'linear-gradient(135deg,#8A1538 0%,#6B1030 100%)',
                      color:'#fff',
                      boxShadow:'0 4px 14px rgba(138,21,56,0.22)',
                    }
                  : {
                      background:'#fff',
                      color:'#1C1C1E',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.06),0 4px 14px rgba(0,0,0,0.06)',
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
                      background: 'linear-gradient(135deg, #8A1538, #C5A55A)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
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
                    {pdfLoading ? '⏳ جارٍ التحضير...' : '📄 تنزيل تقريري PDF'}
                  </button>
                )}
                <div style={{
                  fontSize:10, marginTop:5,
                  color: msg.type==='user'
                    ? 'rgba(255,255,255,0.5)'
                    : '#B0B8C4',
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
              background:'linear-gradient(135deg,#8A1538,#6B1030)',
              borderRadius:'50%', display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:15, flexShrink:0,
              boxShadow:'0 2px 8px rgba(138,21,56,0.3)',
            }}>🎓</div>
            <div style={{
              background:'#fff', padding:'13px 18px',
              borderRadius:'4px 18px 18px 18px',
              display:'flex', gap:5, alignItems:'center',
              boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
            }}>
              {[0,0.2,0.4].map((d,di)=>(
                <span key={di} style={{
                  width:7, height:7,
                  background:'#C5A55A',
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
        background:'#fff',
        borderTop:'1px solid rgba(0,0,0,0.06)',
        flexShrink:0,
        boxShadow:'0 -2px 16px rgba(0,0,0,0.05)',
      }}>
        <div style={{
          display:'flex', alignItems:'center',
          background:'#F5F0EB',
          borderRadius:28,
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
              color:'#1C1C1E', textAlign:'right',
              fontFamily:"'Tajawal',sans-serif",
            }}
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&sendMessage()}
            onFocus={e=>{const p=e.target.parentElement;p.style.borderColor='#8A1538';p.style.background='#fff';p.style.boxShadow='0 0 0 3px rgba(138,21,56,0.08)';}}
            onBlur={e=>{const p=e.target.parentElement;p.style.borderColor='rgba(138,21,56,0.13)';p.style.background='#F5F0EB';p.style.boxShadow='none';}}
            placeholder="اسأل عن خطة دراسية، مواد، مقارنة..."
          />
          <button
            type="submit"
            aria-label="إرسال الرسالة"
            title="إرسال"
            style={{
              width:42, height:42, borderRadius:'50%', border:'none',
              cursor:'pointer', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: input.trim()
                ? 'linear-gradient(135deg,#8A1538,#6B1030)'
                : '#E5E7EB',
              boxShadow: input.trim()
                ? '0 3px 12px rgba(138,21,56,0.32)'
                : 'none',
              transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onClick={()=>sendMessage()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={input.trim()?'#fff':'#9CA3AF'} aria-hidden="true" focusable="false">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
