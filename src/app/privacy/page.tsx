import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Lock,
  Database,
  Eye,
  Clock,
  Users,
  ShieldCheck,
  Mail,
  MessageCircle,
  Globe,
  UserCheck,
  Building2,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | Privacy Policy — Qatar University Advisor",
  description:
    "سياسة الخصوصية لخدمة المستشار الجامعي القطري عبر واتساب — متوافقة مع PDPPL Qatar Law 13/2016 ومتطلبات Meta WhatsApp Business.",
};

const SECTIONS = [
  { id: "intro", title: "مقدمة الخدمة", icon: Shield },
  { id: "controller", title: "محل التحكم بالبيانات", icon: Building2 },
  { id: "whatsapp", title: "بيانات WhatsApp", icon: MessageCircle },
  { id: "data-collected", title: "البيانات المجموعة", icon: Database },
  { id: "lawful-basis", title: "الأساس القانوني", icon: ShieldCheck },
  { id: "processors", title: "المعالجون", icon: Users },
  { id: "retention", title: "فترة الاحتفاظ", icon: Clock },
  { id: "transfer", title: "النقل عبر الحدود", icon: Globe },
  { id: "rights", title: "حقوق صاحب البيانات", icon: ShieldCheck },
  { id: "exercise", title: "ممارسة الحقوق", icon: UserCheck },
  { id: "minors", title: "حماية القاصرين", icon: Shield },
  { id: "security", title: "الأمان", icon: Lock },
  { id: "ncsa", title: "السلطة الرقابية", icon: Eye },
  { id: "contact", title: "التواصل (DPO)", icon: Mail },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Banner */}
        <Card className="bg-maroon-light dark:bg-maroon/10 border-maroon/20">
          <CardContent className="py-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-maroon dark:text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-foreground">
                خدمة مجانية متوافقة مع قانون حماية البيانات الشخصية القطري رقم 13 لسنة 2016 (PDPPL)
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                آخر تحديث: 2026-05-04 • تاريخ النفاذ: 2026-05-04
              </p>
            </div>
          </CardContent>
        </Card>

        {/* TOC */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-maroon dark:text-primary" />
              جدول المحتويات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SECTIONS.map((section, idx) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-maroon dark:hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-muted"
                >
                  <section.icon className="h-3 w-3 shrink-0" />
                  <span>{idx + 1}. {section.title}</span>
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* 1. Intro */}
        <Card id="intro">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-maroon dark:text-primary" />
              1. مقدمة الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              "المستشار الجامعي القطري" (Qatar University Advisor) هو روبوت
              محادثة (Chatbot) يعمل عبر تطبيق <strong>WhatsApp</strong> ويقدّم
              إرشاداً تعليمياً <strong>مجانياً</strong> لطلاب المرحلة الثانوية
              في دولة قطر، لمساعدتهم على اختيار الجامعة والتخصص. الخدمة لا
              تتقاضى أي رسوم، ولا تعرض إعلانات، ولا تبيع منتجات. تشرح هذه
              الوثيقة الأساس القانوني للمعالجة، وفئات البيانات، والمعالجين
              الفرعيين، ومدة الاحتفاظ، وحقوقك بموجب قانون حماية البيانات
              الشخصية القطري (PDPPL — القانون رقم 13 لسنة 2016).
            </p>
          </CardContent>
        </Card>

        {/* 2. Controller */}
        <Card id="controller">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-maroon dark:text-primary" />
              2. محل التحكم بالبيانات (Data Controller)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>الاسم:</strong> سفيان مسيف (مبادرة شخصية تعليمية — Personal Initiative)</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>الصفة:</strong> Data Controller — المتحكم في البيانات</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>البريد:</strong> <a href="mailto:s.mesyef0904@education.qa" className="text-maroon dark:text-primary underline">s.mesyef0904@education.qa</a></li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>مسؤول حماية البيانات (DPO):</strong> سفيان مسيف — تم تعيينه بتاريخ 2026-05-04 (نفس بيانات التواصل أعلاه)</li>
            </ul>
          </CardContent>
        </Card>

        {/* 3. WhatsApp Data — DEDICATED */}
        <Card id="whatsapp" className="border-emerald-300/40 dark:border-emerald-700/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              3. بيانات WhatsApp / WhatsApp Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تُقدَّم الخدمة بالكامل عبر <strong>WhatsApp Business Platform</strong>
              التابعة لـ <strong>Meta Platforms Ireland Limited</strong>. عند
              استخدامك للخدمة، تتم معالجة رسائلك عبر بنية Meta التحتية بصفتها
              <strong> معالج بيانات (Data Processor)</strong> نيابةً عن المتحكم
              المذكور أعلاه. تخضع رسائلك أيضاً لـ
              {" "}
              <a
                href="https://www.whatsapp.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-maroon dark:text-primary underline"
              >
                سياسة خصوصية WhatsApp الرسمية
              </a>.
            </p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>نستقبل عبر WhatsApp Cloud API: رقم هاتفك، محتوى رسائلك النصية، ووسوم البيانات الوصفية (timestamp, message id).</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>المحادثات مشفرة طرف-إلى-طرف بين جهازك وWhatsApp، ثم تُسلَّم إلى خادمنا عبر اتصال HTTPS/TLS مؤمَّن.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>قبل تخزين أي رسالة في قاعدة بياناتنا، تُمرَّر عبر مكتبة <code className="bg-muted px-1 rounded">lib/sanitizer.ts</code> لإزالة المعلومات الشخصية (PII scrubbing): أرقام الهواتف الزائدة، أرقام الهوية، عناوين البريد، إلخ.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>لا نشارك محادثاتك مع جهات إعلانية، ولا نستخدمها لتدريب نماذج ذكاء اصطناعي عامة.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">&#9679;</span>يمكنك الانسحاب فوراً بإرسال كلمة <strong>إلغاء</strong> أو <strong>STOP</strong> في أي محادثة.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 4. Data collected */}
        <Card id="data-collected">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-maroon dark:text-primary" />
              4. البيانات التي نجمعها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>رقم الهاتف</strong> (المعرّف الأساسي للحساب على WhatsApp).</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>محتوى الرسائل</strong> (النصوص التي ترسلها لطرح أسئلتك التعليمية).</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>تضمينات RAG (Embeddings)</strong> — تمثيلات شعاعية لرسائلك لاسترجاع المعلومات الجامعية ذات الصلة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>سجلات الاستعلامات</strong> (Query logs) — لقياس الجودة والأخطاء، بعد إزالة PII عبر <code className="bg-muted px-1 rounded">lib/sanitizer.ts</code>.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>بيانات اختيارية يقدّمها المستخدم طوعاً: المعدل الدراسي، المسار الأكاديمي، الجنسية (لتخصيص التوصية).</li>
            </ul>
          </CardContent>
        </Card>

        {/* 5. Lawful basis */}
        <Card id="lawful-basis">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-maroon dark:text-primary" />
              5. الأساس القانوني للمعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>الموافقة الصريحة</strong> (Explicit Consent) — المادة 7 من PDPPL: تبدأ المعالجة فقط عند بدئك التواصل مع الرقم وقبولك الانضمام عبر "موافق" أو ما يماثلها.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المصلحة المشروعة</strong> (Legitimate Interest) — المادة 5 من PDPPL: للقياس والتحليلات المُجمَّعة وتحسين جودة الخدمة، باستخدام بيانات منزوعة الهوية.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 6. Processors */}
        <Card id="processors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-maroon dark:text-primary" />
              6. المعالجون الفرعيون (Sub-processors)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">
              نستعين بمزوّدي خدمة موثوقين، كلٌّ ملزَم بمعايير حماية معادلة لـ PDPPL ولاتفاقيات معالجة بيانات (DPA) مكتوبة:
            </p>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Meta Platforms Ireland Ltd.</strong> — قناة المراسلة (WhatsApp Cloud API). أيرلندا / الولايات المتحدة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Vercel Inc.</strong> — استضافة التطبيق و Serverless API. الولايات المتحدة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Google LLC</strong> — معالجة الذكاء الاصطناعي عبر Gemini API. الولايات المتحدة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Supabase Inc.</strong> — قاعدة بيانات PostgreSQL وتخزين تضمينات RAG. الولايات المتحدة / الاتحاد الأوروبي.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>Upstash Inc.</strong> — Redis للـ rate limiting و session caching. الولايات المتحدة / الاتحاد الأوروبي.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Retention */}
        <Card id="retention">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-maroon dark:text-primary" />
              7. فترة الاحتفاظ بالبيانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>سجلات المحادثات</strong>: 90 يوماً ثم تُحذف نهائياً.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>التحليلات منزوعة الهوية</strong>: حتى 12 شهراً للأغراض الإحصائية، دون أي ربط برقم هاتف أو هوية.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>سجلات الموافقة (Consent logs)</strong>: تُحفظ طيلة فترة الاستخدام + سنة بعد الإلغاء، للامتثال القانوني.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Cross-border transfer */}
        <Card id="transfer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-maroon dark:text-primary" />
              8. النقل عبر الحدود (المادة 18 PDPPL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              نظراً لاعتمادنا على مزوّدي خدمة سحابية عالميين، تُعالَج بياناتك على
              خوادم في <strong>الولايات المتحدة</strong> و
              <strong> الاتحاد الأوروبي</strong>. نلتزم بمتطلبات المادة 18 من
              PDPPL بشأن نقل البيانات عبر الحدود، وذلك من خلال: (1) اتفاقيات
              معالجة بيانات (DPAs) مكتوبة مع كل مزوّد، (2) تشفير البيانات أثناء
              النقل (TLS 1.2+) وأثناء التخزين، (3) الاعتماد على ضمانات
              تعاقدية معتمدة (SCCs أو ما يعادلها).
            </p>
          </CardContent>
        </Card>

        {/* 9. Rights */}
        <Card id="rights">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-maroon dark:text-primary" />
              9. حقوق صاحب البيانات (المواد 9–14 PDPPL)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>الوصول</strong> — الاطلاع على ما نعالجه عنك.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>التصحيح</strong> — تحديث أي بيانات غير دقيقة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>المحو (الحذف)</strong> — الحق في النسيان.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>التقييد</strong> — تجميد المعالجة في حالات معينة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>الاعتراض</strong> — الاعتراض على المعالجة وسحب الموافقة.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span><strong>قابلية النقل</strong> — استلام بياناتك بصيغة JSON منظَّمة قابلة للقراءة الآلية.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 10. Exercise */}
        <Card id="exercise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-maroon dark:text-primary" />
              10. كيفية ممارسة حقوقك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عبر WhatsApp: أرسل كلمة <strong>إلغاء</strong> أو <strong>STOP</strong> لإيقاف الخدمة وحذف بياناتك خلال 30 يوماً.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>عبر البريد: راسل <a href="mailto:s.mesyef0904@education.qa" className="text-maroon dark:text-primary underline">s.mesyef0904@education.qa</a> مع توضيح الطلب.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>أو من خلال <Link href="/data-rights" className="text-maroon dark:text-primary underline font-bold">صفحة حقوق البيانات</Link>.</li>
              <li className="flex items-start gap-2"><span className="text-maroon dark:text-primary mt-1">&#9679;</span>الرد خلال مدة أقصاها 30 يوماً وفق PDPPL.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 11. Minors */}
        <Card id="minors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-maroon dark:text-primary" />
              11. حماية القاصرين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              الخدمة موجَّهة لطلاب المرحلة الثانوية الذين لا تقل أعمارهم عن
              <strong> 16 عاماً</strong>. ننصح بشدّة أولياء الأمور بمعرفة
              استخدام الطالب للخدمة. لا نطلب أي بيانات حساسة عن القاصرين، ولا
              نستخدم بياناتهم لأي غرض خارج تقديم الإرشاد التعليمي. عند علمنا
              بأن مستخدماً دون 16 عاماً يستخدم الخدمة بدون علم وليّه، نحذف
              بياناته فوراً.
            </p>
          </CardContent>
        </Card>

        {/* 12. Security */}
        <Card id="security">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-maroon dark:text-primary" />
              12. الأمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              نطبّق ضوابط أمنية تقنية وتنظيمية مناسبة: تشفير HTTPS/TLS أثناء
              النقل، Row-Level Security في قاعدة البيانات، فصل صارم بين مفاتيح
              الخدمة (Service Role) والمستخدم النهائي، تنقية PII تلقائية عبر
              <code className="bg-muted px-1 rounded"> lib/sanitizer.ts</code>،
              مراقبة عبر Sentry، وخطة استجابة لإبلاغ السلطة المختصة خلال 72
              ساعة عند أي خرق محتمل (المادة 17 PDPPL).
            </p>
          </CardContent>
        </Card>

        {/* 13. NCSA */}
        <Card id="ncsa">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-maroon dark:text-primary" />
              13. السلطة الرقابية الوطنية (NCSA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              تختص <strong>الوكالة الوطنية للأمن السيبراني (National Cyber
              Security Agency — NCSA)</strong> بدولة قطر بالإشراف على إنفاذ
              قانون PDPPL. يحق لك تقديم شكوى مباشرة إلى NCSA إذا رأيت أن
              معالجة بياناتك تنتهك القانون. الموقع الرسمي:
              {" "}
              <a
                href="https://www.ncsa.gov.qa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-maroon dark:text-primary underline"
              >
                www.ncsa.gov.qa
              </a>.
            </p>
          </CardContent>
        </Card>

        {/* 14. Contact */}
        <Card id="contact">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-maroon dark:text-primary" />
              14. التواصل (Data Controller / DPO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              سفيان مسيف — Data Controller و DPO (مبادرة شخصية)
              <br />
              البريد:{" "}
              <a href="mailto:s.mesyef0904@education.qa" className="text-maroon dark:text-primary underline font-bold">
                s.mesyef0904@education.qa
              </a>
            </p>
          </CardContent>
        </Card>

        {/* English secondary section */}
        <Card id="english" dir="ltr" className="text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-maroon dark:text-primary" />
              English Summary (Secondary)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
            <p>
              <strong>Qatar University Advisor</strong> is a free WhatsApp
              educational chatbot for Qatari high-school students choosing
              universities and majors. The service charges no fees, has no ads,
              and conducts no commerce.
            </p>
            <p>
              <strong>Data Controller &amp; DPO:</strong> Sufyan Mesyef (personal
              initiative). Contact: <a href="mailto:s.mesyef0904@education.qa" className="text-maroon dark:text-primary underline">s.mesyef0904@education.qa</a>.
              DPO designated 2026-05-04.
            </p>
            <p>
              <strong>WhatsApp Data:</strong> the service is delivered through
              WhatsApp Business Platform. Meta Platforms Ireland Limited acts as
              a data processor on behalf of the controller. See WhatsApp&rsquo;s
              own privacy policy for platform-level processing.
            </p>
            <p>
              <strong>Data collected:</strong> phone number, message content,
              RAG embeddings, and PII-scrubbed query logs (scrubbed via
              {" "}<code className="bg-muted px-1 rounded">lib/sanitizer.ts</code>).
            </p>
            <p>
              <strong>Lawful basis:</strong> explicit consent (PDPPL Art. 7) and
              legitimate interest for analytics (PDPPL Art. 5).
            </p>
            <p>
              <strong>Sub-processors:</strong> Meta Platforms Ireland Ltd,
              Vercel Inc, Google LLC (Gemini), Supabase Inc, Upstash Inc.
            </p>
            <p>
              <strong>Retention:</strong> 90 days for chat logs; up to 12 months
              for anonymized analytics; consent logs retained for legal
              compliance.
            </p>
            <p>
              <strong>Cross-border transfer (PDPPL Art. 18):</strong> data is
              processed on US/EU servers under written DPAs and TLS encryption.
            </p>
            <p>
              <strong>Your rights (PDPPL Art. 9–14):</strong> access,
              rectification, erasure, restriction, objection, portability.
              Exercise via the WhatsApp keyword <strong>&quot;إلغاء&quot;</strong> /
              <strong> &quot;STOP&quot;</strong>, or by emailing the controller.
            </p>
            <p>
              <strong>Minors:</strong> the service is intended for users 16+
              with parental awareness.
            </p>
            <p>
              <strong>Supervisory authority:</strong> National Cyber Security
              Agency (NCSA), State of Qatar — <a href="https://www.ncsa.gov.qa" target="_blank" rel="noopener noreferrer" className="text-maroon dark:text-primary underline">www.ncsa.gov.qa</a>.
            </p>
            <p className="text-[11px]">
              Last updated: 2026-05-04 • Effective: 2026-05-04.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
