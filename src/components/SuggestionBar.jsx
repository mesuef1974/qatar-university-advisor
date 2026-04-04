import React from 'react';

// ════════════════════════════════════════════════════════════════════
// SuggestionBar — Suggestion chips rendered below bot messages
// ════════════════════════════════════════════════════════════════════

export default function SuggestionBar({ suggestions, align, onSelect, style }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:6, marginTop:8,
      justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
    }}>
      {suggestions.map((s,si)=>(
        <button key={si} style={style}
          aria-label={`اقتراح: ${s}`}
          onClick={()=>onSelect(s)}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(138,21,56,0.1)';e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 3px 8px rgba(138,21,56,0.12)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(138,21,56,0.03),rgba(138,21,56,0.06))';e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)';}}
        >{s}</button>
      ))}
    </div>
  );
}
