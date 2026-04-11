-- ═══════════════════════════════════════════════════════════════════════════
-- Qatar University Advisor — Supabase Schema v2.0
-- قم بتشغيل هذا الملف في Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS vector; -- فعّلها إذا أردت RAG مستقبلاً

-- ─────────────────────────────────────────
-- 1. المستخدمون
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone               TEXT UNIQUE NOT NULL,
  nationality         TEXT CHECK (nationality IN ('qatari', 'non_qatari', 'unknown')) DEFAULT 'unknown',
  user_type           TEXT CHECK (user_type IN ('STUDENT_HS','STUDENT_PRIVATE','STUDENT_UNI','STUDENT_GRAD','PARENT','GENERAL')) DEFAULT 'GENERAL',
  grade               TEXT,
  track               TEXT,  -- علمي، أدبي، تجاري، تقني
  gpa                 NUMERIC(5,2),
  profile_data        JSONB DEFAULT '{}',          -- ملف المستخدم الكامل (للـ Serverless)
  conversation_stage  TEXT DEFAULT 'STAGE_0',      -- مرحلة المحادثة الحالية
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ DEFAULT NOW(),
  -- PDPPL Compliance (Qatar Law No. 13 of 2016)
  consent_given       BOOLEAN DEFAULT FALSE,
  consent_date        TIMESTAMPTZ,
  data_retention_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 years')
);

-- ─────────────────────────────────────────
-- 2. المحادثات
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message    TEXT NOT NULL,
  source     TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- ─────────────────────────────────────────
-- 3. الجامعات
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS universities (
  id               SERIAL PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,  -- 'qu', 'hbku', 'cornell-q'
  name_ar          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  short_name       TEXT,                  -- QU, HBKU, CMU-Q
  type             TEXT CHECK (type IN ('public','private','branch','military','vocational')),
  location         TEXT DEFAULT 'الدوحة',
  website          TEXT,
  phone            TEXT,
  established_year INT,
  language         TEXT DEFAULT 'arabic', -- arabic, english, bilingual
  description_ar   TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  closing_note     TEXT,                  -- مثل: "تُغلق 2028"
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. البرامج والتخصصات
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id               SERIAL PRIMARY KEY,
  university_id    INT REFERENCES universities(id) ON DELETE CASCADE,
  name_ar          TEXT NOT NULL,
  name_en          TEXT,
  field            TEXT, -- medicine, engineering, business, law, science, arts, education
  degree           TEXT CHECK (degree IN ('diploma','bachelor','master','phd','certificate')),
  duration_years   NUMERIC(3,1),
  language         TEXT DEFAULT 'arabic',
  is_active        BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_programs_university ON programs(university_id);
CREATE INDEX IF NOT EXISTS idx_programs_field ON programs(field);

-- ─────────────────────────────────────────
-- 5. شروط القبول
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admission_requirements (
  id                  SERIAL PRIMARY KEY,
  university_id       INT REFERENCES universities(id) ON DELETE CASCADE,
  program_id          INT REFERENCES programs(id) ON DELETE CASCADE,
  nationality         TEXT DEFAULT 'all' CHECK (nationality IN ('qatari','non_qatari','all')),
  gender              TEXT DEFAULT 'all' CHECK (gender IN ('male','female','all')),
  min_gpa             NUMERIC(5,2),   -- بالنسبة المئوية (مثل 80.0)
  min_gpa_note        TEXT,           -- ملاحظة على المعدل
  required_track      TEXT,           -- علمي، أدبي، أو الاثنان
  english_requirement TEXT,           -- IELTS 6.0, TOEFL 80, ...
  other_requirements  TEXT,
  notes               TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. الرسوم الدراسية
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tuition_fees (
  id                   SERIAL PRIMARY KEY,
  university_id        INT REFERENCES universities(id) ON DELETE CASCADE,
  program_id           INT REFERENCES programs(id) ON DELETE CASCADE,
  nationality          TEXT DEFAULT 'all',
  amount_per_semester  NUMERIC(10,2),
  amount_per_year      NUMERIC(10,2),
  currency             TEXT DEFAULT 'QAR',
  is_free_for_qatari   BOOLEAN DEFAULT FALSE,
  scholarship_available BOOLEAN DEFAULT FALSE,
  notes                TEXT
);

-- ─────────────────────────────────────────
-- 7. المنح والابتعاث
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scholarships (
  id                   SERIAL PRIMARY KEY,
  name_ar              TEXT NOT NULL,
  name_en              TEXT,
  provider             TEXT,  -- government, university, corporate
  sponsor_name         TEXT,
  nationality_eligible TEXT DEFAULT 'qatari', -- qatari, all, gcc
  gender_eligible      TEXT DEFAULT 'all',
  fields_eligible      TEXT,  -- نص حر: "جميع التخصصات" أو "الطب والهندسة"
  monthly_allowance    NUMERIC(10,2),
  currency             TEXT DEFAULT 'QAR',
  covers_tuition       BOOLEAN DEFAULT TRUE,
  covers_housing       BOOLEAN DEFAULT FALSE,
  covers_flights       BOOLEAN DEFAULT FALSE,
  max_duration_years   INT,
  bond_years           INT,  -- سنوات الالتزام بعد التخرج
  description_ar       TEXT,
  how_to_apply         TEXT,
  deadline_note        TEXT,
  is_active            BOOLEAN DEFAULT TRUE,
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 8. الرواتب حسب التخصص
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_data (
  id            SERIAL PRIMARY KEY,
  field         TEXT NOT NULL,
  specialty     TEXT,
  nationality   TEXT DEFAULT 'all',
  sector        TEXT DEFAULT 'all', -- government, private, oil_gas
  min_salary    NUMERIC(10,2),
  max_salary    NUMERIC(10,2),
  avg_salary    NUMERIC(10,2),
  currency      TEXT DEFAULT 'QAR',
  experience    TEXT DEFAULT 'fresh', -- fresh, mid, senior
  notes         TEXT,
  source        TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 9. ⭐ قاعدة المعرفة (الأسئلة والأجوبة)
-- هذا هو قلب النظام — يُخزّن الردود الجيدة
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_cache (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question         TEXT NOT NULL,           -- السؤال الأصلي
  question_clean   TEXT NOT NULL,           -- السؤال بعد التنظيف (lowercase, بدون تشكيل)
  answer           TEXT NOT NULL,           -- الإجابة المحفوظة
  suggestions      JSONB DEFAULT '[]',      -- الاقتراحات ['سؤال 1', 'سؤال 2']
  source           TEXT DEFAULT 'gemini' CHECK (source IN ('gemini','manual','admin')),
  is_verified      BOOLEAN DEFAULT FALSE,   -- راجعه الإدمن وصحّحه
  is_active        BOOLEAN DEFAULT TRUE,    -- هل يُستخدم؟
  use_count        INT DEFAULT 0,           -- كم مرة استُخدم هذا الرد
  quality_score    NUMERIC(3,2) DEFAULT 0.7, -- 0.0 – 1.0
  category         TEXT,                   -- universities, scholarships, salary, ...
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ             -- NULL = لا ينتهي
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_kc_question_clean ON knowledge_cache(question_clean);
CREATE INDEX IF NOT EXISTS idx_kc_category ON knowledge_cache(category);
CREATE INDEX IF NOT EXISTS idx_kc_active_verified ON knowledge_cache(is_active, is_verified);
CREATE INDEX IF NOT EXISTS idx_kc_use_count ON knowledge_cache(use_count DESC);

-- ─────────────────────────────────────────
-- 10. الإحصائيات والتحليلات
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query        TEXT,
  matched_key  TEXT,
  cache_hit    BOOLEAN DEFAULT FALSE,   -- هل جاء الرد من الكاش؟
  source       TEXT DEFAULT 'whatsapp',
  response_ms  INT,                     -- زمن الاستجابة بالمللي ثانية
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_hit ON analytics(cache_hit);

-- ─────────────────────────────────────────
-- 11. المفضلات
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  university_id INT REFERENCES universities(id) ON DELETE CASCADE,
  notes         TEXT,
  added_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, university_id)
);

-- ─────────────────────────────────────────
-- 12. دالة تحديث updated_at تلقائياً
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_kc_updated_at
  BEFORE UPDATE ON knowledge_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- 13. دالة زيادة use_count عند الاستخدام
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_cache_use(cache_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE knowledge_cache
  SET use_count = use_count + 1, updated_at = NOW()
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- 14. Row Level Security (RLS) — أمان البيانات
-- ─────────────────────────────────────────
-- SECURITY (DEC-SEC-002 / Migration 003):
-- PII tables have RLS enabled with NO policies → deny by default for anon.
-- The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely.
-- Reference tables have scoped SELECT-only policies for anon.
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_cache     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites           ENABLE ROW LEVEL SECURITY;

-- PII جداول — لا يوجد policy للـ anon → رفض افتراضي (PDPPL §5.3)
-- الوصول فقط عبر SUPABASE_SERVICE_ROLE_KEY في الـ backend
REVOKE ALL ON users           FROM anon, authenticated;
REVOKE ALL ON conversations   FROM anon, authenticated;
REVOKE ALL ON knowledge_cache FROM anon, authenticated;
REVOKE ALL ON analytics       FROM anon, authenticated;
REVOKE ALL ON favorites       FROM anon, authenticated;

-- الجداول العامة — SELECT فقط للصفوف النشطة
CREATE POLICY "public_read_active_universities" ON universities
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "public_read_active_programs" ON programs
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "public_read_admission_requirements" ON admission_requirements
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "public_read_tuition_fees" ON tuition_fees
  FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "public_read_active_scholarships" ON scholarships
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "public_read_salary_data" ON salary_data
  FOR SELECT TO anon, authenticated USING (TRUE);

-- منح الحد الأدنى من الصلاحيات لجداول المرجعية العامة
GRANT SELECT ON universities            TO anon, authenticated;
GRANT SELECT ON programs                TO anon, authenticated;
GRANT SELECT ON admission_requirements  TO anon, authenticated;
GRANT SELECT ON tuition_fees            TO anon, authenticated;
GRANT SELECT ON scholarships            TO anon, authenticated;
GRANT SELECT ON salary_data             TO anon, authenticated;

-- ─────────────────────────────────────────
-- 15. موافقات المستخدمين (PDPPL Article 7)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  consent_type TEXT NOT NULL DEFAULT 'data_processing',
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  consent_text TEXT DEFAULT 'PDPPL Article 7 — explicit consent for data processing',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one active consent per phone per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_active
  ON user_consents(phone, consent_type)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_consents_phone ON user_consents(phone);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
-- PII — لا policy للـ anon → رفض افتراضي (DEC-SEC-002)
REVOKE ALL ON user_consents FROM anon, authenticated;

-- ─────────────────────────────────────────
-- 16. فهارس إضافية على الجداول الأكاديمية
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_universities_active
  ON universities(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_universities_type
  ON universities(type);
CREATE INDEX IF NOT EXISTS idx_admission_university
  ON admission_requirements(university_id);
CREATE INDEX IF NOT EXISTS idx_admission_gpa
  ON admission_requirements(min_gpa);
CREATE INDEX IF NOT EXISTS idx_tuition_university
  ON tuition_fees(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_active
  ON scholarships(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_salary_field
  ON salary_data(field);
CREATE INDEX IF NOT EXISTS idx_analytics_source
  ON analytics(source);

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Schema جاهز — الخطوة التالية: تشغيل seed.sql
-- ═══════════════════════════════════════════════════════════════════════════
