import React from 'react';
import {
  CompareIcon,
  ChartIcon,
  MoneyIcon,
  LanguageIcon,
  UniversityIcon,
  GlobeIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  QatarFlagIcon,
} from './icons/Icons';

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
        <h2 style={{ ...S.vt, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#8A1538,#6B1030)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CompareIcon size={20} color="#FFFFFF" />
          </span>
          المقارنة
        </h2>
      </div>
      {unis.length === 0 ? (
        <div style={S.em}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <CompareIcon size={48} color="var(--text-secondary, #9CA3AF)" />
          </div>
          <p>اضغط على ايقونة المقارنة بجانب الجامعات لإضافتها</p>
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
              background: 'var(--card-bg,#fff)',
              borderRadius: 'var(--radius-md, 12px)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.1))',
              border: '1px solid var(--border, #E5E7EB)',
            }}
          >
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border,#f0f0f0)' }}>
              <div style={S.cl}>الجامعة</div>
              {unis.map((u) => (
                <div key={u.id} style={{ ...S.cc, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <UniversityIcon size={22} color="var(--maroon, #8A1538)" />
                  <strong style={{ fontSize: 12 }}>{u.name}</strong>
                </div>
              ))}
            </div>
            {[
              { l: 'المعدل',    k: 'minGrade', f: (v) => v + '%+',                              Icon: ChartIcon,    iconColor: '#8A1538' },
              { l: 'الرسوم',    k: 'tuition',                                                   Icon: MoneyIcon,    iconColor: '#C5A55A' },
              { l: 'اللغة',     k: 'language',                                                   Icon: LanguageIcon,  iconColor: '#1D4ED8' },
              { l: 'سكن',       k: 'housing',  f: (v) => v
                ? <CheckIcon size={14} color="#059669" />
                : <CloseIcon size={14} color="#DC2626" />,                                       Icon: UniversityIcon, iconColor: '#059669' },
              { l: 'متاح لـ',   k: 'qatariOnly', f: (v) => v
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><QatarFlagIcon size={14} /> فقط</span>
                : <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><GlobeIcon size={14} color="var(--text-secondary, #6B7280)" /> الجميع</span>,
                                                                                                  Icon: GlobeIcon,    iconColor: '#6B7280' },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--border,#f0f0f0)',
                  background: i % 2 === 0 ? 'var(--surface,#f9fafb)' : 'var(--card-bg,#fff)',
                }}
              >
                <div style={{ ...S.cl, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <r.Icon size={14} color={r.iconColor} />
                  {r.l}
                </div>
                {unis.map((u) => (
                  <div key={u.id} style={S.cc}>
                    {r.f ? r.f(u[r.k]) : u[r.k]}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button
            style={{ ...S.gb, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => {
              setActiveView('chat');
              sendMessage(
                `قارن بالتفصيل بين ${unis.map((u) => u.name).join(' و')} — الخطة الدراسية والمواد وفرص العمل`
              );
            }}
          >
            <CompareIcon size={16} color="#FFFFFF" />
            مقارنة تفصيلية في المحادثة
          </button>
          <button
            style={{ ...S.gb, background: '#dc2626', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={() => setCompareList([])}
          >
            <TrashIcon size={14} color="#FFFFFF" />
            مسح المقارنة
          </button>
        </>
      )}
    </div>
  );
}
