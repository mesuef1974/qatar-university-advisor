import React from 'react';

export default function CompareView({
  S,
  UNIVERSITIES_DB,
  compareList,
  setCompareList,
  setActiveView,
  sendMessage,
}) {
  const unis = compareList.map((id) => UNIVERSITIES_DB[id]).filter(Boolean);
  return (
    <div style={S.vc}>
      <div style={S.vh}>
        <h2 style={S.vt}>📊 المقارنة</h2>
      </div>
      {unis.length === 0 ? (
        <div style={S.em}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p>اضغط 📊 بجانب الجامعات لإضافتها</p>
          <button style={S.gb} onClick={() => setActiveView('universities')}>
            استعرض الجامعات
          </button>
          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>أو جرّب هذه المقارنات:</p>
            {[
              'مقارنة كورنيل مع طب QU',
              'مقارنة تكساس مع هندسة QU',
              'مقارنة الكليات العسكرية الخمس',
            ].map((q, i) => (
              <button
                key={i}
                style={S.sugg}
                onClick={() => {
                  setActiveView('chat');
                  sendMessage(q);
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
              <div style={S.cl}>الجامعة</div>
              {unis.map((u) => (
                <div key={u.id} style={S.cc}>
                  <div style={{ fontSize: 22 }}>{u.icon}</div>
                  <strong style={{ fontSize: 10 }}>{u.name}</strong>
                </div>
              ))}
            </div>
            {[
              { l: '📊 المعدل', k: 'minGrade', f: (v) => v + '%+' },
              { l: '💰 الرسوم', k: 'tuition' },
              { l: '🗣️ اللغة', k: 'language' },
              { l: '🏠 سكن', k: 'housing', f: (v) => (v ? '✅' : '❌') },
              { l: '🌍 متاح لـ', k: 'qatariOnly', f: (v) => (v ? '🇶🇦 فقط' : '🌍 الجميع') },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #f0f0f0',
                  background: i % 2 === 0 ? '#f9fafb' : '#fff',
                }}
              >
                <div style={S.cl}>{r.l}</div>
                {unis.map((u) => (
                  <div key={u.id} style={S.cc}>
                    {r.f ? r.f(u[r.k]) : u[r.k]}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button
            style={{ ...S.gb, marginTop: 10 }}
            onClick={() => {
              setActiveView('chat');
              sendMessage(
                `قارن بالتفصيل بين ${unis.map((u) => u.name).join(' و')} — الخطة الدراسية والمواد وفرص العمل`
              );
            }}
          >
            📊 مقارنة تفصيلية في المحادثة
          </button>
          <button
            style={{ ...S.gb, background: '#dc2626', marginTop: 6 }}
            onClick={() => setCompareList([])}
          >
            🗑️ مسح المقارنة
          </button>
        </>
      )}
    </div>
  );
}
