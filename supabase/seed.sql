-- ═══════════════════════════════════════════════════════════════════════════
-- Qatar University Advisor — Seed Data v2.0
-- بيانات شاملة ودقيقة — قم بتشغيله بعد schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. الجامعات
-- ─────────────────────────────────────────
INSERT INTO universities (slug, name_ar, name_en, short_name, type, location, website, established_year, language, description_ar, is_active, closing_note) VALUES

-- الجامعات الحكومية
('qu', 'جامعة قطر', 'Qatar University', 'QU', 'public', 'الدوحة', 'https://www.qu.edu.qa', 1973, 'arabic',
 'أكبر وأعرق جامعة حكومية في قطر، تضم أكثر من 20 كلية وتقبل القطريين والمقيمين. تُدرّس بالعربية والإنجليزية.',
 TRUE, NULL),

('hbku', 'جامعة حمد بن خليفة', 'Hamad Bin Khalifa University', 'HBKU', 'public', 'المدينة التعليمية - الدوحة', 'https://www.hbku.edu.qa', 2010, 'english',
 'جامعة بحثية متقدمة في المدينة التعليمية، تقدم برامج الدراسات العليا والبكالوريوس في مجالات متخصصة بمنح كاملة.',
 TRUE, NULL),

('udst', 'جامعة الدوحة للعلوم والتكنولوجيا', 'University of Doha for Science and Technology', 'UDST', 'public', 'الدوحة', 'https://www.udst.edu.qa', 2021, 'english',
 'تحولت من كلية قطر للعلوم والتكنولوجيا (QCST). تقدم 80+ برنامجاً تطبيقياً ومهنياً بدرجات الدبلوم والبكالوريوس.',
 TRUE, NULL),

('lusail', 'جامعة لوسيل', 'Lusail University', 'LU', 'private', 'لوسيل', 'https://www.lu.edu.qa', 2019, 'arabic',
 'جامعة خاصة بالشراكة مع جامعة السوربون، تتخصص في القانون وإدارة الأعمال والعلوم الصحية والهندسة والتصميم.',
 TRUE, NULL),

('ccq', 'كلية المجتمع قطر', 'Community College of Qatar', 'CCQ', 'public', 'الدوحة', 'https://www.ccq.edu.qa', 2010, 'arabic',
 'تقدم برامج الدبلوم في مختلف التخصصات مع إمكانية الانتقال لإكمال البكالوريوس. مجانية للقطريين.',
 TRUE, NULL),

('doha-institute', 'معهد الدوحة للدراسات العليا', 'Doha Institute for Graduate Studies', 'DI', 'private', 'الدوحة', 'https://www.dohainstitute.edu.qa', 2015, 'arabic',
 'يقدم برامج الماجستير في العلوم الاجتماعية والإنسانية والسياسة العامة باللغتين العربية والإنجليزية.',
 TRUE, NULL),

-- المدينة التعليمية (Education City)
('cornell-q', 'جامعة وايل كورنيل للطب', 'Weill Cornell Medicine-Qatar', 'WCM-Q', 'branch', 'المدينة التعليمية', 'https://qatar.weill.cornell.edu', 2002, 'english',
 'الفرع الوحيد لجامعة كورنيل خارج أمريكا. تقدم بكالوريوس علوم طبية سابقة + دكتوراه طب (MD). درجاتها معادلة للأصل.',
 TRUE, NULL),

('cmu-q', 'جامعة كارنيجي ميلون قطر', 'Carnegie Mellon University Qatar', 'CMU-Q', 'branch', 'المدينة التعليمية', 'https://qatar.cmu.edu', 2004, 'english',
 'فرع من أشهر جامعات الحاسوب والأعمال الأمريكية. تقدم علوم الحاسوب والأعمال وتقنية المعلومات والتصميم.',
 TRUE, NULL),

('georgetown-q', 'جامعة جورجتاون قطر', 'Georgetown University in Qatar', 'GU-Q', 'branch', 'المدينة التعليمية', 'https://qatar.georgetown.edu', 2005, 'english',
 'فرع من جامعة جورجتاون الأمريكية. تتخصص في الشؤون الدولية والاقتصاد السياسي والسياسة العامة.',
 TRUE, NULL),

('northwestern-q', 'جامعة نورثوسترن قطر', 'Northwestern University in Qatar', 'NU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.northwestern.edu', 2008, 'english',
 'فرع من جامعة نورثوسترن الأمريكية. تتخصص في الصحافة والإعلام والاتصالات الاستراتيجية.',
 TRUE, NULL),

('vcu-q', 'جامعة فيرجينيا كومنولث قطر', 'Virginia Commonwealth University Qatar', 'VCU-Q', 'branch', 'المدينة التعليمية', 'https://www.vcuarts.qa', 2002, 'english',
 'الجامعة الوحيدة في المنطقة المتخصصة بالكامل في الفنون والتصميم. تقدم الفنون الجميلة والتصميم الداخلي وتصميم الأزياء.',
 TRUE, NULL),

('hec-q', 'مدرسة HEC باريس قطر', 'HEC Paris Qatar', 'HEC-Q', 'branch', 'المدينة التعليمية', 'https://www.hec.qa', 2010, 'english',
 'فرع من أعرق مدارس إدارة الأعمال الفرنسية. تقدم برامج الماجستير والمهنية في إدارة الأعمال والقيادة.',
 TRUE, NULL),

('tamu-q', 'جامعة تكساس إي أند أم قطر', 'Texas A&M University at Qatar', 'TAMU-Q', 'branch', 'المدينة التعليمية', 'https://www.qatar.tamu.edu', 2003, 'english',
 'متخصصة في الهندسة: هندسة البترول، الكيميائية، الميكانيكية، الكهربائية. مقررة الإغلاق عام 2028.',
 FALSE, 'تُغلق عام 2028 ⚠️ — يُنصح بدراسة الوضع قبل التقديم'),

-- الكليات العسكرية والأمنية
('military-staff', 'كلية الأركان', 'Staff College', NULL, 'military', 'الدوحة', NULL, 1975, 'arabic',
 'تابعة لوزارة الدفاع، للضباط القطريين فقط، برامج عسكرية متخصصة.',
 TRUE, NULL),

('police-college', 'كلية الشرطة', 'Police College', NULL, 'military', 'الدوحة', 'https://www.moi.gov.qa', 1980, 'arabic',
 'تابعة لوزارة الداخلية، للذكور القطريين فقط، تخصصات أمن وعلوم جنائية.',
 TRUE, NULL),

('national-defense', 'كلية الدفاع الوطني', 'National Defense College', NULL, 'military', 'الدوحة', NULL, 1990, 'arabic',
 'للضباط القطريين الأكفاء، التخصص في الدراسات الاستراتيجية والأمنية.',
 TRUE, NULL),

('military-tech', 'المعهد العسكري الفني', 'Military Technical Institute', NULL, 'military', 'الدوحة', NULL, 1985, 'arabic',
 'تدريب تقني عسكري لصيانة الأسلحة والمعدات، للذكور القطريين.',
 TRUE, NULL),

-- جامعات أخرى
('cuq', 'جامعة كارديف قطر', 'Cardiff University Qatar', 'CUQ', 'branch', 'الدوحة', 'https://www.cardiff.ac.uk/qatar', 2018, 'english',
 'فرع من جامعة كارديف البريطانية. تقدم برامج الدراسات الدينية الإسلامية.',
 TRUE, NULL),

('barzan', 'أكاديمية برزان', 'Barzan College', NULL, 'vocational', 'الريان', NULL, 2014, 'arabic',
 'أكاديمية تدريب وتطوير مهني، تركز على التدريب اللوجستي والأمني.',
 TRUE, NULL)

ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  closing_note = EXCLUDED.closing_note,
  updated_at = NOW();

-- ─────────────────────────────────────────
-- 2. البرامج الرئيسية
-- ─────────────────────────────────────────
-- جامعة قطر
INSERT INTO programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT u.id, p.name_ar, p.name_en, p.field, p.degree::TEXT, p.duration_years, p.language, p.is_active
FROM universities u
CROSS JOIN (VALUES
  ('الطب البشري', 'Medicine', 'medicine', 'bachelor', 7.0, 'arabic', true),
  ('طب الأسنان', 'Dentistry', 'medicine', 'bachelor', 6.0, 'arabic', true),
  ('الصيدلة', 'Pharmacy', 'medicine', 'bachelor', 5.0, 'arabic', true),
  ('التمريض', 'Nursing', 'medicine', 'bachelor', 4.0, 'arabic', true),
  ('هندسة الحاسوب', 'Computer Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('هندسة الكهرباء والإلكترونيات', 'Electrical Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة الميكانيكية', 'Mechanical Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة المدنية', 'Civil Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة الكيميائية', 'Chemical Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('هندسة البترول', 'Petroleum Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('إدارة الأعمال', 'Business Administration', 'business', 'bachelor', 4.0, 'arabic', true),
  ('المحاسبة', 'Accounting', 'business', 'bachelor', 4.0, 'arabic', true),
  ('التمويل', 'Finance', 'business', 'bachelor', 4.0, 'arabic', true),
  ('التسويق', 'Marketing', 'business', 'bachelor', 4.0, 'arabic', true),
  ('القانون', 'Law', 'law', 'bachelor', 4.0, 'arabic', true),
  ('الشريعة والقانون', 'Sharia and Law', 'law', 'bachelor', 4.0, 'arabic', true),
  ('علوم الحاسوب', 'Computer Science', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الرياضيات', 'Mathematics', 'science', 'bachelor', 4.0, 'arabic', true),
  ('الفيزياء', 'Physics', 'science', 'bachelor', 4.0, 'arabic', true),
  ('الكيمياء', 'Chemistry', 'science', 'bachelor', 4.0, 'arabic', true),
  ('علم الأحياء', 'Biology', 'science', 'bachelor', 4.0, 'arabic', true),
  ('التربية والتعليم', 'Education', 'education', 'bachelor', 4.0, 'arabic', true),
  ('الإعلام والاتصال', 'Media and Communication', 'arts', 'bachelor', 4.0, 'arabic', true),
  ('العلوم الاجتماعية', 'Social Sciences', 'arts', 'bachelor', 4.0, 'arabic', true),
  ('اللغة الإنجليزية وآدابها', 'English Literature', 'arts', 'bachelor', 4.0, 'english', true),
  ('العلوم السياسية', 'Political Science', 'arts', 'bachelor', 4.0, 'arabic', true),
  ('العمارة والتخطيط العمراني', 'Architecture', 'engineering', 'bachelor', 5.0, 'arabic', true),
  ('علوم وتقنية الرياضة', 'Sport Science', 'science', 'bachelor', 4.0, 'arabic', true)
) AS p(name_ar, name_en, field, degree, duration_years, language, is_active)
WHERE u.slug = 'qu'
ON CONFLICT DO NOTHING;

-- كورنيل-قطر
INSERT INTO programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT u.id, p.name_ar, p.name_en, p.field, p.degree::TEXT, p.duration_years, p.language, p.is_active
FROM universities u
CROSS JOIN (VALUES
  ('علوم طبية سابقة', 'Pre-Medical Sciences', 'medicine', 'bachelor', 2.0, 'english', true),
  ('دكتوراه في الطب', 'Doctor of Medicine (MD)', 'medicine', 'bachelor', 4.0, 'english', true)
) AS p(name_ar, name_en, field, degree, duration_years, language, is_active)
WHERE u.slug = 'cornell-q'
ON CONFLICT DO NOTHING;

-- كارنيجي ميلون قطر
INSERT INTO programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT u.id, p.name_ar, p.name_en, p.field, p.degree::TEXT, p.duration_years, p.language, p.is_active
FROM universities u
CROSS JOIN (VALUES
  ('علوم الحاسوب', 'Computer Science', 'engineering', 'bachelor', 4.0, 'english', true),
  ('نظم المعلومات', 'Information Systems', 'engineering', 'bachelor', 4.0, 'english', true),
  ('إدارة الأعمال', 'Business Administration', 'business', 'bachelor', 4.0, 'english', true),
  ('الذكاء الاصطناعي', 'Artificial Intelligence', 'engineering', 'bachelor', 4.0, 'english', true),
  ('علوم الأحياء الحاسوبية', 'Computational Biology', 'science', 'bachelor', 4.0, 'english', true)
) AS p(name_ar, name_en, field, degree, duration_years, language, is_active)
WHERE u.slug = 'cmu-q'
ON CONFLICT DO NOTHING;

-- جورجتاون قطر
INSERT INTO programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT u.id, p.name_ar, p.name_en, p.field, p.degree::TEXT, p.duration_years, p.language, p.is_active
FROM universities u
CROSS JOIN (VALUES
  ('الشؤون الدولية', 'International Affairs', 'arts', 'bachelor', 4.0, 'english', true),
  ('الاقتصاد السياسي', 'Political Economy', 'arts', 'bachelor', 4.0, 'english', true),
  ('العلوم السياسية', 'Political Science', 'arts', 'bachelor', 4.0, 'english', true),
  ('الشؤون الدولية والدراسات الإقليمية', 'Culture and Politics', 'arts', 'bachelor', 4.0, 'english', true)
) AS p(name_ar, name_en, field, degree, duration_years, language, is_active)
WHERE u.slug = 'georgetown-q'
ON CONFLICT DO NOTHING;

-- تكساس أم قطر
INSERT INTO programs (university_id, name_ar, name_en, field, degree, duration_years, language, is_active)
SELECT u.id, p.name_ar, p.name_en, p.field, p.degree::TEXT, p.duration_years, p.language, p.is_active
FROM universities u
CROSS JOIN (VALUES
  ('هندسة البترول', 'Petroleum Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة الكيميائية', 'Chemical Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة الميكانيكية', 'Mechanical Engineering', 'engineering', 'bachelor', 4.0, 'english', true),
  ('الهندسة الكهربائية', 'Electrical Engineering', 'engineering', 'bachelor', 4.0, 'english', false)
) AS p(name_ar, name_en, field, degree, duration_years, language, is_active)
WHERE u.slug = 'tamu-q'
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- 3. شروط القبول
-- ─────────────────────────────────────────
-- جامعة قطر — القطريون
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'qatari', 'all', 60.0, 'الحد الأدنى 60% للتخصصات الأدبية، 70%+ للعلمية، 80%+ للطب والهندسة',
  'علمي أو أدبي حسب التخصص', 'IELTS 5.5 أو TOEFL iBT 61 للتخصصات الإنجليزية',
  'القبول مضمون للقطريين بمعدل 60%+. المعدل العالي يتيح اختيار التخصصات المطلوبة. يتم القبول في ثلاث دورات: أبريل، يونيو، أغسطس.'
FROM universities u WHERE u.slug = 'qu';

-- جامعة قطر — غير القطريين
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'non_qatari', 'all', 80.0, 'الحد الأدنى 80% للتخصصات العلمية، 90%+ للطب والصيدلة وطب الأسنان',
  'علمي أو أدبي حسب التخصص', 'IELTS 5.5 أو TOEFL iBT 61 للتخصصات الإنجليزية',
  'المقاعد للمقيمين محدودة وتنافسية. الأولوية للقطريين. غير القطريين يدفعون رسوماً دراسية.'
FROM universities u WHERE u.slug = 'qu';

-- كورنيل قطر
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'all', 'all', 90.0, 'معدل 90%+ للتقدم، المتميزون فعلياً فوق 95%',
  'علمي فقط', 'SAT 1300+ أو ACT 29+ أو IELTS 7.0',
  'الأصعب قبولاً في قطر. مقابلة شخصية إلزامية. معدل القبول الفعلي أقل من 15%. الدرجات معادلة لكورنيل نيويورك.'
FROM universities u WHERE u.slug = 'cornell-q';

-- كارنيجي ميلون قطر
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'all', 'all', 85.0, 'معدل 85%+ كحد أدنى فعلي، المقبولون عادةً 90%+',
  'علمي لعلوم الحاسوب والذكاء الاصطناعي، الأدبي لإدارة الأعمال', 'SAT 1250+ أو IELTS 6.5',
  'اختبار رياضيات إضافي لتخصصات الحاسوب. الدرجات معادلة لـ CMU بيتسبرغ. منح للمتميزين.'
FROM universities u WHERE u.slug = 'cmu-q';

-- جورجتاون قطر
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'all', 'all', 85.0, 'معدل 85%+ كحد أدنى، المقبولون عادةً 88%+',
  'علمي أو أدبي', 'SAT 1200+ أو IELTS 6.5 أو TOEFL 90',
  'مقالة شخصية وتوصيات إلزامية. يقبل كلا التخصصين. الأولوية لمن لديهم نشاط قيادي.'
FROM universities u WHERE u.slug = 'georgetown-q';

-- نورثوسترن قطر
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'all', 'all', 80.0, 'معدل 80%+ كحد أدنى',
  'علمي أو أدبي', 'IELTS 6.5 أو TOEFL 88',
  'مقالة شخصية وملف إبداعي مطلوب. مناسب للراغبين في الإعلام الرقمي والصحافة الاستقصائية.'
FROM universities u WHERE u.slug = 'northwestern-q';

-- تكساس أم قطر
INSERT INTO admission_requirements (university_id, nationality, gender, min_gpa, min_gpa_note, required_track, english_requirement, notes)
SELECT u.id, 'all', 'all', 80.0, 'معدل 80%+ كحد أدنى',
  'علمي فقط', 'IELTS 6.0 أو TOEFL 79',
  '⚠️ تُغلق عام 2028. ينصح الطلاب الحاليون بالتخطيط للنقل لجامعة أخرى. آخر دفعة قبول 2024.'
FROM universities u WHERE u.slug = 'tamu-q';

-- ─────────────────────────────────────────
-- 4. الرسوم الدراسية
-- ─────────────────────────────────────────
INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'qatari', 0, 0, 'QAR', true, true,
  'مجانية للقطريين + مكافأة شهرية 800-2000 ريال حسب التخصص. يشمل الكتب والأنشطة.'
FROM universities u WHERE u.slug = 'qu';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'non_qatari', 7500, 15000, 'QAR', false, false,
  'للمقيمين: 7500 ريال/فصل للكليات العامة، حتى 15000 ريال/فصل للطب. يُضاف رسم تسجيل 200 ريال.'
FROM universities u WHERE u.slug = 'qu';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'all', 0, 0, 'QAR', true, true,
  'HBKU: منح كاملة تشمل الرسوم + مكافأة شهرية لجميع الجنسيات المقبولة في برامج الدراسات العليا.'
FROM universities u WHERE u.slug = 'hbku';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'all', 15000, 30000, 'QAR', false, true,
  'كورنيل قطر: 15,000-20,000 ريال/فصل. منح جزئية وكاملة متاحة للمتفوقين. المرحلة الطبية أغلى.'
FROM universities u WHERE u.slug = 'cornell-q';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'all', 18000, 36000, 'QAR', false, true,
  'كارنيجي ميلون قطر: حوالي 18,000 ريال/فصل. منح للمتفوقين تصل 50-100% من الرسوم.'
FROM universities u WHERE u.slug = 'cmu-q';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'all', 16000, 32000, 'QAR', false, true,
  'جورجتاون قطر: 16,000 ريال/فصل تقريباً. منح القيادة والتميز متاحة.'
FROM universities u WHERE u.slug = 'georgetown-q';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'qatari', 0, 0, 'QAR', true, true,
  'UDST: مجانية للقطريين في معظم البرامج.'
FROM universities u WHERE u.slug = 'udst';

INSERT INTO tuition_fees (university_id, nationality, amount_per_semester, amount_per_year, currency, is_free_for_qatari, scholarship_available, notes)
SELECT u.id, 'non_qatari', 5000, 10000, 'QAR', false, true,
  'UDST للمقيمين: 5000-8000 ريال/فصل حسب البرنامج.'
FROM universities u WHERE u.slug = 'udst';

-- ─────────────────────────────────────────
-- 5. المنح والابتعاث
-- ─────────────────────────────────────────
INSERT INTO scholarships (name_ar, name_en, provider, sponsor_name, nationality_eligible, gender_eligible, fields_eligible, monthly_allowance, currency, covers_tuition, covers_housing, covers_flights, max_duration_years, bond_years, description_ar, how_to_apply, deadline_note, is_active) VALUES

('البعثة الأميرية', 'Amiri Scholarship', 'government', 'الديوان الأميري القطري', 'qatari', 'all',
 'جميع التخصصات — أفضل جامعات العالم (هارفارد، MIT، أكسفورد، كامبريدج، إلخ)', 0, 'QAR',
 true, true, true, 6, 0,
 'أرفع المنح القطرية. للمتفوقين الاستثنائيين من القطريين. تغطي الرسوم الكاملة + السكن + المعيشة + التذاكر. تُمنح للملتحقين بأفضل 100 جامعة عالمياً.',
 'عبر الديوان الأميري - تقديم ملف الإنجازات الأكاديمية والنشاطات. الاختيار يتم بعد القبول في الجامعة.',
 'طوال العام — متجدد', true),

('برنامج طموح للابتعاث الخارجي', 'Tamim Scholarship - External', 'government', 'وزارة التعليم والتعليم العالي', 'qatari', 'all',
 'جميع التخصصات في أفضل الجامعات العالمية', 22000, 'QAR',
 true, true, true, 5, 5,
 'للقطريين المقبولين في أفضل الجامعات العالمية. أعزب: 22,000 ريال/شهر + رسوم + سكن + تذاكر. متزوج: 25,000 ريال/شهر + مصاريف أسرة إضافية. الالتزام: العمل بالقطاع الحكومي 5 سنوات بعد التخرج.',
 'عبر بوابة وزارة التعليم والتعليم العالي www.edu.gov.qa',
 'يناير - مارس من كل عام', true),

('برنامج الابتعاث الداخلي', 'Internal Scholarship Program', 'government', 'وزارة التعليم والتعليم العالي', 'qatari', 'all',
 'جميع التخصصات في الجامعات القطرية', 2500, 'QAR',
 true, false, false, 6, 3,
 'للقطريين في الجامعات داخل قطر (QU, HBKU, Education City). يشمل: مكافأة شهرية 2000-3000 ريال + رسوم دراسية. الالتزام: 3 سنوات خدمة حكومية بعد التخرج.',
 'عبر بوابة وزارة التعليم والتعليم العالي',
 'مع بداية كل فصل دراسي', true),

('منحة HBKU الشاملة', 'HBKU Full Scholarship', 'university', 'جامعة حمد بن خليفة', 'all', 'all',
 'جميع برامج HBKU (دراسات عليا وبعض البكالوريوس)', 3000, 'QAR',
 true, true, false, 4, 0,
 'لجميع الجنسيات المقبولة في HBKU. تشمل: رسوم مجانية + مكافأة شهرية 3000 ريال + تأمين صحي. لا يشترط التوظيف بعد التخرج.',
 'عبر موقع HBKU مباشرة - مع طلب القبول',
 'فبراير لكل عام', true),

('منحة قطر للطاقة (QatarEnergy)', 'QatarEnergy Scholarship', 'corporate', 'قطر للطاقة', 'qatari', 'all',
 'هندسة البترول، الكيمياء، الميكانيكا، الكهرباء، علوم الحاسوب، إدارة الأعمال', 4000, 'QAR',
 true, false, false, 4, 5,
 'للقطريين في تخصصات الطاقة والهندسة. تشمل: رسوم + مكافأة 4000 ريال/شهر + تدريب صيفي مدفوع. الالتزام: العمل في قطر للطاقة 5 سنوات بعد التخرج.',
 'عبر موقع قطر للطاقة careers.qatarenergy.com',
 'أكتوبر - ديسمبر من كل عام', true),

('منحة الخطوط الجوية القطرية', 'Qatar Airways Scholarship', 'corporate', 'الخطوط الجوية القطرية', 'qatari', 'all',
 'الطيران، هندسة الطيران، إدارة الأعمال، السياحة والضيافة، تقنية المعلومات', 3500, 'QAR',
 true, false, false, 4, 4,
 'للقطريين في تخصصات متعلقة بصناعة الطيران. تشمل: رسوم كاملة + مكافأة شهرية + فرصة توظيف. الالتزام: 4 سنوات مع الخطوط بعد التخرج.',
 'عبر موقع QR Careers careers.qatarairways.com',
 'سبتمبر - نوفمبر سنوياً', true),

('منحة QNB للمتفوقين', 'QNB Excellence Scholarship', 'corporate', 'بنك قطر الوطني', 'qatari', 'all',
 'المحاسبة، التمويل، إدارة الأعمال، الاقتصاد، تقنية المعلومات، الرياضيات', 3000, 'QAR',
 true, false, false, 4, 4,
 'للقطريين المتفوقين في التخصصات المالية والاقتصادية. تشمل: رسوم + مكافأة شهرية + تدريب في QNB. الالتزام: العمل في QNB 4 سنوات.',
 'عبر الموقع الرسمي لبنك QNB - قسم Careers',
 'نوفمبر - يناير', true),

('منحة كهرماء', 'Kahramaa Scholarship', 'corporate', 'المؤسسة القطرية للكهرباء والماء', 'qatari', 'all',
 'الهندسة الكهربائية، الهندسة الميكانيكية، الهندسة المدنية، هندسة المياه، تقنية المعلومات', 3200, 'QAR',
 true, false, false, 4, 5,
 'للقطريين في تخصصات الطاقة والبنية التحتية. تشمل: رسوم + مكافأة 3200 ريال/شهر + تدريب صيفي. الالتزام: 5 سنوات في كهرماء.',
 'عبر الموقع الرسمي لكهرماء www.km.com.qa',
 'ديسمبر - فبراير', true),

('منحة أشغال العامة', 'Ashghal Scholarship', 'corporate', 'هيئة الأشغال العامة', 'qatari', 'all',
 'الهندسة المدنية، هندسة الطرق، هندسة البنية التحتية، إدارة المشاريع', 3000, 'QAR',
 true, false, false, 4, 5,
 'للقطريين في تخصصات البنية التحتية والإنشاءات. تشمل: رسوم + مكافأة شهرية + مشاريع واقعية. الالتزام: 5 سنوات في هيئة الأشغال.',
 'عبر بوابة هيئة الأشغال العامة www.ashghal.gov.qa',
 'أكتوبر - يناير', true),

('منحة ناقلات للغاز والطاقة', 'Nakilat Scholarship', 'corporate', 'شركة قطر للناقلات', 'qatari', 'male',
 'هندسة السفن والبحرية، هندسة الميكانيكا، الكهرباء، اللوجستيات البحرية', 3500, 'QAR',
 true, false, false, 4, 5,
 'للذكور القطريين في التخصصات البحرية. تشمل: رسوم + مكافأة شهرية + تدريب على ناقلات الغاز. الالتزام: 5 سنوات في ناقلات.',
 'عبر الموقع الرسمي nakilat.com',
 'نوفمبر - يناير', true);

-- ─────────────────────────────────────────
-- 6. بيانات الرواتب
-- ─────────────────────────────────────────
INSERT INTO salary_data (field, specialty, nationality, sector, min_salary, max_salary, avg_salary, currency, experience, notes, source) VALUES

-- الطب
('medicine', 'طبيب عام', 'all', 'all', 18000, 30000, 23000, 'QAR', 'fresh',
 'طبيب حديث التخرج يحتاج اجتياز امتحان ترخيص DHP. الراتب يرتفع بعد الاختصاص. معفى من الضريبة.', 'سوق العمل القطري 2024'),

('medicine', 'طبيب متخصص', 'all', 'government', 30000, 55000, 40000, 'QAR', 'mid',
 'الأطباء المتخصصون (قلب، جراحة، أعصاب) هم الأعلى أجراً. مستشفى حمد الطبي يوفر الرواتب الأعلى.', 'سوق العمل القطري 2024'),

('medicine', 'صيدلاني', 'all', 'all', 12000, 22000, 16000, 'QAR', 'fresh',
 'مطلوب ترخيص QCHP. فرص في المستشفيات الحكومية والخاصة والمستودعات الدوائية.', 'سوق العمل القطري 2024'),

('medicine', 'ممرض/ممرضة', 'all', 'government', 8000, 15000, 11000, 'QAR', 'fresh',
 'مطلوب بشكل كبير. المستشفيات الحكومية توفر تأمين سكن وصحة. فرص ترقي ممتازة.', 'سوق العمل القطري 2024'),

('medicine', 'طبيب أسنان', 'all', 'all', 15000, 30000, 20000, 'QAR', 'fresh',
 'عيادات الأسنان الخاصة قد تتجاوز 35000 ريال للمتخصصين. مطلوب ترخيص DHP.', 'سوق العمل القطري 2024'),

-- الهندسة
('engineering', 'مهندس بترول', 'all', 'oil_gas', 20000, 40000, 28000, 'QAR', 'fresh',
 'قطر للطاقة وشل وإكسون موبيل الأعلى أجراً. العلاوات السنوية 10-20%. مزايا إضافية: سكن ونقل وتأمين.', 'سوق العمل القطري 2024'),

('engineering', 'مهندس كيميائي', 'all', 'oil_gas', 16000, 32000, 22000, 'QAR', 'fresh',
 'مطلوب في قطر للطاقة والصناعات البتروكيماوية. فرص الترقي ممتازة مع الخبرة.', 'سوق العمل القطري 2024'),

('engineering', 'مهندس كهربائي', 'all', 'all', 14000, 26000, 18000, 'QAR', 'fresh',
 'مطلوب في كهرماء وأشغال وقطاع الإنشاءات. فرص العمل الأكثر توفراً.', 'سوق العمل القطري 2024'),

('engineering', 'مهندس ميكانيكي', 'all', 'all', 13000, 25000, 18000, 'QAR', 'fresh',
 'شركات النفط والغاز والإنشاءات والتصنيع. المتخصص في HVAC مطلوب جداً.', 'سوق العمل القطري 2024'),

('engineering', 'مهندس مدني', 'all', 'private', 12000, 22000, 16000, 'QAR', 'fresh',
 'مشاريع البنية التحتية القطرية ضخمة. هيئة الأشغال ومشاريع كأس العالم رفعت الطلب.', 'سوق العمل القطري 2024'),

('engineering', 'مهندس حاسوب وبرمجيات', 'all', 'private', 15000, 30000, 20000, 'QAR', 'fresh',
 'الطلب يتصاعد بقوة. شركات التقنية وBanks وQNB وQatarEnergy تدفع أكثر. الذكاء الاصطناعي يرفع الرواتب.', 'سوق العمل القطري 2024'),

-- الأعمال
('business', 'محاسب قانوني', 'all', 'private', 8000, 18000, 12000, 'QAR', 'fresh',
 'حامل شهادة CPA أو ACCA يبدأ من 14000+. شركات الـ Big 4 موجودة في قطر (KPMG، Deloitte، EY، PwC).', 'سوق العمل القطري 2024'),

('business', 'محلل مالي', 'all', 'private', 9000, 20000, 13000, 'QAR', 'fresh',
 'حامل شهادة CFA يبدأ من 18000+. البنوك وشركات الاستثمار تدفع أكثر.', 'سوق العمل القطري 2024'),

('business', 'متخصص تسويق', 'all', 'private', 7000, 16000, 10000, 'QAR', 'fresh',
 'التسويق الرقمي والتسويق عبر السوشيال ميديا الأعلى طلباً. الفريلانسينج خيار جيد.', 'سوق العمل القطري 2024'),

('business', 'مدير مشاريع', 'all', 'all', 15000, 30000, 20000, 'QAR', 'mid',
 'حامل PMP يبدأ من 20000+. مطلوب جداً في مشاريع البنية التحتية. 5+ سنوات خبرة.', 'سوق العمل القطري 2024'),

-- القانون
('law', 'محامٍ', 'all', 'private', 8000, 25000, 14000, 'QAR', 'fresh',
 'الترخيص في قطر يتطلب اجتياز امتحان نقابة المحامين. القطريون لهم أولوية في بعض المحاكم.', 'سوق العمل القطري 2024'),

-- علوم الحاسوب والذكاء الاصطناعي
('engineering', 'مطور برمجيات متكامل', 'all', 'private', 12000, 25000, 17000, 'QAR', 'fresh',
 'الشركات الناشئة ترفع الرواتب + أسهم. React/Python/Cloud skills مطلوبة. العمل عن بُعد يزيد الخيارات.', 'سوق العمل القطري 2024'),

('engineering', 'متخصص ذكاء اصطناعي وبيانات', 'all', 'private', 18000, 35000, 24000, 'QAR', 'fresh',
 'الأسرع نمواً في قطر 2024-2030. QCRI وشركات التقنية والبنوك تدفع الأكثر. Python + ML ضروري.', 'سوق العمل القطري 2024'),

-- الإعلام والاتصال
('arts', 'صحفي/إعلامي', 'all', 'private', 7000, 16000, 10000, 'QAR', 'fresh',
 'Al Jazeera وBeIN Sports أكبر صاحبي عمل في الإعلام. الإعلام الرقمي ينمو بقوة.', 'سوق العمل القطري 2024'),

-- التصميم
('arts', 'مصمم جرافيك وUX', 'all', 'private', 6000, 15000, 9000, 'QAR', 'fresh',
 'الفريلانسينج منتشر. شركات التسويق والإعلانات ووكالات الإبداع. Adobe + Figma أساسي.', 'سوق العمل القطري 2024'),

-- التعليم
('education', 'معلم في المدارس الحكومية', 'qatari', 'government', 10000, 18000, 13000, 'QAR', 'fresh',
 'القطريون لديهم أولوية توظيف في وزارة التعليم. مكافآت إضافية للأداء المتميز.', 'سوق العمل القطري 2024'),

('education', 'معلم في المدارس الدولية', 'all', 'private', 8000, 16000, 11000, 'QAR', 'fresh',
 'المدارس البريطانية والأمريكية تدفع أعلى. غالباً مع سكن أو بدل سكن + تأمين صحي.', 'سوق العمل القطري 2024');

-- ─────────────────────────────────────────
-- 7. قاعدة المعرفة الأولية (knowledge_cache)
-- أسئلة متكررة بإجابات دقيقة ومتحققة
-- ─────────────────────────────────────────
INSERT INTO knowledge_cache (question, question_clean, answer, suggestions, source, is_verified, is_active, quality_score, category) VALUES

-- ───── جامعة قطر ─────
('ما هي شروط القبول في جامعة قطر للقطريين؟',
 'شروط القبول جامعة قطر قطريين',
 'شروط القبول في جامعة قطر للقطريين:

🎓 **الحد الأدنى للمعدل:**
• التخصصات الأدبية والإنسانية: **60%** فأكلر
• التخصصات العلمية والهندسية: **70%** فأكثر
• الطب والصيدلة وطب الأسنان: **80%** فأكثر

📋 **متطلبات إضافية:**
• شهادة الثانوية القطرية أو معادلها
• اجتياز اختبار اللغة (IELTS 5.5 أو TOEFL 61 للتخصصات الإنجليزية)
• بعض التخصصات تشترط المسار العلمي

💡 **مميزات خاصة بالقطريين:**
• القبول **مضمون** بمعدل 60%+
• الدراسة **مجانية** + مكافأة شهرية 800-2000 ريال
• ثلاث دورات قبول: أبريل، يونيو، أغسطس',
 '["شروط القبول للمقيمين في QU", "تخصصات جامعة قطر", "المكافأة الشهرية في QU"]',
 'manual', true, true, 0.97, 'universities'),

('ما هي شروط القبول في كورنيل قطر؟',
 'شروط القبول كورنيل قطر',
 '🏥 **شروط القبول في كورنيل قطر (Weill Cornell Medicine)**

كورنيل هي الأصعب قبولاً في قطر — برنامجها الطبي المرموق يستقطب أفضل الطلاب:

📊 **متطلبات أكاديمية:**
• معدل الثانوية: **90%+ كحد أدنى** (المقبولون فعلياً 93-98%)
• المسار: **علمي فقط** (فيزياء + كيمياء + أحياء ضرورية)
• SAT: 1300+ أو ACT: 29+
• IELTS: 7.0+ أو TOEFL: 100+

📝 **متطلبات إضافية:**
• مقابلة شخصية إلزامية
• خطاب توصية من معلم علوم
• مقال شخصي (Personal Statement)
• أنشطة تطوعية في المجال الطبي مُفضّلة

⏳ **البرنامج:**
• سنتان علوم طبية سابقة ← 4 سنوات MD
• الدرجات معادلة لكورنيل نيويورك 100%
• معدل القبول أقل من **15%**',
 '["شروط كارنيجي ميلون قطر", "رواتب خريجي الطب في قطر", "منح المدينة التعليمية"]',
 'manual', true, true, 0.98, 'universities'),

('ما هو معدل القبول في جامعة قطر للمقيمين؟',
 'معدل قبول جامعة قطر مقيمين غير قطريين',
 '📋 **معدل القبول في جامعة قطر للمقيمين (غير القطريين)**

القبول تنافسي جداً مقارنة بالقطريين:

📊 **الحدود الدنيا للمعدلات:**
• التخصصات الأدبية: **80%** فأكثر
• التخصصات العلمية: **85%** فأكثر
• الهندسة: **85-88%** فأكثر
• الطب والصيدلة: **90%** فأكثر (تنافسي جداً)

⚠️ **تنبيهات مهمة:**
• مقاعد المقيمين **محدودة** والأولوية للقطريين
• قد تمتلئ المقاعد قبل الموعد المعلن
• المعدل لا يضمن القبول — الطاقة الاستيعابية محدودة

💰 **الرسوم للمقيمين:**
• 7,500 - 15,000 ريال/فصل حسب التخصص
• الطب والصيدلة الأغلى',
 '["شروط القبول للمقيمين في HBKU", "رسوم الدراسة للمقيمين", "منح غير القطريين في قطر"]',
 'manual', true, true, 0.96, 'universities'),

-- ───── المنح ─────
('ما هي تفاصيل برنامج طموح للابتعاث الخارجي؟',
 'برنامج طموح ابتعاث خارجي تفاصيل',
 '🌍 **برنامج طموح للابتعاث الخارجي**

أحد أفضل برامج الابتعاث في العالم للقطريين:

💰 **المخصصات المالية الشهرية:**
• أعزب: **22,000 ريال/شهر** + رسوم دراسية + سكن + تذاكر
• متزوج: **25,000 ريال/شهر** + مصاريف الأسرة + تذاكر للجميع
• الأطفال: بدل إضافي لكل طفل

✅ **ما يشمله البرنامج:**
• رسوم دراسية كاملة (بغض النظر عن قيمتها)
• بدل سكن شهري
• تذاكر سفر (ذهاباً وإياباً سنوياً)
• تأمين صحي
• رسوم التأشيرة والإجراءات

📋 **شروط الاستحقاق:**
• جنسية قطرية
• القبول في جامعة مصنفة ضمن أفضل 500 عالمياً (QS أو Times)
• معدل جيد في الثانوية
• التزام بالعودة للعمل في قطر **5 سنوات** بعد التخرج

🔗 **التقديم:** عبر وزارة التعليم والتعليم العالي
📅 **الموعد:** يناير - مارس سنوياً',
 '["برنامج الابتعاث الداخلي", "البعثة الأميرية", "منح قطر للطاقة"]',
 'manual', true, true, 0.98, 'scholarships'),

('ما هي منحة HBKU وهل هي للجميع؟',
 'منحة hbku جامعة حمد بن خليفة جميع الجنسيات',
 '🎓 **منحة HBKU الشاملة — لجميع الجنسيات**

HBKU واحدة من أكرم الجامعات في العالم — تمنح معظم طلابها منحة كاملة:

✅ **ما تشمله المنحة:**
• رسوم دراسية **مجانية** كاملة
• مكافأة شهرية **2,000 - 4,000 ريال** (حسب البرنامج)
• تأمين صحي شامل
• إمكانية الوصول لمرافق المدينة التعليمية

🌍 **من يستحقها؟**
• **جميع الجنسيات** — القطريون والمقيمون والدوليون
• المقبولون في برامج الدراسات العليا أو البكالوريوس
• التميز الأكاديمي شرط للمنح الأعلى قيمة

📚 **البرامج المتاحة:**
• القانون (LLM, JD)
• العلوم والهندسة (MS, PhD)
• السياسة العامة
• الإعلام
• الدراسات الإسلامية

⚠️ **لا يشترط** التوظيف بعد التخرج (خلافاً لمنح الشركات)

📅 **التقديم:** فبراير لكل عام عبر hbku.edu.qa',
 '["برامج HBKU المتاحة", "مقارنة HBKU بجامعة قطر", "شروط القبول في HBKU"]',
 'manual', true, true, 0.97, 'scholarships'),

-- ───── الرواتب ─────
('ما هي رواتب مهندسي البترول في قطر؟',
 'رواتب مهندس بترول قطر',
 '⛽ **رواتب مهندسي البترول في قطر**

هندسة البترول من أعلى التخصصات راتباً في قطر (معفاة من الضريبة):

💰 **جدول الرواتب الشهرية:**
| المستوى | الراتب الأساسي | مع المزايا |
|---------|--------------|-----------|
| حديث التخرج | **20,000 - 25,000 ريال** | حتى 30,000 |
| خبرة 3-7 سنوات | **28,000 - 38,000 ريال** | حتى 45,000 |
| خبرة 10+ سنوات | **40,000 - 60,000 ريال** | حتى 75,000 |

🏢 **أكبر أصحاب العمل:**
• **قطر للطاقة** (الأعلى أجراً) — راتب + سكن + نقل + تأمين
• **شل Shell** — عروض تنافسية جداً
• **إكسون موبيل** — حزم ممتازة
• **توتال إنرجي TotalEnergies**
• **شركة نورث أويل**

🎁 **المزايا الإضافية الشائعة:**
• سكن مجاني أو بدل سكن (3,000-6,000 ريال)
• بدل نقل + سيارة
• تأمين صحي للأسرة
• علاوة سنوية 10-20%
• 30-45 يوم إجازة مدفوعة',
 '["شروط قبول هندسة البترول في قطر", "منحة قطر للطاقة للهندسة", "مقارنة رواتب الهندسة"]',
 'manual', true, true, 0.97, 'salary'),

('ما رواتب خريجي الطب في قطر؟',
 'رواتب خريجي الطب قطر',
 '🏥 **رواتب الأطباء في قطر**

قطر من أعلى دول العالم في رواتب الأطباء (معفاة ضريبياً):

💰 **الرواتب الشهرية حسب المستوى:**
• طبيب حديث تخرج (Resident): **18,000 - 25,000 ريال**
• طبيب عام (General Practitioner): **20,000 - 30,000 ريال**
• طبيب متخصص (Specialist): **30,000 - 50,000 ريال**
• طبيب استشاري (Consultant): **45,000 - 80,000 ريال**

🏥 **أكبر أصحاب العمل:**
• **مستشفى حمد الطبي** (الأعلى + الأكثر مزايا)
• **المستشفى الجامعي للأطفال سدرة**
• **مستشفى الدوحة الخاص**
• **العيادات الخاصة** (أعلى ربحاً للمتخصصين)

📋 **متطلبات للعمل:**
• اجتياز امتحان ترخيص **QCHP** (مجلس الصحة القطري)
• الاعتراف بالجامعة من وزارة الصحة

⚕️ **أعلى التخصصات راتباً:**
جراحة القلب > طب الأعصاب > الجراحة العامة > الأطفال > الأشعة',
 '["شروط القبول في كورنيل قطر", "منح دراسة الطب", "ترخيص الأطباء في قطر"]',
 'manual', true, true, 0.97, 'salary'),

-- ───── الكليات العسكرية ─────
('ما هي الكليات العسكرية في قطر وشروط الالتحاق بها؟',
 'كليات عسكرية قطر شروط قبول',
 '🎖️ **الكليات العسكرية في قطر**

الكليات العسكرية خاصة بالقطريين فقط ولها شروط مختلفة:

🏫 **الكليات الأربع الرئيسية:**

**1. كلية الأركان** (وزارة الدفاع)
• للضباط القطريين العسكريين فقط
• دراسات عسكرية استراتيجية متقدمة

**2. كلية الشرطة** (وزارة الداخلية)
• للذكور القطريين فقط
• تخصصات: أمن، علوم جنائية، إدارة أمنية
• الراتب من أول يوم الالتحاق

**3. كلية الدفاع الوطني**
• للضباط القطريين المتميزين
• دراسات استراتيجية وأمنية عليا

**4. المعهد العسكري الفني**
• للذكور القطريين
• تدريب تقني عسكري (صيانة أسلحة ومعدات)

✅ **الشروط العامة لجميع الكليات:**
• جنسية قطرية (أساسي وغير قابل للتفاوض)
• ذكر (جميع الكليات العسكرية)
• عمر عادةً 17-25 سنة
• لياقة بدنية ممتازة
• سجل جنائي نظيف

📞 **للاستفسار:** وزارة الدفاع أو الداخلية مباشرة',
 '["رواتب الجيش القطري", "مسار الشرطة في قطر", "كليات غير عسكرية للقطريين"]',
 'manual', true, true, 0.95, 'universities'),

-- ───── تكساس أم والإغلاق ─────
('هل جامعة تكساس أم قطر تقفل؟ ماذا أفعل إذا كنت طالباً فيها؟',
 'جامعة تكساس ام قطر اغلاق 2028',
 '⚠️ **جامعة تكساس أم قطر (TAMU-Q) — الإغلاق عام 2028**

نعم، تكساس أم قطر ستُغلق رسمياً عام 2028 بانتهاء اتفاقية مع قطر فاونديشن.

📅 **الجدول الزمني:**
• آخر قبول جديد: 2024-2025
• الإغلاق الكامل: **مايو 2028**
• الطلاب الحاليون: يكملون برامجهم

✅ **خيارات الطلاب الحاليين:**
1. **إكمال الدراسة**: إذا تبقى لك أقل من 4 سنوات
2. **النقل لـ TAMU الأصلي** (تكساس - أمريكا): الأسهل إذا أردت الهجرة للدراسة
3. **النقل لجامعة قطر** (قسم الهندسة): يُتفاوض على معادلة المواد

🎓 **البرامج المتاحة حالياً (تناقصت):**
• هندسة البترول ✅ (مفتوحة)
• الهندسة الكيميائية ✅ (مفتوحة)
• الهندسة الميكانيكية ✅ (مفتوحة)

💡 **نصيحة:**
إذا كنت تفكر في التقديم — لا تتقدم الآن. اختر UDST أو QU بدلاً منها.',
 '["بدائل لهندسة البترول في قطر", "شروط قبول UDST للهندسة", "هندسة البترول في جامعة قطر"]',
 'manual', true, true, 0.98, 'universities'),

-- ───── مقارنات ─────
('ما الفرق بين UDST وجامعة قطر؟',
 'الفرق بين udst وجامعة قطر مقارنة',
 '⚖️ **مقارنة: جامعة الدوحة للعلوم والتكنولوجيا (UDST) vs جامعة قطر (QU)**

| المعيار | UDST | جامعة قطر |
|---------|------|----------|
| **التأسيس** | 2021 (سابقاً QCST) | 1973 |
| **الطابع** | تطبيقي ومهني | أكاديمي وبحثي |
| **اللغة** | إنجليزية | عربية + إنجليزية |
| **عدد البرامج** | 80+ برنامج | 100+ برنامج |
| **الدرجات** | دبلوم وبكالوريوس | بكالوريوس وماجستير ودكتوراه |
| **التدريب العملي** | مكثف جداً | معتدل |
| **الشهادات المهنية** | متكاملة مع الدراسة | منفصلة |
| **القبول للقطريين** | مجاني | مجاني |

✅ **اختر UDST إذا:**
• تريد العمل بعد 2-4 سنوات مباشرة
• تفضل التطبيق العملي على النظري
• مهتم بتقنيات الصناعة والميكانيكا

✅ **اختر QU إذا:**
• تريد الماجستير أو الدكتوراه مستقبلاً
• مهتم بالبحث العلمي
• تريد تخصصات كالطب أو القانون أو العلوم',
 '["برامج UDST المتاحة", "هندسة QU vs هندسة UDST", "فرص العمل لخريجي UDST"]',
 'manual', true, true, 0.96, 'universities'),

-- ───── التخطيط للمستقبل ─────
('ما التخصصات الأفضل في قطر من حيث التوظيف والراتب؟',
 'افضل تخصصات قطر توظيف راتب مستقبل',
 '🏆 **أفضل التخصصات توظيفاً وراتباً في قطر 2024-2030**

مرتبة حسب الراتب + فرص التوظيف + الطلب المستقبلي:

**🥇 الأعلى: 25,000 - 55,000+ ريال**
1. **الطب (تخصص)** — طلب مستمر، نقص حاد
2. **هندسة البترول** — محرك الاقتصاد القطري

**🥈 ممتاز: 18,000 - 35,000 ريال**
3. **الذكاء الاصطناعي وعلوم البيانات** — النمو الأسرع
4. **هندسة الحاسوب والبرمجيات** — طلب متصاعد
5. **الصيدلة** — مطلوب دائماً
6. **الهندسة الكيميائية** — مرتبطة بالطاقة

**🥉 جيد جداً: 12,000 - 22,000 ريال**
7. **المحاسبة + CPA/ACCA** — ثابت ومطلوب
8. **الهندسة الكهربائية/الميكانيكية**
9. **تقنية المعلومات وأمن المعلومات**
10. **القانون** (مع خبرة)

⚡ **تخصصات المستقبل (رؤية 2030):**
• الطاقة المتجددة والهيدروجين
• الاقتصاد الرقمي
• الذكاء الاصطناعي التطبيقي
• الرعاية الصحية الذكية',
 '["رواتب الهندسة تفصيلياً", "رؤية قطر 2030 والتوظيف", "أفضل جامعة للتخصص المطلوب"]',
 'manual', true, true, 0.97, 'salary');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Seed جاهز — البيانات محملة بنجاح
-- ═══════════════════════════════════════════════════════════════════════════
