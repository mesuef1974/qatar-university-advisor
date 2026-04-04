import React from 'react';

// ════════════════════════════════════════════════════════════════════
// شروط الاستخدام | Terms of Service
// شركة النخبوية للبرمجيات — سارية من 4 أبريل 2026
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
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderRight: '4px solid #C5A55A',
  },
  sectionEn: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #8A1538',
    direction: 'ltr',
    textAlign: 'left',
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
  ul: {
    paddingRight: 22,
    paddingLeft: 0,
    margin: '8px 0',
  },
  ulEn: {
    paddingLeft: 22,
    paddingRight: 0,
    margin: '8px 0',
    direction: 'ltr',
  },
  li: {
    fontSize: 14,
    lineHeight: 1.85,
    color: '#374151',
    marginBottom: 6,
  },
  liEn: {
    fontSize: 14,
    lineHeight: 1.85,
    color: '#374151',
    marginBottom: 6,
    direction: 'ltr',
    fontFamily: "'Segoe UI',Arial,sans-serif",
  },
  warningBox: {
    background: '#FEF2F2',
    border: '2px solid #FECACA',
    borderRadius: 10,
    padding: '16px 20px',
    marginTop: 10,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 1.8,
    fontWeight: 500,
  },
  warningBoxEn: {
    background: '#FEF2F2',
    border: '2px solid #FECACA',
    borderRadius: 10,
    padding: '16px 20px',
    marginTop: 10,
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 1.8,
    fontWeight: 500,
    direction: 'ltr',
    fontFamily: "'Segoe UI',Arial,sans-serif",
  },
  divider: {
    height: 2,
    background: 'linear-gradient(90deg,#C5A55A,#8A1538,transparent)',
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
    fontFamily: "'Segoe UI",Arial,sans-serif",
    direction: 'ltr',
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
};

export default function TermsOfService({ onBack }) {
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
        <h1 style={S.title}>📋 شروط الاستخدام | Terms of Service</h1>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.content}>
        <span style={S.dateTag}>
          📅 تاريخ السريان: 4 أبريل 2026 | Effective: April 4, 2026
        </span>

        {/* ══════════ القسم العربي ══════════ */}

        <div style={S.section}>
          <h2 style={S.sectionTitle}>1. وصف الخدمة</h2>
          <p style={S.p}>
            <strong>المستشار الجامعي الذكي</strong> هو بوت إرشادي أكاديمي ذكي مقدَّم من <strong>شركة النخبوية للبرمجيات</strong>، يخدم الطلاب في دولة قطر عبر <strong>WhatsApp</strong> وموقع إلكتروني. تشمل الخدمة:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>معلومات عن الجامعات القطرية ومتطلبات القبول والتخصصات.</li>
            <li style={S.li}>إرشاد حول المنح الدراسية وبرامج الابتعاث في قطر.</li>
            <li style={S.li}>مقارنة بين الجامعات وتوقعات سوق العمل.</li>
            <li style={S.li}>اختبار تحديد التخصص المناسب بناءً على ميول الطالب.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>2. إخلاء المسؤولية الأكاديمي</h2>
          <p style={S.p}>
            المعلومات المقدَّمة من خلال هذه الخدمة تهدف إلى <strong>الإرشاد والتوجيه الأكاديمي العام</strong> فقط.
          </p>
          <div style={S.warningBox}>
            ⚠️ <strong>تنبيه هام:</strong> المعلومات المقدَّمة إرشادية فقط ولا تُعدّ قراراً رسمياً أو ضماناً بالقبول. متطلبات الجامعات وشروط القبول قابلة للتغيير في أي وقت. يجب التحقق دائماً من المواقع الرسمية للجامعات ووزارة التعليم والتدريب المهني مباشرة قبل اتخاذ أي قرار أكاديمي.
          </div>
          <p style={S.p} style={{ marginTop: 12 }}>
            لا تتحمل الشركة أي مسؤولية عن قرارات القبول أو عدم القبول الصادرة عن الجامعات، ولا عن أي تغييرات تطرأ على متطلباتها أو سياساتها.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>3. الاستخدام المقبول</h2>
          <p style={S.p}>يُسمح باستخدام الخدمة للأغراض التالية:</p>
          <ul style={S.ul}>
            <li style={S.li}>✅ الاستفسار الشخصي عن الجامعات والتخصصات والمنح.</li>
            <li style={S.li}>✅ مشاركة المعلومات مع أفراد الأسرة للتوجيه الأكاديمي.</li>
            <li style={S.li}>✅ الأغراض التعليمية غير التجارية.</li>
          </ul>
          <p style={S.p}><strong>يُحظر صراحةً ما يلي:</strong></p>
          <ul style={S.ul}>
            <li style={S.li}>❌ مقاطعة الخدمة أو إرسال طلبات مكثفة بهدف تعطيل النظام.</li>
            <li style={S.li}>❌ إرسال محتوى مسيء أو تحريضي أو مخالف للقوانين القطرية.</li>
            <li style={S.li}>❌ محاولات اختراق النظام أو استغلال الثغرات (يُعدّ جريمة وفق <strong>قانون مكافحة الجرائم الإلكترونية القطري رقم 14 لسنة 2014</strong>).</li>
            <li style={S.li}>❌ استخدام الخدمة لأغراض تجارية أو تسويقية دون إذن كتابي مسبق.</li>
            <li style={S.li}>❌ انتحال الهوية أو تقديم معلومات مضللة.</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>4. حدود المسؤولية</h2>
          <p style={S.p}>
            في أقصى حدود ما يجيزه القانون القطري، <strong>لا تتحمل شركة النخبوية للبرمجيات</strong> أي مسؤولية عن:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>قرارات القبول الصادرة عن الجامعات أو رفض الطلبات.</li>
            <li style={S.li}>التغييرات التي تجريها الجامعات على متطلبات القبول أو الشروط.</li>
            <li style={S.li}>أي خسائر أو أضرار ناتجة عن الاعتماد على المعلومات الإرشادية دون التحقق الرسمي.</li>
            <li style={S.li}>انقطاعات مؤقتة في الخدمة خارجة عن إرادتنا (قوة قاهرة).</li>
          </ul>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>5. الملكية الفكرية</h2>
          <p style={S.p}>
            جميع محتويات المستشار الجامعي (الردود، قواعد البيانات، واجهة المستخدم، الخوارزميات) محمية بموجب <strong>قانون حماية حقوق الملكية الفكرية القطري رقم 7 لسنة 2002</strong>. لا يُسمح بنسخها أو إعادة توزيعها تجارياً دون إذن كتابي مسبق.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>6. القانون المطبق وتسوية النزاعات</h2>
          <p style={S.p}>
            تخضع هذه الشروط لقوانين <strong>دولة قطر</strong> وتُفسَّر وفقاً لها. أي نزاع ينشأ عن استخدام الخدمة يُحسَم أمام <strong>المحاكم القطرية المختصة</strong> في الدوحة، أو عبر التحكيم وفق مركز قطر الدولي للتحكيم (QICCA).
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>7. التعديلات على الشروط</h2>
          <p style={S.p}>
            نحتفظ بحق تعديل هذه الشروط مع إشعار مسبق بـ <strong>14 يوماً</strong> عبر قناة التواصل المسجَّلة. الاستمرار في استخدام الخدمة بعد التعديل يُعدّ قبولاً ضمنياً للشروط الجديدة.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>8. التواصل</h2>
          <p style={S.p}>
            للاستفسارات أو الشكاوى المتعلقة بهذه الشروط، تواصل معنا مباشرة <strong>من خلال البوت</strong>.
          </p>
          <p style={S.p}>
            📍 شركة النخبوية للبرمجيات — مسجَّلة وفق القوانين التجارية لدولة قطر، الدوحة.
          </p>
        </div>

        {/* ── فاصل اللغتين ── */}
        <div style={S.divider} />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#6B1030', textAlign: 'center', margin: '0 0 20px', fontFamily: "'Segoe UI',Arial,sans-serif", direction: 'ltr' }}>
          Terms of Service (English)
        </h2>

        {/* ══════════ English Section ══════════ */}

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>1. Service Description</h2>
          <p style={S.pEn}>
            The <strong>Qatar University Advisor</strong> is an AI-powered academic advisory bot provided by <strong>Al-Nukhbawiya Software Company</strong>, serving students in the State of Qatar via <strong>WhatsApp</strong> and a web interface. The service provides information about universities, admission requirements, scholarships, and academic programmes in Qatar.
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>2. Academic Disclaimer</h2>
          <div style={S.warningBoxEn}>
            ⚠️ <strong>Important Notice:</strong> All information provided is for <strong>guidance purposes only</strong> and does not constitute an official decision or guarantee of admission. University requirements and admission conditions are subject to change at any time. Always verify directly with universities and the Ministry of Education and Vocational Training before making any academic decisions.
          </div>
          <p style={S.pEn} style={{ marginTop: 12 }}>
            The Company bears no responsibility for admission decisions issued by universities, nor for any changes to their requirements or policies.
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>3. Acceptable Use</h2>
          <p style={S.pEn}>The following are <strong>strictly prohibited</strong>:</p>
          <ul style={S.ulEn}>
            <li style={S.liEn}>Disrupting or flooding the service with excessive requests.</li>
            <li style={S.liEn}>Sending offensive, misleading, or illegal content.</li>
            <li style={S.liEn}>Attempting to hack or exploit system vulnerabilities (a criminal offence under <strong>Qatar Law No. 14 of 2014</strong>).</li>
            <li style={S.liEn}>Commercial use without prior written permission.</li>
          </ul>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>4. Limitation of Liability</h2>
          <p style={S.pEn}>
            To the fullest extent permitted by Qatari law, <strong>Al-Nukhbawiya Software Company</strong> shall not be liable for admission decisions made by universities, changes to admission requirements, or any losses arising from reliance on advisory information without official verification.
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>5. Governing Law</h2>
          <p style={S.pEn}>
            These Terms are governed by the laws of the <strong>State of Qatar</strong>. Any disputes shall be resolved before the competent Qatari courts in Doha, or through arbitration under the Qatar International Centre for Conciliation and Arbitration (QICCA).
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>6. Effective Date</h2>
          <p style={S.pEn}>
            These Terms are effective as of <strong>April 4, 2026</strong>.
          </p>
        </div>

        <div style={S.footer}>
          <p>© 2026 شركة النخبوية للبرمجيات · Qatar · جميع الحقوق محفوظة</p>
          <p style={{ marginTop: 6 }}>
            <a href="/privacy" style={{ color: '#8A1538', marginLeft: 16 }}>سياسة الخصوصية | Privacy Policy</a>
            <a href="/" style={{ color: '#9CA3AF' }}>العودة للرئيسية | Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
