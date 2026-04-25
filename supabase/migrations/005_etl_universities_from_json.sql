-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 005: ETL universities.json → Supabase
-- Generated: 2026-04-25T23:50:50.575Z
-- Source:    data/universities.json (lastGlobalUpdate: 2026-04-09)
-- Universities: 30
-- Idempotent: ON CONFLICT (slug) DO UPDATE
-- Reference: DEC-AI-001 (Hybrid architecture)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────
-- Universities (UPSERT by slug)
-- ─────────────────────────────────────────

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('qu', 'جامعة قطر', 'Qatar University', 'QU', 'public', 'الدوحة — حي الطريق الغربي', 'https://www.qu.edu.qa', 1977, 'bilingual', 'أكبر حرم جامعي في قطر — يضم مرافق بحثية ومكتبات ومنشآت رياضية وقاعات طعام ومحطة مترو داخلية — السكن: سكن طلابي داخل الحرم مع مواصلات يومية ومرافق خدمية وأمن على مدار الساعة', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('cmu-q', 'جامعة كارنيغي ميلون — قطر', 'Carnegie Mellon University Qatar', 'CMU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.cmu.edu', 2004, 'english', 'حرم جامعي حديث في المدينة التعليمية مع مختبرات تقنية متطورة ومكتبة مشتركة — السكن: سكن طلابي عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('tamu-q', 'جامعة تكساس إي آند إم — قطر', 'Texas A&M University at Qatar', 'TAMU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.tamu.edu', 2003, 'english', 'حرم جامعي هندسي متطور في المدينة التعليمية مع مختبرات بحثية عالمية — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('wcm-q', 'جامعة وايل كورنيل الطبية — قطر', 'Weill Cornell Medicine-Qatar', 'WCM-Q', 'branch', 'المدينة التعليمية', 'https://qatar-weill.cornell.edu', 2001, 'english', 'حرم طبي متطور في المدينة التعليمية مع مرافق سريرية ومختبرات بحثية — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('nu-q', 'جامعة نورث ويسترن — قطر', 'Northwestern University in Qatar', 'NU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.northwestern.edu', 2008, 'english', 'حرم جامعي إعلامي حديث في المدينة التعليمية مع استوديوهات إنتاج ومعامل صحافة رقمية — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('gu-q', 'جامعة جورجتاون — قطر', 'Georgetown University in Qatar', 'GU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.georgetown.edu', 2005, 'english', 'حرم جامعي في المدينة التعليمية — بيئة دولية متعددة الثقافات مع طلاب من 70+ دولة — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('hec-q', 'جامعة HEC باريس — قطر', 'HEC Paris in Qatar', 'HEC-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.exed.hec.edu', 2010, 'english', 'حرم جامعي تنفيذي في المدينة التعليمية — لمحترفي الأعمال', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('hbku', 'جامعة حمد بن خليفة', 'Hamad Bin Khalifa University', 'HBKU', 'public', 'المدينة التعليمية', 'https://www.hbku.edu.qa', 2010, 'english', 'حرم بحثي متطور في المدينة التعليمية — جامعة بحثية رائدة تابعة لمؤسسة قطر — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('udst', 'جامعة الدوحة للعلوم والتكنولوجيا', 'University of Doha for Science and Technology', 'UDST', 'public', 'الدوحة', 'https://www.udst.edu.qa', 2022, 'english', 'أول جامعة وطنية متخصصة في التعليم التطبيقي والتقني والمهني في قطر — السكن: غير متوفر — الجامعة في منطقة حضرية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('lu', 'جامعة لوسيل', 'Lusail University', 'LU', 'private', 'لوسيل، الدوحة', 'https://www.lu.edu.qa', 2020, 'bilingual', 'جامعة خاصة حديثة في مدينة لوسيل المستقبلية — من أسرع الجامعات نمواً في قطر', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('vcu-q', 'جامعة فرجينيا كومنولث للفنون — قطر', 'VCUarts Qatar', 'VCU-Q', 'private', 'المدينة التعليمية', 'https://qatar.vcu.edu', 1998, 'english', 'حرم فني في المدينة التعليمية — يضم مكتبة مواد فريدة (الوحيدة من نوعها في الخليج) مع آلاف العينات من حول العالم — السكن: سكن عبر مؤسسة قطر في المدينة التعليمية', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('ccq', 'كلية المجتمع في قطر', 'Community College of Qatar', 'CCQ', 'public', 'الدوحة', 'https://www.ccq.edu.qa', 2010, 'bilingual', 'كلية مجتمعية حكومية — بوابة مرنة للتعليم العالي ومسار تحويل للجامعات', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('qaa', 'أكاديمية قطر لعلوم الطيران', 'Qatar Aeronautical Academy', 'QAA', 'private', 'مطار الدوحة', 'https://www.qaa.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('abmmc', 'كلية أحمد بن محمد العسكرية', 'Ahmed Bin Mohammed Military College', 'ABMMC', 'military', 'الدوحة', NULL, NULL, 'bilingual', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('police', 'أكاديمية الشرطة', 'Police Academy', 'POLICE', 'private', 'الدوحة', NULL, NULL, 'arabic', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('airforce', 'الكلية الجوية — كلية الزعيم محمد العطية', 'Air Force College', 'AIRFORCE', 'military', 'الدوحة', NULL, NULL, 'bilingual', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('naval', 'الأكاديمية البحرية — أكاديمية الغانم', 'Naval Academy', 'NAVAL', 'military', 'الدوحة', NULL, NULL, 'arabic', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('cyber', 'أكاديمية الأمن السيبراني', 'Cybersecurity Academy', 'CYBER', 'private', 'الدوحة', NULL, NULL, 'arabic', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('doha-institute', 'معهد الدوحة للدراسات العليا', 'Doha Institute for Graduate Studies', 'DOHA-INSTITUTE', 'private', 'الدوحة', 'https://www.dohainstitute.edu.qa', NULL, 'bilingual', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('afg-aberdeen', 'كلية AFG بالتعاون مع جامعة أبردين', 'AFG College with University of Aberdeen', 'AFG-ABERDEEN', 'private', 'مشيرب — الدوحة (+ حرم جديد قيد الإنشاء)', 'https://www.afg.qa', 2017, 'english', 'أول جامعة بريطانية بحرم مستقل في قطر — حرم مشيرب في قلب الدوحة + حرم جديد يستوعب 4000 طالب', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('oryx-ljmu', 'كلية أوريكس العالمية', 'Oryx Universal College with LJMU', 'ORYX-LJMU', 'private', 'الدوحة', 'https://www.oryx.edu.qa', 2020, 'english', 'كلية STEM متخصصة بشراكة مع جامعة ليفربول جون مورز البريطانية — مرخصة من وزارة التعليم', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('ariu', 'كلية الريان الدولية الجامعية', 'Al Rayyan International University College', 'ARIU', 'private', 'الريان', 'https://www.ariu.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('buc', 'كلية برزان الجامعية', 'Barzan University College', 'BUC', 'private', 'الدوحة', 'https://www.buc.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('astate-q', 'جامعة أركنساس ستيت — قطر', 'Arkansas State University Qatar', 'ASTATE-Q', 'branch', 'الدوحة', 'https://www.astateqatar.com', 2017, 'english', 'جامعة أمريكية معتمدة في الدوحة — طلاب من 60+ دولة', TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('cuq-ulster', 'كلية CUQ بالتعاون مع جامعة ألستر', 'CUQ Ulster University', 'CUQ-ULSTER', 'private', 'لوسيل', 'https://www.cuq-ulster.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('mie-sppu', 'معهد MIE بالتعاون مع جامعة بيون — قطر', 'MIE-SPPU Pune University Qatar', 'MIE-SPPU', 'branch', 'الدوحة', 'https://www.miesppu.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('qfba', 'أكاديمية قطر للمال والأعمال', 'QFBA with Northumbria University', 'QFBA', 'private', 'الخليج الغربي — الدوحة', 'https://www.qfba.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('dfi', 'معهد الدوحة للأفلام', 'Doha Film Institute', 'DFI', 'private', 'كتارا — الدوحة', 'https://www.dohafilminstitute.com', NULL, 'bilingual', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('abp', 'البرنامج التأسيسي الأكاديمي', 'Academic Bridge Program', 'ABP', 'private', 'المدينة التعليمية', 'https://www.abp.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

INSERT INTO public.universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note, updated_at)
VALUES ('ufc', 'كلية التأسيس الجامعي', 'University Foundation College', 'UFC', 'private', 'الدوحة', 'https://www.ufc.edu.qa', NULL, 'english', NULL, TRUE, NULL, NOW())
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  short_name = EXCLUDED.short_name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  established_year = COALESCE(EXCLUDED.established_year, universities.established_year),
  language = EXCLUDED.language,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

-- ─────────────────────────────────────────
-- Programs (DELETE+INSERT by university — idempotent reset)
-- ─────────────────────────────────────────
-- Strategy: clear programs for universities present in JSON, then re-insert.
-- This keeps user-customized programs for universities NOT in JSON intact.
DELETE FROM public.programs WHERE university_id IN (
  SELECT id FROM public.universities WHERE slug IN ('qu', 'cmu-q', 'tamu-q', 'wcm-q', 'nu-q', 'gu-q', 'hec-q', 'hbku', 'udst', 'lu', 'vcu-q', 'ccq', 'qaa', 'abmmc', 'police', 'airforce', 'naval', 'cyber', 'doha-institute', 'afg-aberdeen', 'oryx-ljmu', 'ariu', 'buc', 'astate-q', 'cuq-ulster', 'mie-sppu', 'qfba', 'dfi', 'abp', 'ufc')
);

INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'طيار تجاري (CPL) — 18-24 شهر', 'طيار تجاري (CPL) — 18-24 شهر', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qaa';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'صيانة طائرات B1.1 / B2 (~255 ساعة)', 'صيانة طائرات B1.1 / B2 (~255 ساعة)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qaa';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة عسكرية', 'إدارة عسكرية', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abmmc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'نظم معلومات', 'نظم معلومات', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abmmc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'محاسبة', 'محاسبة', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abmmc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'قانون', 'قانون', 'law', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abmmc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'علاقات دولية', 'علاقات دولية', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abmmc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'قانون وعلوم شرطية (4 سنوات)', 'قانون وعلوم شرطية (4 سنوات)', 'law', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'police';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'طيار مقاتل (F-16, Eurofighter Typhoon)', 'طيار مقاتل (F-16, Eurofighter Typhoon)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'airforce';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'طيار نقل / مروحيات', 'طيار نقل / مروحيات', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'airforce';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ضابط رادار وصواريخ', 'ضابط رادار وصواريخ', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'airforce';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ضابط هندسة طيران', 'ضابط هندسة طيران', 'engineering', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'airforce';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ضابط بحري (قيادة سفن حربية)', 'ضابط بحري (قيادة سفن حربية)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'naval';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'خفر السواحل', 'خفر السواحل', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'naval';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مهندس بحري', 'مهندس بحري', 'engineering', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'naval';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'أمن الشبكات (Network Security)', 'أمن الشبكات (Network Security)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cyber';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'اختبار الاختراق (Ethical Hacking / Penetration Testing)', 'اختبار الاختراق (Ethical Hacking / Penetration Testing)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cyber';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'التحليل الجنائي الرقمي (Digital Forensics)', 'التحليل الجنائي الرقمي (Digital Forensics)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cyber';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الاستخبارات السيبرانية (Cyber Intelligence)', 'الاستخبارات السيبرانية (Cyber Intelligence)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cyber';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير في العلوم الاجتماعية', 'ماجستير في العلوم الاجتماعية', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'doha-institute';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير في العلوم الإنسانية', 'ماجستير في العلوم الإنسانية', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'doha-institute';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير في الإدارة العامة', 'ماجستير في الإدارة العامة', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'doha-institute';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'دكتوراه في برامج مختارة', 'دكتوراه في برامج مختارة', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'doha-institute';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة الضيافة الدولية (BA Hons International Hospitality Management)', 'إدارة الضيافة الدولية (BA Hons International Hospitality Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ariu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة السياحة الدولية (BA Hons International Tourism Management)', 'إدارة السياحة الدولية (BA Hons International Tourism Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ariu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة الأعمال الدولية (BSc Hons International Business Management)', 'إدارة الأعمال الدولية (BSc Hons International Business Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ariu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير إدارة السياحة (MSc Tourism Management)', 'ماجستير إدارة السياحة (MSc Tourism Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ariu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير إدارة الأعمال العالمي (MBA Global — شراكة جامعة ديربي)', 'ماجستير إدارة الأعمال العالمي (MBA Global — شراكة جامعة ديربي)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ariu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'علوم الحاسوب (BSc Computer Science — Swinburne)', 'علوم الحاسوب (BSc Computer Science — Swinburne)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'buc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'تكنولوجيا المعلومات (BSc Information Technology — Swinburne)', 'تكنولوجيا المعلومات (BSc Information Technology — Swinburne)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'buc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة الأعمال (Bachelor of Business — Swinburne)', 'إدارة الأعمال (Bachelor of Business — Swinburne)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'buc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الهندسة والبيئة المبنية (Engineering & Built Environment)', 'الهندسة والبيئة المبنية (Engineering & Built Environment)', 'engineering', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'buc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'البرنامج التأسيسي (Pre-University Program)', 'البرنامج التأسيسي (Pre-University Program)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'buc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'العمارة (BSc Architecture)', 'العمارة (BSc Architecture)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'علم النفس (BSc Psychology)', 'علم النفس (BSc Psychology)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الذكاء الاصطناعي (BSc Artificial Intelligence)', 'الذكاء الاصطناعي (BSc Artificial Intelligence)', 'arts', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'إدارة الأعمال (BSc Business Management)', 'إدارة الأعمال (BSc Business Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الأعمال الدولية والحوسبة (BSc Global Business with Computing)', 'الأعمال الدولية والحوسبة (BSc Global Business with Computing)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'القانون (LLB Law)', 'القانون (LLB Law)', 'law', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الهندسة والتكنولوجيا (BEng Engineering & Technology)', 'الهندسة والتكنولوجيا (BEng Engineering & Technology)', 'engineering', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الهندسة الطبية الحيوية (BEng Biomedical Engineering)', 'الهندسة الطبية الحيوية (BEng Biomedical Engineering)', 'medicine', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'علوم الحاسوب (BSc Computer Science)', 'علوم الحاسوب (BSc Computer Science)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'الصناعات الإبداعية (BA Creative Industries)', 'الصناعات الإبداعية (BA Creative Industries)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير إدارة الأعمال (MBA)', 'ماجستير إدارة الأعمال (MBA)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير الذكاء الاصطناعي (MSc Artificial Intelligence)', 'ماجستير الذكاء الاصطناعي (MSc Artificial Intelligence)', 'arts', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير التسويق (MSc Marketing)', 'ماجستير التسويق (MSc Marketing)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير إدارة التعليم (MEd Education Management)', 'ماجستير إدارة التعليم (MEd Education Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير القانون التجاري الدولي (LLM)', 'ماجستير القانون التجاري الدولي (LLM)', 'law', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'cuq-ulster';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس إدارة الأعمال — ريادة الأعمال (BBA Entrepreneurship)', 'بكالوريوس إدارة الأعمال — ريادة الأعمال (BBA Entrepreneurship)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'mie-sppu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس إدارة الأعمال — الإدارة العامة (BBA General Management)', 'بكالوريوس إدارة الأعمال — الإدارة العامة (BBA General Management)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'mie-sppu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس التجارة — المحاسبة الدولية (BCom International Accounting)', 'بكالوريوس التجارة — المحاسبة الدولية (BCom International Accounting)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'mie-sppu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس التجارة — البنوك والتمويل (BCom Banking & Finance)', 'بكالوريوس التجارة — البنوك والتمويل (BCom Banking & Finance)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'mie-sppu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس التربية (B.Ed)', 'بكالوريوس التربية (B.Ed)', 'education', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'mie-sppu';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'بكالوريوس البنوك والتمويل الدولي (BA Hons International Banking & Finance — Northumbria)', 'بكالوريوس البنوك والتمويل الدولي (BA Hons International Banking & Finance — Northumbria)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qfba';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ماجستير المالية (MSc Finance — Northumbria)', 'ماجستير المالية (MSc Finance — Northumbria)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qfba';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'دبلوم في المالية', 'دبلوم في المالية', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qfba';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'برامج تدريب مهنية في القطاع المالي والمصرفي', 'برامج تدريب مهنية في القطاع المالي والمصرفي', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'qfba';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'شهادة الرسوم المتحركة — ToonBoom (Animation Certificate)', 'شهادة الرسوم المتحركة — ToonBoom (Animation Certificate)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'شهادة التصوير السينمائي — بالتعاون مع La Fémis باريس', 'شهادة التصوير السينمائي — بالتعاون مع La Fémis باريس', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'شهادة الرسوم المتحركة — بالتعاون مع Gobelins باريس (9 أشهر)', 'شهادة الرسوم المتحركة — بالتعاون مع Gobelins باريس (9 أشهر)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'ورشة كتابة السيناريو (Screenwriting Lab)', 'ورشة كتابة السيناريو (Screenwriting Lab)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مختبر صناعة الأفلام (Filmmaking Lab)', 'مختبر صناعة الأفلام (Filmmaking Lab)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مختبر المنتجين (Producers Lab)', 'مختبر المنتجين (Producers Lab)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مختبر الأفلام القصيرة (Short Script Lab)', 'مختبر الأفلام القصيرة (Short Script Lab)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'dfi';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'المسار العلمي والتقني (STEM Track)', 'المسار العلمي والتقني (STEM Track)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abp';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مسار العلوم الاجتماعية (Social Sciences Track)', 'مسار العلوم الاجتماعية (Social Sciences Track)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abp';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'مسار الإنسانيات والفنون البصرية (Humanities & Visual Arts Track)', 'مسار الإنسانيات والفنون البصرية (Humanities & Visual Arts Track)', 'arts', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abp';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'اختبار IELTS (مركز اختبار معتمد — أول مركز في المدينة التعليمية)', 'اختبار IELTS (مركز اختبار معتمد — أول مركز في المدينة التعليمية)', 'education', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'abp';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة التأسيسية الدولية — الأعمال (NCUK IFY Business)', 'السنة التأسيسية الدولية — الأعمال (NCUK IFY Business)', 'business', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة التأسيسية الدولية — الهندسة (NCUK IFY Engineering)', 'السنة التأسيسية الدولية — الهندسة (NCUK IFY Engineering)', 'engineering', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة التأسيسية الدولية — العلوم/الطب (NCUK IFY Science/Medicine)', 'السنة التأسيسية الدولية — العلوم/الطب (NCUK IFY Science/Medicine)', 'medicine', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة التأسيسية الدولية — الإنسانيات (NCUK IFY Humanities)', 'السنة التأسيسية الدولية — الإنسانيات (NCUK IFY Humanities)', 'science', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة التأسيسية الدولية — الفن والتصميم (NCUK IFY Art & Design)', 'السنة التأسيسية الدولية — الفن والتصميم (NCUK IFY Art & Design)', 'arts', 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';
INSERT INTO public.programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT id, 'السنة الأولى الدولية (NCUK International Year One — IYOne)', 'السنة الأولى الدولية (NCUK International Year One — IYOne)', NULL, 'bachelor', NULL, 'arabic', TRUE
FROM public.universities WHERE slug = 'ufc';

-- ─────────────────────────────────────────
-- Stats
-- ─────────────────────────────────────────
-- Universities upserted: 30
-- Programs inserted: 74

COMMIT;

-- Verification queries (run manually after):
-- SELECT COUNT(*) FROM universities WHERE is_active = TRUE;  -- expect: 28-30
-- SELECT COUNT(*) FROM programs WHERE is_active = TRUE;       -- expect: 74
-- SELECT slug, name_ar FROM universities ORDER BY name_ar;
✅ ETL Generated:
   Universities: 30
   Programs: 74
