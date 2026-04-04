import React from 'react';

// ════════════════════════════════════════════════════════════════════
// LEGAL-A2: صفحة حقوق أصحاب البيانات | Data Subject Rights
// وفق قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL)
// شركة النخبوية للبرمجيات
// ════════════════════════════════════════════════════════════════════

const S = {
  container: {
    minHeight: '100dvh',
    background: '#f8f9fa',
    direction: 'rtl',
    fontFamily: "'Tajawal','Cairo','Segoe UI',Tahoma,Arial,sans-serif",
    color: '#1a1a1a',
  },
  header: {
    background: 'linear-gradient(135deg,#8A1538 0%,#6B1030 100%)',
    color: '#fff',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: 8,
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.2s',
    fontFamily: "'Tajawal',sans-serif",
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    flex: 1,
    textAlign: 'center',
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },
  content: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '24px 20px 64px',
  },
  dateTag: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    color: '#856404',
    marginBottom: 24,
    display: 'inline-block',
    fontWeight: 600,
  },
  intro: {
    background: 'linear-gradient(145deg,rgba(138,21,56,0.06),rgba(197,165,90,0.06))',
    border: '1px solid rgba(138,21,56,0.15)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 1.85,
    color: '#374151',
  },
  rightCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderRight: '4px solid #8A1538',
  },
  rightCardEn: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #C5A55A',
    direction: 'ltr',
    textAlign: 'left',
  },
  articleBadge: {
    display: 'inline-block',
    background: 'linear-gradient(135deg,#8A1538,#6B1030)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 6,
    marginBottom: 10,
    fontFamily: "'Cairo',sans-serif",
  },
  articleBadgeEn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg,#C5A55A,#A8893D)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 6,
    marginBottom: 10,
    fontFamily: "'Segoe UI',Arial,sans-serif",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#8A1538',
    marginTop: 0,
    marginBottom: 12,
    fontFamily: "'Cairo','Tajawal',sans-serif",
  },
  sectionTitleEn: {
    fontSize: 16,
    fontWeight: 700,
    color: '#6B1030',
    marginTop: 0,
    marginBottom: 12,
    fontFamily: "'Segoe UI',Arial,sans-serif",
    direction: 'ltr',
  },
  p: {
    fontSize: 14,
    lineHeight: 1.85,
    color: '#374151',
    margin: '6px 0',
  },
  pEn: {
    fontSize: 14,
    lineHeight: 1.85,
    color: '#374151',
    margin: '6px 0',
    direction: 'ltr',
    fontFamily: "'Segoe UI',Arial,sans-serif",
  },
  howTo: {
    background: '#F0FDF4',
    border: '1px solid #86EFAC',
    borderRadius: 8,
    padding: '10px 14px',
    marginTop: 10,
    fontSize: 13,
    color: '#166534',
    lineHeight: 1.7,
  },
  howToEn: {
    background: '#F0FDF4',
    border: '1px solid #86EFAC',
    borderRadius: 8,
    padding: '10px 14px',
    marginTop: 10,
    fontSize: 13,
    color: '#166534',
    lineHeight: 1.7,
    direction: 'ltr',
    fontFamily: "'Segoe UI',Arial,sans-serif",
  },
  divider: {
    height: 2,
    background: 'linear-gradient(90deg,#8A1538,#C5A55A,transparent)',
    borderRadius: 2,
    margin: '32px 0 28px',
    opacity: 0.4,
  },
  enHeader: {
    fontSize: 20,
    fontWeight: 800,
    color: '#6B1030',
    textAlign: 'center',
    margin: '0 0 20px',
    fontFamily: "'Segoe UI',Arial,sans-serif",
    direction: 'ltr',
  },
  contactBox: {
    background: '#FEF3C7',
    border: '1px solid #F59E0B',
    borderRadius: 10,
    padding: '16px 20px',
    marginTop: 24,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 1.7,
  },
  footer: {
    textAlign: 'center',
    marginTop: 32,
    padding: '16px',
    borderTop: '1px solid rgba(0,0,0,0.08)',
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: "'Tajawal',sans-serif",
  },
  link: {
    color: '#8A1538',
    textDecoration: 'underline',
  },
};

const RIGHTS_AR = [
  {
    article: 'المادة 9',
    title: 'حق الوصول',
    icon: '🔍',
    description: 'يحق لك طلب الاطلاع على جميع البيانات الشخصية المرتبطة بحسابك، بما في ذلك: سجل المحادثات، بيانات الملف الأكاديمي (الجنسية، المعدل، المسار)، وتاريخ التفاعلات.',
    howTo: 'أرسل رسالة "أريد بياناتي" أو "اعرض بياناتي" عبر البوت وسنرد خلال 72 ساعة.',
  },
  {
    article: 'المادة 10',
    title: 'حق التصحيح',
    icon: '✏️',
    description: 'يحق لك تعديل أو تصحيح أي بيانات شخصية غير دقيقة أو غير مكتملة تتعلق بك في أنظمتنا.',
    howTo: 'أرسل رسالة "تصحيح بياناتي" متبوعة بالتفاصيل المراد تعديلها.',
  },
  {
    article: 'المادة 11',
    title: 'حق الحذف',
    icon: '🗑️',
    description: 'يحق لك طلب حذف جميع بياناتك الشخصية من أنظمتنا بشكل كامل ونهائي. يتضمن ذلك المحادثات، الملف الأكاديمي، والمفضلات.',
    howTo: 'أرسل رسالة "احذف بياناتي" عبر البوت. سنؤكد الحذف الكامل خلال 72 ساعة بعد فترة سماح 7 أيام.',
  },
  {
    article: 'المادة 12',
    title: 'حق النقل',
    icon: '📦',
    description: 'يحق لك الحصول على نسخة من بياناتك الشخصية بصيغة مقروءة إلكترونياً (JSON/CSV) لنقلها إلى مزود خدمة آخر.',
    howTo: 'أرسل رسالة "تصدير بياناتي" وسنوفر لك ملفاً يحتوي على جميع بياناتك.',
  },
  {
    article: 'المادة 13',
    title: 'حق الاعتراض',
    icon: '🛑',
    description: 'يحق لك الاعتراض على معالجة بياناتك الشخصية لأغراض معينة، بما في ذلك التحليلات الإحصائية المجمَّعة.',
    howTo: 'أرسل رسالة "أعترض على معالجة بياناتي" مع توضيح سبب الاعتراض.',
  },
];

const RIGHTS_EN = [
  {
    article: 'Article 9',
    title: 'Right of Access',
    icon: '🔍',
    description: 'You have the right to request access to all personal data associated with your account, including: chat history, academic profile data (nationality, GPA, track), and interaction history.',
    howTo: 'Send "show my data" or "I want my data" via the bot and we will respond within 72 hours.',
  },
  {
    article: 'Article 10',
    title: 'Right to Rectification',
    icon: '✏️',
    description: 'You have the right to correct or update any inaccurate or incomplete personal data we hold about you.',
    howTo: 'Send "correct my data" followed by the details you wish to amend.',
  },
  {
    article: 'Article 11',
    title: 'Right to Erasure',
    icon: '🗑️',
    description: 'You have the right to request complete and permanent deletion of all your personal data from our systems, including conversations, academic profile, and favorites.',
    howTo: 'Send "delete my data" via the bot. Deletion is confirmed within 72 hours after a 7-day grace period.',
  },
  {
    article: 'Article 12',
    title: 'Right to Data Portability',
    icon: '📦',
    description: 'You have the right to receive a copy of your personal data in a machine-readable format (JSON/CSV) for transfer to another service provider.',
    howTo: 'Send "export my data" and we will provide a file containing all your data.',
  },
  {
    article: 'Article 13',
    title: 'Right to Object',
    icon: '🛑',
    description: 'You have the right to object to the processing of your personal data for specific purposes, including aggregated statistical analysis.',
    howTo: 'Send "I object to data processing" with the reason for your objection.',
  },
];

export default function DataRights({ onBack }) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div style={S.container}>
      {/* ── Header ── */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={handleBack}>← رجوع</button>
        <h1 style={S.title}>⚖️ حقوق أصحاب البيانات | Data Rights</h1>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.content}>
        <span style={S.dateTag}>
          📅 وفق القانون رقم 13 لسنة 2016 (PDPPL) | Law No. 13 of 2016
        </span>

        {/* ══════════ مقدمة عربية ══════════ */}
        <div style={S.intro}>
          <strong>حقوقك محمية بالقانون.</strong> يكفل قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL) لكل مستخدم حقوقاً واضحة بشأن بياناته الشخصية. فيما يلي شرح تفصيلي لكل حق وكيفية ممارسته.
        </div>

        {/* ══════════ الحقوق بالعربي ══════════ */}
        {RIGHTS_AR.map((right) => (
          <div key={right.article} style={S.rightCard}>
            <span style={S.articleBadge}>{right.article}</span>
            <h2 style={S.sectionTitle}>{right.icon} {right.title}</h2>
            <p style={S.p}>{right.description}</p>
            <div style={S.howTo}>
              <strong>كيف تمارس هذا الحق؟</strong><br />
              {right.howTo}
            </div>
          </div>
        ))}

        {/* ── التواصل بالعربي ── */}
        <div style={S.contactBox}>
          <strong>📞 للتواصل:</strong> يمكنك ممارسة أي من حقوقك أعلاه <strong>مباشرة عبر البوت</strong> أو بالتواصل مع شركة النخبوية للبرمجيات.
          <br /><br />
          📍 شركة النخبوية للبرمجيات — مسجَّلة وفق القوانين التجارية لدولة قطر، الدوحة.
        </div>

        {/* ── فاصل اللغتين ── */}
        <div style={S.divider} />
        <h2 style={S.enHeader}>Data Subject Rights (English)</h2>

        {/* ══════════ English Section ══════════ */}
        <div style={{ ...S.intro, direction: 'ltr', textAlign: 'left', fontFamily: "'Segoe UI',Arial,sans-serif" }}>
          <strong>Your rights are protected by law.</strong> Qatar&apos;s Personal Data Privacy Protection Law No. 13 of 2016 (PDPPL) guarantees every user clear rights regarding their personal data. Below is a detailed explanation of each right and how to exercise it.
        </div>

        {RIGHTS_EN.map((right) => (
          <div key={right.article} style={S.rightCardEn}>
            <span style={S.articleBadgeEn}>{right.article}</span>
            <h2 style={S.sectionTitleEn}>{right.icon} {right.title}</h2>
            <p style={S.pEn}>{right.description}</p>
            <div style={S.howToEn}>
              <strong>How to exercise this right?</strong><br />
              {right.howTo}
            </div>
          </div>
        ))}

        {/* ── Contact (English) ── */}
        <div style={{ ...S.contactBox, direction: 'ltr', textAlign: 'left', fontFamily: "'Segoe UI',Arial,sans-serif" }}>
          <strong>📞 Contact:</strong> You can exercise any of the above rights <strong>directly through the bot</strong> or by contacting Al-Nukhbawiya Software Company.
          <br /><br />
          📍 Al-Nukhbawiya Software Company — registered under the commercial laws of the State of Qatar, Doha.
        </div>

        <div style={S.footer}>
          <p>&copy; 2026 شركة النخبوية للبرمجيات &middot; Qatar &middot; جميع الحقوق محفوظة</p>
          <p style={{ marginTop: 6 }}>
            <a href="/privacy" style={{ color: '#8A1538', marginLeft: 16 }}>سياسة الخصوصية | Privacy Policy</a>{' '}
            <a href="/terms" style={{ color: '#8A1538', marginLeft: 16 }}>شروط الاستخدام | Terms of Service</a>{' '}
            <a href="/" style={{ color: '#9CA3AF' }}>العودة للرئيسية | Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
