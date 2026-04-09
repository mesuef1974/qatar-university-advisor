import React from 'react';

// ════════════════════════════════════════════════════════════════════
// سياسة الخصوصية | Privacy Policy
// شركة أذكياء للبرمجيات — سارية من 4 أبريل 2026
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
  langToggle: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderRight: '4px solid #8A1538',
  },
  sectionEn: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #C5A55A',
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
  warningBox: {
    background: '#FEF3C7',
    border: '1px solid #F59E0B',
    borderRadius: 10,
    padding: '12px 16px',
    marginTop: 8,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 1.7,
  },
  link: {
    color: '#8A1538',
    textDecoration: 'underline',
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

export default function PrivacyPolicy({ onBack }) {
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
        <h1 style={S.title}>🔒 سياسة الخصوصية | Privacy Policy</h1>
        <div style={{ width: 80 }} />
      </div>

      <div style={S.content}>
        <span style={S.dateTag}>
          📅 تاريخ السريان: 4 أبريل 2026 | Effective: April 4, 2026
        </span>

        {/* ══════════ القسم العربي ══════════ */}

        <div style={S.section}>
          <h2 style={S.sectionTitle}>1. مقدمة</h2>
          <p style={S.p}>
            هذا البوت مقدَّم من <strong>شركة أذكياء للبرمجيات</strong>، وهو مستشار أكاديمي ذكي يخدم الطلاب في دولة قطر عبر واجهة الويب وتطبيق WhatsApp. نلتزم بحماية خصوصيتك وفق <strong>قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL)</strong>.
          </p>
          <p style={S.p}>
            باستخدامك للخدمة، فإنك توافق على هذه السياسة. إذا كنت لا توافق على أي بند، يرجى التوقف عن الاستخدام.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>2. البيانات التي نجمعها</h2>
          <p style={S.p}>عند استخدام المستشار، نعالج البيانات التالية:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>رقم الهاتف:</strong> لإرسال الردود عبر WhatsApp فقط.</li>
            <li style={S.li}><strong>رسائل المحادثة:</strong> نصوص استفساراتك لمعالجتها وتوليد ردود دقيقة.</li>
            <li style={S.li}><strong>بيانات الملف الأكاديمي:</strong> الجنسية، المعدل الدراسي، المسار التعليمي — تُستخدَم لتخصيص الإرشاد.</li>
            <li style={S.li}><strong>بيانات التصفح (واجهة الويب):</strong> تفضيلاتك المحلية (localStorage) تبقى على جهازك فقط ولا تُرسَل لأي خادم.</li>
          </ul>
          <div style={S.warningBox}>
            ⚠️ لا نجمع بيانات حساسة كالسجلات الطبية أو البيانات المالية أو المعتقدات الدينية.
          </div>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>3. لماذا نجمع هذه البيانات</h2>
          <p style={S.p}>الغرض الوحيد من جمع بياناتك هو:</p>
          <ul style={S.ul}>
            <li style={S.li}>تقديم <strong>إرشاد أكاديمي مخصص</strong> بحسب جنسيتك ومعدلك ومسارك.</li>
            <li style={S.li}>تحسين دقة الردود وجودة الخدمة بشكل مجمَّع وبدون تحديد هويتك.</li>
            <li style={S.li}>الامتثال للمتطلبات القانونية المعمول بها في دولة قطر.</li>
          </ul>
          <p style={S.p}><strong>لا نستخدم بياناتك لأغراض تسويقية أو إعلانية.</strong></p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>4. مع من نشارك البيانات</h2>
          <p style={S.p}>
            <strong>لا نبيع بياناتك ولا نشاركها تجارياً.</strong> نعتمد على مزودي خدمة موثوقين لتشغيل المنصة، ولكل منهم سياسة خصوصية مستقلة:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>
              <strong>Supabase:</strong> تخزين البيانات وقاعدة البيانات.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={S.link}>سياسة الخصوصية</a>
            </li>
            <li style={S.li}>
              <strong>Vercel:</strong> استضافة التطبيق وخدمات Edge.{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={S.link}>سياسة الخصوصية</a>
            </li>
            <li style={S.li}>
              <strong>Anthropic Claude (AI):</strong> معالجة الاستفسارات وتوليد الردود الذكية.{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={S.link}>سياسة الخصوصية</a>
            </li>
            <li style={S.li}>
              <strong>Meta / WhatsApp Cloud API:</strong> إرسال واستقبال الرسائل عبر WhatsApp.{' '}
              <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={S.link}>سياسة الخصوصية</a>
            </li>
          </ul>
          <p style={S.p}>
            جميع الاتصالات مشفرة عبر <strong>HTTPS/TLS</strong>. أرقام الهواتف مُخفَّاة في سجلات النظام (تُعرَض آخر 4 أرقام فقط).
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>5. حقوقك كمستخدم</h2>
          <p style={S.p}>وفق <strong>القانون القطري رقم 13 لسنة 2016</strong>، يحق لك:</p>
          <ul style={S.ul}>
            <li style={S.li}><strong>حق الوصول:</strong> طلب معرفة البيانات المرتبطة بحسابك.</li>
            <li style={S.li}><strong>حق التصحيح:</strong> تعديل أي بيانات غير دقيقة تتعلق بك.</li>
            <li style={S.li}>
              <strong>حق الحذف:</strong> أرسل الرسالة التالية عبر البوت:{' '}
              <strong>"احذف بياناتي"</strong> وسنؤكد الحذف الكامل خلال 72 ساعة.
            </li>
            <li style={S.li}><strong>حق الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة.</li>
          </ul>
          <p style={S.p}>لممارسة حقوقك، تواصل معنا مباشرة عبر البوت أو بيانات الاتصال أدناه.</p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>6. فترة الاحتفاظ بالبيانات</h2>
          <p style={S.p}>
            نحتفظ بالبيانات لمدة <strong>سنتَين (2 سنة) من تاريخ آخر تفاعل</strong>، وذلك وفق متطلبات <strong>القانون القطري رقم 13 لسنة 2016</strong> والأنظمة التجارية المعمول بها في الدوحة.
          </p>
          <p style={S.p}>
            بعد انتهاء هذه المدة، تُحذَف البيانات تلقائياً من جميع أنظمتنا. يمكنك طلب الحذف الفوري في أي وقت.
          </p>
        </div>

        <div style={S.section}>
          <h2 style={S.sectionTitle}>7. الاتصال بنا</h2>
          <p style={S.p}>
            للاستفسارات المتعلقة بالخصوصية أو لممارسة حقوقك، تواصل معنا <strong>من خلال البوت مباشرة</strong>.
          </p>
          <p style={S.p}>
            📍 شركة أذكياء للبرمجيات — مسجَّلة وفق القوانين التجارية لدولة قطر، الدوحة.
          </p>
        </div>

        {/* ── فاصل اللغتين ── */}
        <div style={S.divider} />
        <h2 style={S.enHeader}>Privacy Policy (English)</h2>

        {/* ══════════ English Section ══════════ */}

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>1. Introduction</h2>
          <p style={S.pEn}>
            This bot is provided by <strong>Al-Nukhbawiya Software Company</strong>, an AI-powered academic advisor serving students in the State of Qatar via web interface and WhatsApp. We are committed to protecting your privacy in accordance with <strong>Qatar's Personal Data Privacy Protection Law No. 13 of 2016 (PDPPL)</strong>.
          </p>
          <p style={S.pEn}>
            By using this service, you agree to this policy. If you do not agree, please discontinue use.
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>2. Data We Collect</h2>
          <ul style={S.ulEn}>
            <li style={S.liEn}><strong>Phone number:</strong> Used solely to send WhatsApp replies.</li>
            <li style={S.liEn}><strong>Chat messages:</strong> Your queries, processed to generate accurate responses.</li>
            <li style={S.liEn}><strong>Academic profile data:</strong> Nationality, GPA, academic track — used to personalise guidance.</li>
            <li style={S.liEn}><strong>Browser preferences (web):</strong> Stored locally on your device (localStorage) and never sent to any server.</li>
          </ul>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>3. Why We Collect It</h2>
          <p style={S.pEn}>The sole purpose of data collection is to provide <strong>personalised academic guidance</strong>. We do not use your data for marketing or advertising purposes.</p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>4. Third-Party Sharing</h2>
          <p style={S.pEn}><strong>We do not sell your data.</strong> We rely on trusted service providers, each with their own privacy policy:</p>
          <ul style={S.ulEn}>
            <li style={S.liEn}><strong>Supabase</strong> — Database &amp; storage. <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={S.link}>Privacy Policy</a></li>
            <li style={S.liEn}><strong>Vercel</strong> — Application hosting &amp; edge delivery. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={S.link}>Privacy Policy</a></li>
            <li style={S.liEn}><strong>Anthropic Claude (AI)</strong> — AI query processing &amp; response generation. <a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer" style={S.link}>Privacy Policy</a></li>
            <li style={S.liEn}><strong>Meta / WhatsApp Cloud API</strong> — Messaging delivery. <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer" style={S.link}>Privacy Policy</a></li>
          </ul>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>5. Your Rights</h2>
          <p style={S.pEn}>Under <strong>Qatar Law No. 13 of 2016</strong>, you have the right to:</p>
          <ul style={S.ulEn}>
            <li style={S.liEn}><strong>Access</strong> — request details of data associated with your account.</li>
            <li style={S.liEn}><strong>Rectification</strong> — correct inaccurate personal data.</li>
            <li style={S.liEn}><strong>Erasure</strong> — send <strong>"احذف بياناتي"</strong> (delete my data) to the bot; confirmed within 72 hours.</li>
            <li style={S.liEn}><strong>Objection</strong> — object to processing for specific purposes.</li>
          </ul>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>6. Retention Period</h2>
          <p style={S.pEn}>
            Data is retained for <strong>two (2) years from the date of last interaction</strong>, in accordance with <strong>Qatar Law No. 13 of 2016</strong>. After this period, data is automatically deleted from all our systems.
          </p>
        </div>

        <div style={S.sectionEn}>
          <h2 style={S.sectionTitleEn}>7. Contact Us</h2>
          <p style={S.pEn}>
            For privacy enquiries or to exercise your rights, contact us <strong>directly through the bot</strong>.
          </p>
          <p style={S.pEn}>
            📍 Al-Nukhbawiya Software Company — registered under the commercial laws of the State of Qatar, Doha.
          </p>
        </div>

        <div style={S.footer}>
          <p>© 2026 شركة أذكياء للبرمجيات · Qatar · جميع الحقوق محفوظة</p>
          <p style={{ marginTop: 6 }}>
            <a href="/terms" style={{ color: '#8A1538', marginLeft: 16 }}>شروط الاستخدام | Terms of Service</a>
            <a href="/" style={{ color: '#9CA3AF' }}>العودة للرئيسية | Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
