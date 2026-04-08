import React from 'react';
import StatsBanner from './StatsBanner.jsx';

// ════════════════════════════════════════════════════════════════════
// InfoPanel — Nationality selection welcome screen
// (shown before the user picks qatari / non-qatari)
// ════════════════════════════════════════════════════════════════════

export default function InfoPanel({ selectNationality }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'100dvh', width:'100%',
      ...(()=>{
        const vw = typeof window!=='undefined' ? window.innerWidth : 400;
        if (vw>=1024) return {maxWidth:'100%',margin:0,borderRadius:0,boxShadow:'none'};
        if (vw>=768)  return {maxWidth:520,margin:'0 auto',borderRadius:20,boxShadow:'0 24px 64px rgba(0,0,0,0.35)'};
        return {maxWidth:'100%',margin:0,borderRadius:0,boxShadow:'none'};
      })(),
      background:'linear-gradient(160deg,#8A1538 0%,#6B1030 52%,#4A0B22 100%)',
      direction:'rtl', overflow:'hidden',
      fontFamily:"'Tajawal','Segoe UI',sans-serif",
      position:'relative',
    }}>
      {/* Top gold bar */}
      <div style={{height:3,background:'linear-gradient(90deg,transparent,#C5A55A 40%,#C5A55A 60%,transparent)',flexShrink:0}}/>

      {/* Decorative circles */}
      <div style={{position:'absolute',top:-90,right:-90,width:280,height:280,borderRadius:'50%',background:'rgba(197,165,90,0.05)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:60,left:-50,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.03)',pointerEvents:'none'}}/>

      {/* Main content */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'20px 24px 16px', position:'relative', zIndex:1,
        overflowY:'auto', msOverflowStyle:'none', scrollbarWidth:'none',
      }}>
        {/* Logo circle */}
        <div style={{
          width:72, height:72, borderRadius:'50%', marginBottom:14,
          background:'rgba(197,165,90,0.12)',
          border:'2px solid rgba(197,165,90,0.35)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:36, flexShrink:0,
          boxShadow:'0 0 40px rgba(197,165,90,0.15)',
          animation:'capFloat 2.8s ease-in-out infinite',
        }}>🎓</div>
        <style>{`@keyframes capFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>

        {/* Title */}
        <h1 style={{
          fontSize:22, fontWeight:800, color:'#fff',
          margin:'0 0 4px', textAlign:'center',
          fontFamily:"'Cairo','Tajawal',sans-serif", lineHeight:1.3, flexShrink:0,
        }}>المستشار الجامعي القطري</h1>

        {/* Gold divider */}
        <div style={{display:'flex',alignItems:'center',gap:8,margin:'8px 0 10px',width:200,flexShrink:0}}>
          <div style={{flex:1,height:1,background:'rgba(197,165,90,0.3)'}}/>
          <div style={{width:5,height:5,borderRadius:'50%',background:'#C5A55A'}}/>
          <div style={{flex:1,height:1,background:'rgba(197,165,90,0.3)'}}/>
        </div>

        <p style={{
          fontSize:13, color:'rgba(255,255,255,0.68)',
          textAlign:'center', margin:'0 0 2px', lineHeight:1.7, flexShrink:0,
        }}>
          دليلك الشامل للجامعات والتخصصات والمنح الدراسية في قطر
        </p>

        {/* Stats row */}
        <StatsBanner />

        <p style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.86)',margin:'0 0 12px',textAlign:'center',flexShrink:0}}>
          اختر نوع إقامتك للمتابعة
        </p>

        {/* Selection cards */}
        <div style={{display:'flex',gap:12,width:'100%',maxWidth:340,flexShrink:0}}>
          {[
            {val:'qatari',     flag:'🇶🇦',title:'قطري / قطرية',   sub:'تعليم مجاني · ابتعاث أميري'},
            {val:'non_qatari', flag:'🌍', title:'مقيم في قطر', sub:'منح مؤسسة قطر · HBKU'},
          ].map(({val,flag,title,sub})=>(
            <button key={val}
              onClick={()=>selectNationality(val)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.25)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}
              style={{
                flex:1, borderRadius:16, padding:'18px 10px',
                color:'#fff', cursor:'pointer', textAlign:'center',
                fontFamily:"'Tajawal',sans-serif",
                background: val==='qatari'
                  ? 'linear-gradient(145deg,rgba(197,165,90,0.18),rgba(197,165,90,0.06))'
                  : 'rgba(255,255,255,0.07)',
                border: val==='qatari'
                  ? '1.5px solid rgba(197,165,90,0.55)'
                  : '1.5px solid rgba(255,255,255,0.2)',
                transition:'transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s ease',
                backdropFilter:'blur(8px)',
              }}
            >
              <div style={{fontSize:32,marginBottom:8}}>{flag}</div>
              <div style={{fontSize:13,fontWeight:700,lineHeight:1.3}}>{title}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:5,lineHeight:1.5}}>{sub}</div>
            </button>
          ))}
        </div>

        <p style={{marginTop:14,fontSize:12,color:'rgba(255,255,255,0.3)',flexShrink:0}}>
          يمكنك تغيير اختيارك في أي وقت
        </p>
      </div>

      {/* Bottom gold bar */}
      <div style={{height:3,background:'linear-gradient(90deg,transparent,#C5A55A 40%,#C5A55A 60%,transparent)',flexShrink:0}}/>
    </div>
  );
}
