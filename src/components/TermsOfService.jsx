import React from 'react';

const S = {
  container: {
    minHeight: '100dvh',
    background: '#f8f9fa',
    direction: 'rtl',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    color: '#1a1a1a',
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
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderRight: '4px solid #C5A55A',
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
    color: '#374151',
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
    color: '#374151',
    marginBottom: 4,
  },
  warningBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '14px 18px',
    marginTop: 8,
    fontSize: 13,
    color: '#8A1538',
    lineHeight: 1.7,
  },
};

export default function TermsOfService({ onBack }) {
  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← رجوع</button>
        <h1 style={S.title}>📋 شروط الاستخدام</h1>
        <div style={{ width: 70 }} />
      </div>

      <div style={S.content}>
        <span style={S.date}>📅 آخر تحديث: أبريل 2026 | سارية وفق القوانين القطرية</span>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>1. القبول والموافقة</h2>
          <p style={S.p}>
            باستخدام المستشار الجامعي الذكي (سواء عبر واجهة الويب أو WhatsApp)، فإنك توافق على هذه الشروط وعلى سياسة الخصوصية المرفقة. إذا كنت قاصراً (دون 18 عاماً)، يجب الحصول على موافقة ولي الأمر.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>2. طبيعة الخدمة</h2>
          <p style={S.p}>
            المستشار الجامعي الذكي هو <strong>خدمة إرشادية تعليمية</strong> تُقدِّم معلومات عامة عن الجامعات والتخصصات وشروط القبول في دولة قطر.
          </p>
          <div style={S.warningBox}>
            ⚠️ <strong>إخلاء مسؤولية هام:</strong> المعلومات المقدَّمة إرشادية فقط وقد لا تعكس آخر التحديثات الرسمية. القرار النهائي يعود دائماً للطالب وولي الأمر والجهات الأكاديمية الرسمية. تحقَّق دائماً من المواقع الرسمية للجامعات ووزارة التعليم قبل اتخاذ أي قرار.
          </div>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>3. الاستخدام المسموح</h2>
          <ul style={S.ul}>
            <li style={S.li}>✅ الاستخدام الشخصي للاستفسار عن الجامعات والتخصصات.</li>
            <li style={S.li}>✅ مشاركة المعلومات مع أفراد الأسرة للاستشارة الأكاديمية.</li>
            <li style={S.li}>✅ الاستخدام في الأغراض التعليمية غير التجارية.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>4. الاستخدام المحظور</h2>
          <ul style={S.ul}>
            <li style={S.li}>❌ إعادة بيع الخدمة أو محتواها تجارياً دون إذن كتابي مسبق.</li>
            <li style={S.li}>❌ إرسال محتوى مسيء، مضلل، أو مخالف للقوانين القطرية.</li>
            <li style={S.li}>❌ محاولة اختراق النظام أو استغلال الثغرات (يُعدّ جريمة وفق قانون رقم 14 لسنة 2014).</li>
            <li style={S.li}>❌ استخدام الخدمة لأغراض تسويقية أو جمع بيانات المستخدمين الآخرين.</li>
            <li style={S.li}>❌ انتحال الصفة أو تقديم معلومات مضللة.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>5. الملكية الفكرية</h2>
          <p style={S.p}>
            جميع محتويات المستشار الجامعي (الردود، قواعد البيانات، واجهة المستخدم، الخوارزميات) محمية بموجب{' '}
            <strong>قانون حماية حقوق الملكية الفكرية القطري رقم 7 لسنة 2002</strong>.
          </p>
          <p style={S.p}>
            لا يُسمح بنسخ أي جزء من الخدمة أو توزيعه أو إعادة استخدامه تجارياً دون إذن مكتوب مسبق.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>6. النسخة المدفوعة</h2>
          <ul style={S.ul}>
            <li style={S.li}>الأسعار معروضة بوضوح قبل إتمام الدفع.</li>
            <li style={S.li}>الاشتراكات غير قابلة للاسترداد بعد الاستخدام الفعلي للخدمة، وفق قانون التجارة الإلكترونية رقم 16 لسنة 2010.</li>
            <li style={S.li}>في حال وجود خلل تقني من جانبنا، يحق لك الحصول على تعويض أو تمديد الاشتراك.</li>
            <li style={S.li}>يمكنك الإلغاء قبل التجديد التلقائي بـ 24 ساعة على الأقل.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>7. تعديل الشروط وإيقاف الخدمة</h2>
          <p style={S.p}>
            نحتفظ بحق تعديل هذه الشروط مع إشعار مسبق بـ 14 يوماً عبر قناة التواصل المسجَّلة. الاستمرار في استخدام الخدمة بعد التعديل يُعدّ قبولاً ضمنياً للشروط الجديدة.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>8. القانون الواجب التطبيق</h2>
          <p style={S.p}>
            تخضع هذه الشروط لقوانين <strong>دولة قطر</strong>. أي نزاع يُحسم أمام المحاكم القطرية المختصة أو عبر التحكيم وفق مركز قطر الدولي للتحكيم.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>9. التواصل</h2>
          <p style={S.p}>
            للشكاوى أو الاستفسارات القانونية: أرسل رسالة عبر WhatsApp أو تواصل معنا عبر البريد الإلكتروني الرسمي المذكور على الموقع.
          </p>
          <p style={S.p}>📍 مسجَّل وفق القوانين التجارية لدولة قطر.</p>
        </div>
      </div>
    </div>
  );
}
