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
    borderRight: '4px solid #059669',
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
    marginBottom: 6,
  },
  tableWrap: {
    overflowX: 'auto',
    marginTop: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    background: '#f3f4f6',
    padding: '10px 14px',
    textAlign: 'right',
    fontWeight: 700,
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  td: {
    padding: '10px 14px',
    textAlign: 'right',
    color: '#374151',
    border: '1px solid #e5e7eb',
    lineHeight: 1.6,
  },
  greenBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    padding: '14px 18px',
    marginTop: 8,
    fontSize: 13,
    color: '#166534',
    lineHeight: 1.7,
  },
  redBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 10,
    padding: '14px 18px',
    marginTop: 8,
    fontSize: 13,
    color: '#8A1538',
    lineHeight: 1.7,
  },
  contactBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #8A1538 0%, #6B1030 100%)',
    color: '#fff',
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: 16,
  },
};

export default function RefundPolicy({ onBack }) {
  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>← رجوع</button>
        <h1 style={S.title}>💰 سياسة الاسترجاع والإلغاء</h1>
        <div style={{ width: 70 }} />
      </div>

      <div style={S.content}>
        <span style={S.date}>
          📅 آخر تحديث: أبريل 2026 | وفق قانون التجارة الإلكترونية القطري رقم 16 لسنة 2010
        </span>

        {/* المبدأ العام */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>1. المبدأ العام</h2>
          <p style={S.p}>
            نحرص على رضاك التام. إذا لم تكن الخدمة تلبّي توقعاتك لأسباب تقنية من جانبنا، سنعمل على إيجاد حل عادل وفق هذه السياسة.
          </p>
          <p style={S.p}>
            هذه السياسة تنطبق على <strong>النسخة المدفوعة (Pro)</strong> من المستشار الجامعي القطري فقط. الخدمة المجانية لا تنطوي على أي التزامات مالية.
          </p>
        </div>

        {/* جدول حالات الاسترجاع */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>2. حالات الاسترجاع وشروطها</h2>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>الحالة</th>
                  <th style={S.th}>مؤهَّل للاسترجاع؟</th>
                  <th style={S.th}>المدة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>خلل تقني من جانبنا يمنع الوصول للخدمة</td>
                  <td style={{ ...S.td, color: '#059669', fontWeight: 700 }}>✅ نعم — كامل</td>
                  <td style={S.td}>خلال 7 أيام من الدفع</td>
                </tr>
                <tr>
                  <td style={S.td}>الخدمة لم تُفعَّل بعد الدفع لأسباب تقنية</td>
                  <td style={{ ...S.td, color: '#059669', fontWeight: 700 }}>✅ نعم — كامل</td>
                  <td style={S.td}>خلال 7 أيام من الدفع</td>
                </tr>
                <tr>
                  <td style={S.td}>اشتراك شهري — إلغاء قبل التجديد بـ 24 ساعة</td>
                  <td style={{ ...S.td, color: '#059669', fontWeight: 700 }}>✅ نعم — للفترة غير المُستهلَكة</td>
                  <td style={S.td}>قبل تاريخ التجديد</td>
                </tr>
                <tr>
                  <td style={S.td}>عدم الرضا عن جودة المحتوى (قبل الاستخدام الفعلي)</td>
                  <td style={{ ...S.td, color: '#d97706', fontWeight: 700 }}>🟡 يُدرَس حسب الحالة</td>
                  <td style={S.td}>خلال 48 ساعة من الدفع</td>
                </tr>
                <tr>
                  <td style={S.td}>تغيُّر رأي المستخدم بعد استخدام الخدمة فعلياً</td>
                  <td style={{ ...S.td, color: '#8A1538', fontWeight: 700 }}>❌ لا — وفق القانون</td>
                  <td style={S.td}>—</td>
                </tr>
                <tr>
                  <td style={S.td}>اشتراك سنوي مع استخدام فعلي أكثر من شهر</td>
                  <td style={{ ...S.td, color: '#8A1538', fontWeight: 700 }}>❌ لا</td>
                  <td style={S.td}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* الأساس القانوني */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>3. الأساس القانوني</h2>
          <p style={S.p}>
            تستند هذه السياسة إلى:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>
              <strong>قانون التجارة الإلكترونية القطري رقم 16 لسنة 2010:</strong> المواد المتعلقة بحقوق المستهلك في العقود الرقمية والخدمات المدفوعة عبر الإنترنت.
            </li>
            <li style={S.li}>
              <strong>قانون حماية المستهلك القطري رقم 8 لسنة 2008:</strong> المادة المتعلقة بحق المستهلك في الحصول على خدمة مطابقة للوصف المُعلَن.
            </li>
            <li style={S.li}>
              <strong>مبدأ الخدمات الرقمية:</strong> الخدمات الرقمية المُستهلَكة كلياً لا تخضع للاسترجاع التلقائي بموجب القانون القطري.
            </li>
          </ul>
          <div style={S.greenBox}>
            ✅ <strong>حقك المكفول:</strong> في حال حدوث عطل تقني موثَّق يمنعك من الاستفادة من الخدمة المدفوعة، يحق لك الاسترجاع الكامل خلال 7 أيام من تاريخ الدفع.
          </div>
        </div>

        {/* آلية الإلغاء */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>4. كيفية إلغاء الاشتراك</h2>
          <ul style={S.ul}>
            <li style={S.li}>📱 أرسل "إلغاء اشتراكي" عبر WhatsApp قبل موعد التجديد بـ <strong>24 ساعة على الأقل</strong>.</li>
            <li style={S.li}>📧 أو تواصل عبر البريد الإلكتروني الرسمي المذكور على الموقع.</li>
            <li style={S.li}>⏰ يُوقَف الاشتراك فوراً — لكن تبقى الصلاحية حتى نهاية الفترة المدفوعة.</li>
            <li style={S.li}>🔄 لا يوجد رسوم إلغاء مبكر على الاشتراكات الشهرية.</li>
          </ul>
        </div>

        {/* آلية الاسترجاع */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>5. خطوات طلب الاسترجاع</h2>
          <ol style={{ ...S.ul, paddingRight: 24 }}>
            <li style={{ ...S.li, marginBottom: 10 }}>
              <strong>الخطوة 1:</strong> تواصل معنا خلال المدة المحددة في الجدول أعلاه.
            </li>
            <li style={{ ...S.li, marginBottom: 10 }}>
              <strong>الخطوة 2:</strong> أرسل رقم المعاملة ووصفاً مختصراً للمشكلة.
            </li>
            <li style={{ ...S.li, marginBottom: 10 }}>
              <strong>الخطوة 3:</strong> نراجع طلبك خلال <strong>3 أيام عمل</strong>.
            </li>
            <li style={{ ...S.li, marginBottom: 10 }}>
              <strong>الخطوة 4:</strong> في حال الموافقة، يُردّ المبلغ للوسيلة الأصلية خلال <strong>7-14 يوم عمل</strong>.
            </li>
          </ol>
          <div style={S.redBox}>
            ⚠️ <strong>ملاحظة:</strong> رسوم المعالجة الصادرة عن بوابة الدفع (إن وُجدت) قد لا تكون قابلة للاسترجاع، وهي خارج نطاق سيطرتنا.
          </div>
        </div>

        {/* حالات خاصة */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>6. حالات خاصة</h2>
          <ul style={S.ul}>
            <li style={S.li}>
              <strong>انقطاع الخدمة لأسباب تقنية:</strong> إذا كانت الخدمة غير متاحة لأكثر من 24 ساعة متواصلة، تُمدَّد مدة اشتراكك تلقائياً بالمقدار المقابل.
            </li>
            <li style={S.li}>
              <strong>تغيير جوهري في الخدمة:</strong> إذا أجرينا تعديلاً جوهرياً يؤثر سلباً على الخدمة المدفوعة، يحق لك الإلغاء مع استرجاع الجزء غير المُستهلَك.
            </li>
            <li style={S.li}>
              <strong>الوفاة أو العجز الطبي:</strong> تُعامَل وفق كل حالة على حدة بعطف وإنصاف.
            </li>
          </ul>
        </div>

        {/* تواصل */}
        <div style={S.section}>
          <h2 style={S.sectionTitle}>7. التواصل لطلب الاسترجاع</h2>
          <p style={S.p}>
            للتواصل بشأن طلبات الاسترجاع أو الشكاوى، يرجى الاتصال بنا عبر:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>📱 <strong>WhatsApp:</strong> أرسل "استرجاع" ورقم المعاملة</li>
            <li style={S.li}>📍 <strong>الموقع:</strong> مسجَّل وفق القوانين التجارية لدولة قطر</li>
          </ul>
          <p style={S.p} style={{ ...S.p, fontSize: 12, opacity: 0.6, marginTop: 12 }}>
            في حال عدم الوصول لحل ودّي، يحق لك اللجوء لوزارة التجارة والصناعة القطرية أو الجهات القانونية المختصة.
          </p>
        </div>
      </div>
    </div>
  );
}
