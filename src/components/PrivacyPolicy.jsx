import React from 'react';

const S = {
  container: {
    minHeight: '100dvh',
    background: 'var(--bg,#f8f9fa)',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    color: 'var(--text,#1a1a1a)',
  },
  header: {
    background: 'linear-gradient(135deg, #8A1538 0%, #6B1030 100%)',
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
  },
  title: {
    fontSize: 18,
    fontWeight: 800,
    margin: 0,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '24px 20px 48px',
  },
  date: {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    color: '#856404',
    marginBottom: 24,
    display: 'inline-block',
  },
  section: {
    background: 'var(--card-bg,#fff)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderRight: '4px solid #8A1538',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#8A1538',
    marginTop: 0,
    marginBottom: 12,
  },
  p: {
    fontSize: 14,
    lineHeight: 1.8,
    color: 'var(--text,#374151)',
    margin: '6px 0',
  },
  ul: {
    paddingRight: 20,
    paddingLeft: 0,
    margin: '8px 0',
  },
  li: {
    fontSize: 14,
    lineHeight: 1.8,
    color: 'var(--text,#374151)',
    marginBottom: 4,
  },
};

export default function PrivacyPolicy({ onBack }) {
  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← رجوع</button>
        <h1 style={S.title}>🔒 سياسة الخصوصية</h1>
        <div style={{ width: 70 }} />
      </div>

      <div style={S.content}>
        <span style={S.date}>📅 آخر تحديث: أبريل 2026</span>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>1. البيانات التي نجمعها</h2>
          <p style={S.p}>عند استخدام المستشار الجامعي القطري، نعالج البيانات التالية:</p>
          <ul style={S.ul}>
            <li style={S.li}>
              <strong>عبر WhatsApp:</strong> رقم هاتفك (لإرسال الردود فقط) ونص رسائلك لمعالجتها والرد عليها. لا يُخزَّن رقم هاتفك في قاعدة بيانات.
            </li>
            <li style={S.li}>
              <strong>عبر التطبيق الإلكتروني:</strong> جنسيتك ومفضلتك تُحفَظ محلياً على جهازك فقط (localStorage) ولا تُرسَل لأي خادم.
            </li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>2. كيف نستخدم بياناتك</h2>
          <ul style={S.ul}>
            <li style={S.li}>تقديم إجابات دقيقة عن الجامعات والتخصصات وشروط القبول في قطر.</li>
            <li style={S.li}>تخصيص الردود بحسب جنسيتك لعرض الخيارات المناسبة لك.</li>
            <li style={S.li}>تحسين جودة الخدمة بشكل مجمَّع وبدون تحديد الهوية الشخصية.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>3. مشاركة البيانات مع أطراف ثالثة</h2>
          <p style={S.p}><strong>لا نبيع بياناتك ولا نشاركها تجارياً.</strong> نستخدم:</p>
          <ul style={S.ul}>
            <li style={S.li}>
              <strong>Meta WhatsApp Cloud API:</strong> لإرسال واستقبال الرسائل فقط. تخضع لـ{' '}
              <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={{ color: '#8A1538' }}>
                سياسة خصوصية Meta
              </a>.
            </li>
            <li style={S.li}>
              <strong>Vercel:</strong> منصة الاستضافة. تخضع لسياسة Vercel للبيانات.
            </li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>4. الأمان والتخزين</h2>
          <ul style={S.ul}>
            <li style={S.li}>جميع الاتصالات مشفرة عبر HTTPS/TLS.</li>
            <li style={S.li}>أرقام الهواتف مُخفَّاة في سجلات النظام (تُعرَض آخر 4 أرقام فقط).</li>
            <li style={S.li}>رسائلك لا تُحفَظ في قاعدة بيانات بعد إرسال الرد.</li>
            <li style={S.li}>نستخدم التحقق من التوقيع الرقمي لضمان أصالة الطلبات الواردة.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>5. حقوقك (وفق قانون PDPL القطري رقم 13 لسنة 2016)</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong>الوصول:</strong> يمكنك طلب معرفة البيانات المرتبطة برقمك.</li>
            <li style={S.li}><strong>الحذف:</strong> أرسل "حذف بياناتي" عبر WhatsApp وسنؤكد الحذف خلال 72 ساعة.</li>
            <li style={S.li}><strong>البيانات المحلية:</strong> امسح بيانات المتصفح في أي وقت لحذف تفضيلاتك المحلية.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>6. تواصل معنا</h2>
          <p style={S.p}>
            للاستفسارات المتعلقة بالخصوصية، أرسل رسالة مباشرة عبر WhatsApp أو تواصل معنا عبر الموقع الرسمي.
          </p>
          <p style={S.p}>
            📍 مسجَّل وفق القوانين التجارية لدولة قطر.
          </p>
        </div>
      </div>
    </div>
  );
}
