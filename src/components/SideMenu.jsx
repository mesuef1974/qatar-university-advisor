import React from 'react';

export default function SideMenu({
  UNIVERSITIES_DB,
  topQuestions,
  setShowMenu,
  setActiveView,
  sendMessage,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200,
        display: 'flex',
      }}
      onClick={() => setShowMenu(false)}
    >
      <div
        style={{ width: 280, background: '#fff', height: '100%', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 20,
            background: '#075e54',
            color: '#fff',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 30 }}>🎓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>المستشار الجامعي</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
              v5.0 | قاعدة معرفة شاملة
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            💡 أسئلة شائعة
          </div>
          {topQuestions.map((q, i) => (
            <button
              key={i}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                padding: '9px 10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#1a1a1a',
                borderRadius: 8,
                marginBottom: 2,
              }}
              onClick={() => {
                sendMessage(q);
                setActiveView('chat');
                setShowMenu(false);
              }}
            >
              {q}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            📚 الجامعات
          </div>
          {Object.values(UNIVERSITIES_DB).map((u) => (
            <button
              key={u.id}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                padding: '9px 10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                color: '#1a1a1a',
                borderRadius: 8,
                marginBottom: 2,
              }}
              onClick={() => {
                sendMessage(`خطة دراسة ${u.name} والمواد والتخصصات وفرص العمل`);
                setActiveView('chat');
                setShowMenu(false);
              }}
            >
              {u.icon} {u.name}
            </button>
          ))}
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
            🔗 الأقسام
          </div>
          {[
            { l: '💬 المحادثة', v: 'chat' },
            { l: '🏛️ الجامعات', v: 'universities' },
            { l: '📊 المقارنة', v: 'compare' },
            { l: '⭐ المفضلة', v: 'favorites' },
            { l: '🗺️ الخطة التنفيذية', v: 'execution-plan' },
          ].map((t, i) => (
            <button
              key={i}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                padding: '9px 10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#1a1a1a',
                borderRadius: 8,
                marginBottom: 2,
              }}
              onClick={() => {
                setActiveView(t.v);
                setShowMenu(false);
              }}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
