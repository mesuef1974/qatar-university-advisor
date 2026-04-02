import React, { useState, useMemo } from 'react';

const ExecutionPlan = () => {
  const [targetUsers, setTargetUsers] = useState(5000);
  const price = 10;
  const paymentGatewayFee = 1.25; // SkipCash/Sadad Fee
  const marketingCostPerUser = 0.50; // Estimated Snapchat/Insta spend per acquisition
  
  const financialMetrics = useMemo(() => {
    const gross = targetUsers * price;
    const net = targetUsers * (price - paymentGatewayFee - marketingCostPerUser);
    return {
      gross: gross.toLocaleString(),
      net: net.toLocaleString(),
      roi: ((net / (marketingCostPerUser * targetUsers || 1)) * 100).toFixed(0)
    };
  }, [targetUsers]);

  const [tasks, setTasks] = useState([
    { id: 1, cat: 'TECH', text: 'فصل قاعدة البيانات (JSON Separation)', status: 'done', priority: 'High' },
    { id: 2, cat: 'UX', text: 'تصميم واجهة الدفع (Apple Pay Integrated UI)', status: 'pending', priority: 'High' },
    { id: 3, cat: 'LEGAL', text: 'تفعيل حساب SkipCash/Sadad للأعمال', status: 'pending', priority: 'Critical' },
    { id: 4, cat: 'AI', text: 'دمج محرك البحث الضبابي (Fuzzy Search)', status: 'pending', priority: 'Medium' },
    { id: 5, cat: 'MKT', text: 'تجهيز تصاميم إعلانات سناب شات (طلاب قطر)', status: 'pending', priority: 'High' },
    { id: 6, cat: 'TECH', text: 'برمجة الـ PWA للعمل بدون إنترنت', status: 'pending', priority: 'Medium' },
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };

  const progress = Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);

  return (
    <div style={S.container} dir="rtl">
      {/* Top Navigation / Status */}
      <div style={S.topBar}>
        <div style={S.brand}>
          <span style={S.icon}>🛡️</span>
          <div>
            <h1 style={S.mainTitle}>المستشار الجامعي | الرؤية التنفيذية 2025</h1>
            <p style={S.subTitle}>خطة الاستحواذ والتشغيل - دولة قطر</p>
          </div>
        </div>
        <div style={S.statusBadge}>مرحلة التطوير: {progress}%</div>
      </div>

      {/* Financial Simulator Section */}
      <div style={S.section}>
        <div style={S.secHeader}>
          <h2 style={S.secTitle}>💰 المحاكي المالي والجدوى (Financials)</h2>
          <span style={S.tag}>توقعات الربحية</span>
        </div>
        <div style={S.financialGrid}>
          <div style={S.finCard}>
            <span style={S.finLabel}>إجمالي الإيرادات</span>
            <span style={S.finValue}>{financialMetrics.gross} <small>ر.ق</small></span>
          </div>
          <div style={{...S.finCard, borderColor: '#10b981'}}>
            <span style={S.finLabel}>صافي الأرباح (بعد الرسوم)</span>
            <span style={{...S.finValue, color: '#10b981'}}>{financialMetrics.net} <small>ر.ق</small></span>
          </div>
          <div style={S.finCard}>
            <span style={S.finLabel}>العائد على الاستثمار (ROI)</span>
            <span style={S.finValue}>{financialMetrics.roi}%</span>
          </div>
        </div>
        <div style={S.sliderContainer}>
          <label style={S.sliderLabel}>تعديل عدد المستخدمين المستهدفين: <b>{targetUsers} طالباً</b></label>
          <input 
            type="range" min="500" max="25000" step="500" 
            value={targetUsers} 
            onChange={(e) => setTargetUsers(parseInt(e.target.value))}
            style={S.slider}
          />
        </div>
      </div>

      <div style={S.mainGrid}>
        {/* Execution Roadmap */}
        <div style={S.column}>
          <div style={S.section}>
            <h2 style={S.secTitle}>🗺️ خارطة الطريق الزمنية (Roadmap)</h2>
            <div style={S.roadmap}>
              {[
                { w: 'W1', t: 'الهيكلة التقنية', d: 'تحويل التطبيق لنظام Modular ودعم PWA.', s: 'active' },
                { w: 'W2', t: 'بوابة الدفع', d: 'ربط Apple Pay ونظام الصلاحيات (Pro).', s: 'upcoming' },
                { w: 'W3', t: 'تحديث المحتوى', d: 'مراجعة رواتب قطر للطاقة وشروط 2025.', s: 'upcoming' },
                { w: 'W4', t: 'الانطلاق التسويقي', d: 'حملات سناب شات المتزامنة مع النتائج.', s: 'upcoming' },
              ].map((item, i) => (
                <div key={i} style={{...S.roadItem, opacity: item.s === 'upcoming' ? 0.6 : 1}}>
                  <div style={S.roadWeek}>{item.w}</div>
                  <div style={S.roadContent}>
                    <div style={S.roadTitle}>{item.t}</div>
                    <div style={S.roadDesc}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{...S.section, background: '#111827', color: '#fff'}}>
            <h2 style={{...S.secTitle, color: '#fff'}}>🎯 معايير النجاح (KPIs)</h2>
            <ul style={S.kpiList}>
              <li>⏱️ سرعة الرد: <b>Zero Latency</b> (معالجة محلية).</li>
              <li>📱 التوافق: <b>100%</b> مع متصفحات iPhone (Safari).</li>
              <li>💵 تحويل الدفع: <b>&gt; 8%</b> من الزوار للمجاني.</li>
              <li>⭐ تقييم المستخدم: <b>4.8/5</b> كهدف أدنى.</li>
            </ul>
          </div>
        </div>

        {/* Task Tracker */}
        <div style={S.column}>
          <div style={S.section}>
            <div style={S.secHeader}>
              <h2 style={S.secTitle}>📝 قائمة المهام التنفيذية</h2>
              <span style={S.progressCircle}>{progress}%</span>
            </div>
            <div style={S.taskList}>
              {tasks.map(task => (
                <div key={task.id} style={S.taskItem} onClick={() => toggleTask(task.id)}>
                  <div style={{...S.check, background: task.status === 'done' ? '#10b981' : 'transparent', borderColor: task.status === 'done' ? '#10b981' : '#d1d5db'}}>
                    {task.status === 'done' && '✓'}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{...S.taskText, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#9ca3af' : '#1f2937'}}>
                      {task.text}
                    </div>
                    <div style={S.taskMeta}>
                      <span style={S.catTag}>{task.cat}</span>
                      <span style={{...S.priority, color: task.priority === 'Critical' ? '#ef4444' : '#6b7280'}}>{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{...S.section, background: '#eff6ff', border: '1px solid #bfdbfe'}}>
            <h2 style={S.secTitle}>💡 نصيحة استراتيجية (Qatar Market)</h2>
            <p style={{fontSize: 14, color: '#1e40af', lineHeight: 1.6}}>
              <b>"التوقيت هو كل شيء":</b> في قطر، يبدأ البحث الفعلي في الأسبوع الأخير من شهر مايو. يجب أن يكون التطبيق جاهزاً تماماً بحلول 15 مايو. ركز حملتك الإعلانية على <b>منطقة "لوسيل" و"الريان" و"الدوحة"</b> للوصول لأعلى كثافة من الطلاب.
            </p>
          </div>
        </div>
      </div>

      <footer style={S.footer}>
        طُوّر هذا المخطط ليكون دليلاً حياً لنمو مشروع "المستشار الجامعي" - 2025
      </footer>
    </div>
  );
};

const S = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' },
  brand: { display: 'flex', gap: '15px', alignItems: 'center' },
  icon: { fontSize: '32px' },
  mainTitle: { fontSize: '24px', margin: 0, color: '#0f172a' },
  subTitle: { fontSize: '14px', margin: 0, color: '#64748b' },
  statusBadge: { background: '#1e293b', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  section: { background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '25px' },
  secHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  secTitle: { fontSize: '18px', margin: 0, color: '#1e293b' },
  tag: { fontSize: '12px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#475569' },
  financialGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  finCard: { padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center' },
  finLabel: { display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '10px' },
  finValue: { fontSize: '28px', fontWeight: 'bold', color: '#0f172a' },
  sliderContainer: { background: '#f8fafc', padding: '20px', borderRadius: '12px' },
  sliderLabel: { display: 'block', marginBottom: '15px', fontSize: '14px' },
  slider: { width: '100%', height: '6px', cursor: 'pointer' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '25px' },
  column: { display: 'flex', flexDirection: 'column' },
  roadmap: { display: 'flex', flexDirection: 'column', gap: '15px' },
  roadItem: { display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #f1f5f9' },
  roadWeek: { width: '40px', height: '40px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px' },
  roadContent: { flex: 1 },
  roadTitle: { fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' },
  roadDesc: { fontSize: '13px', color: '#64748b', lineHeight: 1.4 },
  taskList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  taskItem: { display: 'flex', gap: '15px', padding: '12px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', transition: 'transform 0.2s' },
  check: { width: '22px', height: '22px', border: '2px solid', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', flexShrink: 0 },
  taskText: { fontSize: '14px', fontWeight: '500' },
  taskMeta: { display: 'flex', gap: '10px', marginTop: '6px' },
  catTag: { fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' },
  priority: { fontSize: '10px', fontWeight: 'bold' },
  progressCircle: { width: '45px', height: '45px', border: '4px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },
  kpiList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  footer: { textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#94a3b8' }
};

export default ExecutionPlan;
