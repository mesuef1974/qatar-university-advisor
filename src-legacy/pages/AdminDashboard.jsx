import { useState, useEffect, useCallback } from 'react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async (pwd) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${pwd || password}` },
      });
      if (res.status === 401) {
        setError('كلمة المرور غير صحيحة');
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) throw new Error('خطأ في الخادم');
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    await fetchData(password);
  };

  // Auto-refresh كل 60 ثانية
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => fetchData(password), 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchData, password]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      direction: 'rtl',
      padding: '24px',
    },
    card: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      border: '1px solid #334155',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    },
    stat: {
      textAlign: 'center',
      padding: '20px',
    },
    statNum: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#38bdf8',
    },
    statLabel: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      marginTop: '4px',
    },
    badge: (healthy) => ({
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      background: healthy ? '#16a34a22' : '#dc262622',
      color: healthy ? '#4ade80' : '#f87171',
      border: `1px solid ${healthy ? '#4ade80' : '#f87171'}`,
    }),
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #475569',
      background: '#0f172a',
      color: '#f1f5f9',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
      color: 'white',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '12px',
    },
  };

  // شاشة تسجيل الدخول
  if (!isAuthenticated || error === 'كلمة المرور غير صحيحة') {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...styles.card, width: '100%', maxWidth: '400px' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem' }}>🏢 لوحة تحكم المدير</h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '24px', fontSize: '0.875rem' }}>
            المستشار الجامعي القطري — شركة أذكياء للبرمجيات
          </p>
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.875rem' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="أدخل كلمة المرور..."
              required
              autoFocus
            />
            {error && <p style={{ color: '#f87171', marginTop: '8px', fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '⏳ جارٍ التحقق...' : '🔐 دخول'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🏢 لوحة تحكم المدير التنفيذي</h1>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            المستشار الجامعي القطري | شركة أذكياء للبرمجيات
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {lastRefresh && (
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
              آخر تحديث: {lastRefresh.toLocaleTimeString('ar')}
            </span>
          )}
          <button
            onClick={() => fetchData(password)}
            disabled={loading}
            style={{ ...styles.button, width: 'auto', padding: '8px 16px', fontSize: '0.875rem', marginTop: 0 }}
          >
            {loading ? '⏳' : '🔄 تحديث'}
          </button>
        </div>
      </div>

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>⏳ جارٍ تحميل البيانات...</div>
      )}

      {data && (
        <>
          {/* إحصاءات عامة */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'إجمالي المستخدمين', value: data.stats?.totalUsers?.toLocaleString('ar') || '0', icon: '👥' },
              { label: 'إجمالي الرسائل', value: data.stats?.totalMessages?.toLocaleString('ar') || '0', icon: '💬' },
              { label: 'إجمالي الاستعلامات', value: data.stats?.totalQueries?.toLocaleString('ar') || '0', icon: '🔍' },
            ].map((s) => (
              <div key={s.label} style={styles.card}>
                <div style={styles.stat}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={styles.statNum}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* حالة الخدمات */}
          <div style={styles.card}>
            <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '16px' }}>🚦 حالة الخدمات</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {data.botStatus && Object.entries(data.botStatus).map(([service, status]) => (
                <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f172a', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                    {service === 'vercel' ? '☁️ Vercel' :
                     service === 'whatsapp' ? '📱 WhatsApp' :
                     service === 'claude' ? '🤖 Claude' :
                     '🗄️ Supabase'}
                  </span>
                  <span style={styles.badge(status === 'operational')}>
                    {status === 'operational' ? '✅ يعمل' : '⚠️ متعطل'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Circuit Breaker */}
          {data.circuitStatus && (
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '16px' }}>⚡ Circuit Breaker — Supabase</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'الحالة', value: data.circuitStatus.state === 'CLOSED' ? '🟢 مغلق (طبيعي)' : data.circuitStatus.state === 'OPEN' ? '🔴 مفتوح (متعطل)' : '🟡 نصف مفتوح (اختبار)' },
                  { label: 'عدد الأخطاء', value: `${data.circuitStatus.failureCount} / 3` },
                  { label: 'صحة الاتصال', value: data.circuitStatus.isHealthy ? '✅ سليم' : '❌ متعطل' },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '12px 16px', background: '#0f172a', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* أكثر الأسئلة تكراراً */}
          {data.topQueries && data.topQueries.length > 0 && (
            <div style={styles.card}>
              <h2 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '16px' }}>📊 أكثر الأسئلة تكراراً</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.topQueries.slice(0, 10).map((q, i) => (
                  <div key={q.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: '#0f172a', borderRadius: '8px' }}>
                    <span style={{ color: '#64748b', minWidth: '28px', fontSize: '0.875rem' }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontSize: '0.875rem', color: '#cbd5e1' }}>{q.key}</span>
                    <span style={{ background: '#0ea5e922', color: '#38bdf8', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {q.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '24px' }}>
        شركة أذكياء للبرمجيات | FAANG Standards | {new Date().getFullYear()}
      </div>
    </div>
  );
}
