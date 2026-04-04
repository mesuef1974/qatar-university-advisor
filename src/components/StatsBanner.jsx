import React from 'react';

// ════════════════════════════════════════════════════════════════════
// StatsBanner — Stats row shown on the nationality welcome screen
// (23 جامعة, 100+ تخصص, 10+ منحة)
// ════════════════════════════════════════════════════════════════════

const STATS = [['23','جامعة'],['100+','تخصص'],['10+','منحة']];

export default function StatsBanner() {
  return (
    <div style={{display:'flex',gap:0,margin:'14px 0 18px',width:'100%',maxWidth:260,flexShrink:0}}>
      {STATS.map(([n,l],i)=>(
        <React.Fragment key={l}>
          {i>0&&<div style={{width:1,background:'rgba(255,255,255,0.14)'}}/>}
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:800,color:'#C5A55A',fontFamily:"'Cairo',sans-serif",lineHeight:1}}>{n}</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginTop:3}}>{l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
